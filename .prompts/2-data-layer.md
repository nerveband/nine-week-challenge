# Phase 2: Data Layer Transformation

## Existing Data Patterns
```typescript:src/services/DatabaseService.ts
startLine: 8
endLine: 19
```
- Repository pattern with IndexedDB backend
- Direct localStorage access for session persistence
- Complex query handling through Dexie operators

## Migration Rules
1. **Data Access Reformation**
   - Convert all `db.[collection].*` calls to PB repository methods
   - Implement PB query builder pattern for complex filters
   - Maintain TypeScript interface compatibility

2. **Storage Isolation**
   - Eliminate localStorage usage (32 instances across 12 files)
   - Implement PB auth store synchronization

3. **Transaction Handling**
   - Convert Dexie transactions to PB batch operations
   - Implement retry logic for PB optimistic locking

## Implementation Guide
1. Repository Pattern Update
```typescript
// BEFORE: IndexedDB access
const profile = await db.userProfiles.get(id);

// AFTER: PocketBase repository
class UserProfileRepository extends BaseRepository<UserProfile> {
  constructor() {
    super('userProfiles');
  }
  
  async getCurrent(): Promise<UserProfile | null> {
    return this.pb.collection('userProfiles')
      .getFirstListItem(`user = "${this.userId}"`);
  }
}
```

2. Query Conversion Table
| Dexie Operation | PocketBase Equivalent         |
|-----------------|-------------------------------|
| .where()        | .filter()                     |
| .anyOf()        | .filter("field ?~ ${values}") |
| .offset()       | .skip()                       |
| .limit()        | .perPage()                    |

## Validation Matrix
1. CRUD Operation Audit
```typescript
const testEntity = await repository.create(sampleData);
const fetchedEntity = await repository.get(testEntity.id);
await repository.update(testEntity.id, updatedData);
await repository.delete(testEntity.id);
```

2. Data Type Consistency Check
```typescript
const pbRecord = await pb.collection('userProfiles').getFirstListItem('');
typeAssert<UserProfile>(pbRecord);
```

3. Performance Benchmark
```bash
# Pre-migration query: 120-150ms
# Post-migration target: <200ms with PB cache
``` 