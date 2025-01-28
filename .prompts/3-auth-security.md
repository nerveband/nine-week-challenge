# Phase 3: Authentication Reconstruction

## Current Auth Flow
```typescript:src/components/providers/AuthProvider.tsx
startLine: 23
endLine: 37
```
- localStorage session persistence
- Basic email/password implementation
- No MFA or session refresh

## Security Requirements
1. **Defense-in-Depth Implementation**
   - PB collection rules for all data access
   - Rate limiting (10 req/min per endpoint)
   - Audit logging for admin actions

2. **Credential Management**
   - PB email templates for verification/password reset
   - Session token rotation every 15 minutes
   - Strict CORS policies for API endpoints

3. **Access Control**
   ```typescript
   // Admin-only access pattern
   async function adminEndpoint(user: User) {
     if (!user.isAdmin) {
      console.log('Auth state changed:', this.pb.authStore.isValid);
      if (this.pb.authStore.isValid && token) {
        // Ensure token is refreshed before it expires
        const tokenData = this.pb.authStore.exportToCookie();
        const expirationTime = new Date(tokenData.split(';')[1].split('=')[1]).getTime();
        const currentTime = new Date().getTime();
        const timeUntilExpiration = expirationTime - currentTime;
        
        // Refresh token 5 minutes before it expires
        if (timeUntilExpiration > 0 && timeUntilExpiration < 300000) {
          this.pb.collection('users').authRefresh();
        }
      }
    });
  }
```

- Current auth store implementation lacks:
  - Token rotation
  - Session invalidation
  - Device fingerprinting
  - Refresh token handling

## Implementation Requirements

1. **Session Management Overhaul**
```typescript
// Auth service hardening
class HardenedAuthService {
  private async rotateTokens() {
    if (this.lastRefresh < Date.now() - 900000) { // 15m rotation
      await this.client.collection('users').authRefresh();
      this.lastRefresh = Date.now();
    }
  }

  async sensitiveOperation() {
    await this.rotateTokens();
    // Proceed with operation
  }
}
```

2. **Collection Rule Enforcement**
```bash
# Apply strict access rules
npx ts-node scripts/update-collection-rules.ts
```

```14:33:scripts/update-collection-rules.ts
        await pb.collections.update('userProfiles', {
            listRule: "@request.auth.id != ''",
            viewRule: "@request.auth.id != '' && id = @request.auth.id",
            createRule: "@request.auth.id != '' && id = @request.auth.id",
            updateRule: "@request.auth.id != '' && id = @request.auth.id",
            deleteRule: "@request.auth.id != '' && id = @request.auth.id"
        });
        console.log('✅ Updated userProfiles collection rules');

        // Update other collections
        const collections = ['dailyTracking', 'measurements', 'weeklySummaries'];
        const commonRules = {
            listRule: "@request.auth.id != ''",
            viewRule: "@request.auth.id != '' && userId = @request.auth.id",
            createRule: "@request.auth.id != ''",
            updateRule: "@request.auth.id != '' && userId = @request.auth.id",
            deleteRule: "@request.auth.id != '' && userId = @request.auth.id"
        };

        for (const collection of collections) {
```


3. **Rate Limiting Configuration**
```yaml
# pocketbase/pocketbase.yml
rateLimits:
  auth:
    capacity: 10
    fillRate: 1m
  api:
    capacity: 100  
    fillRate: 5m
```

## Validation Protocol

1. **Brute Force Test**
```bash
siege -c 25 -t 1M http://localhost:8090/api/collections/users/auth-with-password
# Verify 429 responses after 10 attempts
```

2. **Session Integrity Check**
```typescript
const session1 = await pb.authStore.exportToCookie();
await pb.authRefresh();
const session2 = await pb.authStore.exportToCookie();
if (session1 === session2) throw new Error('Token rotation failure');
```

3. **Access Control Verification**
```typescript
// Should throw 403 Forbidden
await pb.collection('userProfiles').create({
  user: 'another_users_id',
  name: 'Illegal Profile' 
});
```