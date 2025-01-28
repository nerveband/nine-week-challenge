# Phase 5: Deployment Preparation

## Critical Actions
1. **Docker Setup**
   ```dockerfile
   # pocketbase/Dockerfile
   FROM alpine:latest
   COPY pocketbase /usr/local/bin/
   CMD ["pocketbase", "serve"]
   ```

2. **Monitoring**
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

## Verification
```typescript
// smoke-test.ts
export async function verifyDeployment() {
  const res = await fetch('/health')
  if (res.status !== 200) throw new Error('Deployment check failed')
}