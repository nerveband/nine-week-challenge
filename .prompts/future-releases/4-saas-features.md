# Phase 4: SaaS Foundation Implementation

## Current Limitations
```typescript:src/types/index.ts
startLine: 45
endLine: 52
```
- Single-tenant architecture
- No subscription tracking
- Missing billing integration
- No team/organization support

## Core Requirements

1. **Multi-Tenant Isolation**
```typescript
// Organization context integration
interface Organization {
  id: string
  name: string
  members: string[] // User IDs
  subscriptionId: string
}

// All collections gain orgId field
type SaasAwareEntity = T & {
  orgId: string
  createdBy: string 
}
```

2. **Subscription Lifecycle Management**
```typescript
// Subscription state machine
class SubscriptionService {
  private states = {
    trial: ['active', 'canceled'],
    active: ['paused', 'canceled'],
    paused: ['active', 'canceled']
  };

  async transition(subscriptionId: string, newState: SubscriptionState) {
    // Validate state transition
  }
}
```

## Implementation Strategy

1. **Database Schema Additions**
```json
{
  "collections": [
    {
      "name": "organizations",
      "schema": [
        {"name": "name", "type": "text"},
        {"name": "owner", "type": "relation"}
      ]
    },
    {
      "name": "subscriptions",
      "schema": [
        {"name": "status", "type": "text"},
        {"name": "plan", "type": "json"}
      ]
    }
  ]
}
```

2. **Billing Integration**
```typescript
interface StripeWebhookHandler {
  handleEvent(event: Stripe.Event) {
    switch(event.type) {
      case 'invoice.paid':
        this.extendSubscription();
        break;
      case 'invoice.payment_failed':
        this.notifyPaymentFailure();
        break;
    }
  }
}
```

## Validation Checklist

1. **Tenant Isolation Test**
```typescript
const orgA = await createOrganization('OrgA');
const orgB = await createOrganization('OrgB');

// Should only return OrgA's data
const orgAData = await pb.collection('measurements')
  .getFullList({ filter: `orgId = "${orgA.id}"` });
```

2. **Subscription State Validation**
```typescript
await subService.transition('trial', 'active');
await expect(() => 
  subService.transition('active', 'trial')
).toThrow('Invalid state transition');
```

3. **Billing Webhook Verification**
```bash
stripe trigger invoice.paid
# Verify subscription extended in PocketBase
``` 