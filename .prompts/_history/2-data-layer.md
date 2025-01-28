# Phase 2: Data Layer Migration

## Critical Actions
1. **Implement Repositories**
   ```typescript
   // repositories/PocketBaseRepository.ts
   export abstract class PocketBaseRepository<T> {
     constructor(protected collectionName: string) {}
     
     async create(data: Omit<T, 'id'>) {
       return pocketBaseService.client
         .collection(this.collectionName)
         .create(data)
     }
   }
   ```

2. **Update Data Service**
   ```typescript
   // services/DatabaseService.ts
   export class DatabaseService {
     private userProfileRepo = new UserProfileRepository()
     
     async getUserProfile() {
       return this.userProfileRepo.getCurrent()
     }
   }
   ```

## Verification
```typescript
// smoke-test.ts
export async function verifyDataLayer() {
  const testData = { name: 'Test Profile' }
  const created = await databaseService.createUserProfile(testData)
  if (!created?.id) throw new Error('Data layer failure')
  await databaseService.deleteUserProfile(created.id)
}