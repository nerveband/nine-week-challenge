# Phase 1: Core Infrastructure Setup

## Critical Actions
1. **Remove IndexedDB**
   - Delete `src/database/FatLossDB.ts`
   - Remove Dexie.js dependency
   - Purge all `db.*` references

2. **Initialize PocketBase**
   ```bash
   npm install pocketbase
   mkdir -p pocketbase/migrations
   ```

3. **Base Collections**
   ```typescript
   // schema/pb_schema.json
   {
     "collections": [
       {
         "name": "users",
         "type": "auth",
         "schema": [
           { "name": "name", "type": "text", "required": true }
         ]
       },
       {
         "name": "userProfiles",
         "schema": [
           { "name": "user", "type": "relation", "required": true }
         ]
       }
     ]
   }
   ```

## Verification
```typescript
// smoke-test.ts
import { pocketBaseService } from '@/services/PocketBaseService'

export async function verifyCoreSetup() {
  try {
    await pocketBaseService.client.health.check()
    const collections = await pocketBaseService.client.collections.getFullList()
    if (!collections.some(c => c.name === 'users')) {
      throw new Error('Base collections not initialized')
    }
    return true
  } catch (error) {
    process.exit(1)
  }
}