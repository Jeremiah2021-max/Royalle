---
name: Cart hook API
description: CartContextType interface — correct method and field names
---

## Rule
The cart hook (`artifacts/ghana-shop/src/hooks/use-cart.tsx`) exposes `addToCart` (not `addItem`). CartItem structure requires `productId`, `productName`, `imageUrl`, `quantity`, `unitPrice` (not `id`, `name`, `price`).

**Why:** The hook was implemented with specific field naming that differs from what some auto-generated code might assume.

**How to apply:**
- `const { addToCart, cartCount, items, cartTotal, clearCart, removeFromCart, updateQuantity } = useCart()`
- `addToCart({ productId, productName, imageUrl, quantity, unitPrice })`
- CartItem.unitPrice (not .price), CartItem.productId (not .id), CartItem.productName (not .name)
