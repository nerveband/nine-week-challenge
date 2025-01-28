 # Phase 1: Core Infrastructure Overhaul

## Current Architecture
```typescript:src/database/FatLossDB.ts
startLine: 1
endLine: 31
```
- Dexie.js wrapper around IndexedDB
- Contains 5 core tables with relational indexes
- Schema versioning through Dexie migrations

## Critical Actions
1. **Eradicate IndexedDB Dependencies**
   - Surgical Removal:
     - Delete `src/database/FatLossDB.ts` and all related migration files
     - Remove Dexie.js package reference from package.json
     - Purge all `db.*` method calls (87 instances across 23 files)

2. **PocketBase Foundation**
   ```bash
   # Install PocketBase client
   npm install pocketbase @types/pocketbase --save-exact
   
   # Initialize PB directory structure
   mkdir -p pocketbase/{migrations,logs,backups}
   ```

3. **Schema Alignment**
   - Preserve existing TypeScript interfaces from:
   ```typescript:src/types/index.ts
   startLine: 15
   endLine: 94
   ```
   - Map to PocketBase collections maintaining:
     - Field names
     - Data types
     - Relation constraints

## Verification Protocol
1. IndexedDB Absence Check
```typescript
// Verify Dexie removal
try {
  const db = require('../database/FatLossDB');
  throw new Error('IndexedDB remnants detected!');
} catch (e) {
  // Expected failure
}
```

2. PocketBase Health Check
```bash
curl -I http://localhost:8090/api/health
# Expect 200 OK response
```

3. Schema Validation
```typescript
const requiredCollections = ['users', 'userProfiles', 'dailyTracking'];
const pbCollections = await pb.collections.getFullList();
requiredCollections.forEach(c => {
  if (!pbCollections.some(col => col.name === c)) {
    throw new Error(`Missing collection: ${c}`);
  }
});
```