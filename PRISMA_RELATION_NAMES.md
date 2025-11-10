# Nombres CORRECTOS de Relaciones en Prisma

## Model: Order
- `Address` (singular) - Address?
- `DiscountCode` (singular) - DiscountCode?
- `User` (singular) - User
- `OrderItem` (singular) - OrderItem[]
- `Payment` (singular) - Payment[]
- `Refund` (singular) - Refund?

## Model: Product
- `orders` (minúscula plural) - OrderItem[]
- `brand` (minúscula) - Brand
- `categories` (minúscula plural) - Category[]
- `categoryItem` (minúscula) - CategoryItem?

## Model: User
- `Address` (singular) - Address[]
- `Cart` (singular) - Cart?
- `Order` (singular) - Order[]
- `Payment` (singular) - Payment[]
- `Product` (singular, Wishlist) - Product[]

## Model: Payment
- `Order` (singular) - Order
- `PaymentProvider` (singular) - PaymentProvider
- `User` (singular) - User

---

## Resumen de Cambios Necesarios:

### En Order includes:
```typescript
{
  Address: true,          // ✅ Correcto
  DiscountCode: true,     // ✅ Correcto
  User: true,             // ✅ Correcto
  OrderItem: true,        // ✅ Correcto
  Payment: true,          // ✅ Correcto
  Refund: true,           // ✅ Correcto
}
```

### En Product includes:
```typescript
{
  orders: true,           // ✅ Correcto (minúscula!)
  brand: true,            // ✅ Correcto (minúscula!)
  categories: true,       // ✅ Correcto (minúscula!)
  categoryItem: true,     // ✅ Correcto (minúscula!)
}
```

### En User includes:
```typescript
{
  Address: true,          // ✅ Correcto
  Order: true,            // ✅ Correcto
  Payment: true,          // ✅ Correcto
  Product: true,          // ✅ Correcto (Wishlist)
}
```

### En Payment includes:
```typescript
{
  Order: true,            // ✅ Correcto
  PaymentProvider: true,  // ✅ Correcto
  User: true,             // ✅ Correcto
}
```
