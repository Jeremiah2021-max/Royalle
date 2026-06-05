---
name: useVerifyPayment is a query
description: useVerifyPayment is a GET query hook, not a mutation
---

## Rule
`useVerifyPayment` from `@workspace/api-client-react` is a **query hook** (GET /payments/verify/:reference), not a mutation. It takes `(reference: string, options?)` as arguments.

**Why:** The OpenAPI spec defines verify-payment as a GET endpoint with reference as a path param.

**How to apply:**
```tsx
const { data: verifyData, isLoading, isError } = useVerifyPayment(reference, {
  query: { enabled: !!reference } as any,
});
// Use useEffect to react to verifyData.status === "success"
```
- Do NOT call `verifyPayment.mutateAsync(...)` — it won't exist
- The `as any` cast is needed because UseQueryOptions requires `queryKey` which the hook provides internally
