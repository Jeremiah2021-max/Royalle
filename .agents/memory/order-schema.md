---
name: Order schema field names
description: Canonical field names for orders in DB, API spec, and frontend
---

## Rule
The DB columns and OpenAPI Order/OrderInput schemas use `city` and `region` (NOT `deliveryCity`/`deliveryRegion`). The payment status enum is `"pending" | "paid" | "failed"` (NOT "success").

**Why:** The DB schema was created with `city` and `region` as column names. The checkout form uses `deliveryCity`/`deliveryRegion` as form field labels but maps them to `city`/`region` when calling the API.

**How to apply:**
- When displaying `order.city` and `order.region` (not `.deliveryCity`/`.deliveryRegion`)
- When checking payment success: `order.paymentStatus === "paid"` (not `=== "success"`)
- Checkout form maps: `city: values.deliveryCity`, `region: values.deliveryRegion`
- OrderStatusUpdate dropdown values: "pending", "paid", "failed"
- PaymentInit requires `orderId: number` (integer, required field)
