# Product Flow Analysis & Implementation Plan

## Executive Summary
This document traces the complete product creation flow from database to frontend display and provides an implementation plan for:
1. Separating customizable products into their own carousel
2. Enhancing product cards to display all available data and photos

---

## Current System Architecture

### Database Schema (Prisma)

**Product Model** (Both Admin & Storefront schemas are identical):
```prisma
model Product {
  id             String   @id @default(cuid())
  title          String
  description    String?
  images         String[]  // Array of image URLs
  keywords       String[]
  metadata       Json?
  
  price          Float    @default(100)
  discount       Float    @default(0)
  stock          Int      @default(0)
  
  weight         Float?
  width          Float?
  height         Float?
  length         Float?
  
  isPhysical     Boolean  @default(true)
  isAvailable    Boolean  @default(false)
  isFeatured     Boolean  @default(false)
  isArchived     Boolean  @default(false)
  isCustomizable Boolean  @default(true)  // ⭐ KEY FIELD
  
  brand          Brand    @relation(...)
  brandId        String
  categories     Category[]
  categoryItem   CategoryItem?
  categoryItemId String?
  
  // Relations
  orders         OrderItem[]
  cartItems      CartItem[]
  wishlists      User[]
  productReviews ProductReview[]
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## Product Creation Flow

### 1. Admin Panel - Product Creation
**Location**: `/apps/admin/src/app/(dashboard)/(routes)/products/[productId]/components/product-form.tsx`

**Form Fields**:
- Basic Info: `title`, `price`, `discount`, `stock`
- Dimensions: `weight`, `width`, `height`, `length`
- Relations: `categoryId`, `brandId`, `categoryItemId`
- Flags: `isCustomizable`, `isFeatured`, `isAvailable`
- Media: `images[]` (multiple images via Cloudinary)

**API Endpoint**: 
- POST `/api/products` (create)
- PATCH `/api/products/[productId]` (update)

**Key Feature**: The `isCustomizable` checkbox determines if a product can be customized by customers.

### 2. Database Storage
Products are stored in PostgreSQL via Prisma ORM with:
- Multiple images stored as string array
- Boolean flag `isCustomizable` (defaults to `true`)
- Relations to Brand, Category, and CategoryItem

### 3. Storefront Display

#### Homepage (`/apps/storefront/src/app/(store)/(routes)/page.tsx`)
```typescript
const products = await prisma.product.findMany({
  where: { isArchived: false },
  take: 12,
  orderBy: { createdAt: 'desc' },
  include: {
    brand: true,
    categories: true,
  },
})
```
- Displays banner carousel
- Shows 12 most recent non-archived products
- Uses `<ProductGrid>` component

#### Products Page (`/apps/storefront/src/app/(store)/(routes)/products/page.tsx`)
- Filters by: availability, brand, category
- Sorting options: featured, price (asc/desc)
- Pagination (12 per page)
- Same `<ProductGrid>` component

#### Product Card Component (`/apps/storefront/src/components/native/Product.tsx`)
**Current Display**:
- Single image (only `product.images[0]`)
- First category badge
- Title
- Description (truncated)
- Price with discount badge
- Availability status

**Missing**:
- Additional images (only shows first)
- Brand information
- Stock count
- Dimensions
- Keywords/metadata
- Customizable indicator

---

## Implementation Plan

### Phase 1: Separate Customizable Products Carousel

#### 1.1 Update Homepage Query
**File**: `/apps/storefront/src/app/(store)/(routes)/page.tsx`

```typescript
// Fetch customizable products separately
const customizableProducts = await prisma.product.findMany({
  where: {
    isArchived: false,
    isCustomizable: true,
    isAvailable: true,
  },
  take: 12,
  orderBy: { createdAt: 'desc' },
  include: {
    brand: true,
    categories: true,
  },
})

// Fetch regular products
const regularProducts = await prisma.product.findMany({
  where: {
    isArchived: false,
    isCustomizable: false,
    isAvailable: true,
  },
  take: 12,
  orderBy: { createdAt: 'desc' },
  include: {
    brand: true,
    categories: true,
  },
})
```

#### 1.2 Add Customizable Products Section
```tsx
{isVariableValid(customizableProducts) && customizableProducts.length > 0 && (
  <>
    <Separator className="my-8" />
    <Heading
      title="Customizable Products"
      description="Design your own unique products with our customization options."
    />
    <ProductGrid products={customizableProducts} />
  </>
)}
```

### Phase 2: Enhanced Product Card

#### 2.1 Create Enhanced Product Card Component
**File**: `/apps/storefront/src/components/native/Product.tsx`

**New Features**:
1. **Image Gallery Preview**: Show multiple images with hover/click
2. **Brand Badge**: Display brand logo/name
3. **Stock Indicator**: Show stock availability
4. **Customizable Badge**: Highlight customizable products
5. **More Details**: Dimensions, keywords in expandable section

**Implementation**:
```tsx
export const EnhancedProduct = ({ product }: { product: ProductWithIncludes }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imgError, setImgError] = useState(false)

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          {/* Image Gallery with Navigation */}
          <div className="relative h-60 w-full bg-neutral-100 dark:bg-neutral-800 group">
            <Image
              src={product.images[currentImageIndex] || product.images[0]}
              alt={product.title}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-t-lg"
            />
            
            {/* Image Navigation Dots */}
            {product.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentImageIndex(idx)
                    }}
                    className={`w-2 h-2 rounded-full ${
                      idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Customizable Badge */}
            {product.isCustomizable && (
              <Badge className="absolute top-2 right-2" variant="secondary">
                Customizable
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="grid gap-2 p-4">
          {/* Brand & Category */}
          <div className="flex gap-2 items-center">
            <Badge variant="outline">{product.categories[0]?.title}</Badge>
            {product.brand && (
              <Badge variant="secondary">{product.brand.title}</Badge>
            )}
          </div>

          {/* Title */}
          <h2 className="font-semibold">{product.title}</h2>
          
          {/* Description */}
          <p className="text-xs text-neutral-500 line-clamp-2">
            {product.description}
          </p>
          
          {/* Stock Indicator */}
          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-xs text-orange-500">
              Only {product.stock} left in stock
            </p>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between items-center">
          {product.isAvailable ? (
            <Price product={product} />
          ) : (
            <Badge variant="secondary">Out of stock</Badge>
          )}
          
          {/* Image Count Indicator */}
          {product.images.length > 1 && (
            <span className="text-xs text-neutral-500">
              +{product.images.length - 1} photos
            </span>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}
```

### Phase 3: Product Detail Page Enhancement

**File**: `/apps/storefront/src/app/(store)/(routes)/products/[productId]/page.tsx`

**Enhancements**:
1. Full image carousel (already exists via `Carousel.tsx`)
2. Display all product metadata
3. Show dimensions and weight
4. Display keywords as tags
5. Show brand information
6. Stock availability
7. Customization options (if `isCustomizable`)

---

## Technical Considerations

### 1. Performance
- **Image Optimization**: Already using Next.js Image component with lazy loading
- **Query Optimization**: Use `include` selectively, consider pagination
- **Caching**: Implement ISR (Incremental Static Regeneration) for product pages

### 2. Data Consistency
- Both admin and storefront use same database
- Prisma ensures type safety across both apps
- Real-time updates via `router.refresh()`

### 3. UI/UX
- Maintain existing design system (shadcn/ui components)
- Ensure mobile responsiveness
- Add loading states for image galleries
- Implement error boundaries for missing images

### 4. Accessibility
- Alt text for all images
- Keyboard navigation for image galleries
- ARIA labels for badges and indicators
- Screen reader friendly stock indicators

---

## Migration Steps

### Step 1: Database Check
```bash
# Verify isCustomizable field exists in both schemas
cd apps/admin && npx prisma db pull
cd ../storefront && npx prisma db pull
```

### Step 2: Update Storefront Homepage
1. Modify query to separate customizable products
2. Add new section with heading
3. Test with existing data

### Step 3: Enhance Product Card
1. Create new enhanced component
2. Test with products having multiple images
3. Gradually replace old component

### Step 4: Update Product Detail Page
1. Add metadata display
2. Enhance carousel with all images
3. Add customization UI (if applicable)

### Step 5: Testing
1. Test with products having 1 image vs multiple
2. Test customizable vs non-customizable products
3. Test responsive design
4. Test performance with large image arrays

---

## API Endpoints Reference

### Admin API
- `POST /api/products` - Create product
- `PATCH /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Storefront API
- `GET /api/products` - List products (with filters)
- `GET /api/products/[id]` - Get single product

---

## File Structure

```
apps/
├── admin/
│   ├── src/
│   │   ├── app/(dashboard)/(routes)/products/
│   │   │   ├── page.tsx                    # Products list
│   │   │   ├── [productId]/
│   │   │   │   ├── page.tsx               # Product edit wrapper
│   │   │   │   └── components/
│   │   │   │       └── product-form.tsx   # ⭐ Product creation form
│   │   └── api/products/
│   │       └── [productId]/route.ts       # Product API endpoints
│   └── prisma/
│       └── schema.prisma                   # Database schema
│
└── storefront/
    ├── src/
    │   ├── app/(store)/(routes)/
    │   │   ├── page.tsx                    # ⭐ Homepage (needs update)
    │   │   ├── products/
    │   │   │   ├── page.tsx               # Products listing
    │   │   │   └── [productId]/
    │   │   │       └── page.tsx           # Product detail page
    │   └── components/native/
    │       ├── Product.tsx                 # ⭐ Product card (needs enhancement)
    │       └── Carousel.tsx                # Image carousel component
    └── prisma/
        └── schema.prisma                   # Database schema (same as admin)
```

---

## Next Steps

1. ✅ **Analysis Complete** - Full understanding of product flow
2. ⏳ **Implement Customizable Carousel** - Separate section on homepage
3. ⏳ **Enhance Product Cards** - Show all images and metadata
4. ⏳ **Update Product Detail Page** - Full information display
5. ⏳ **Testing & Refinement** - Ensure quality and performance

---

## Questions for Clarification

1. Should customizable products appear in BOTH sections or ONLY in the customizable section?
2. What should be the default behavior for products without images?
3. Should we add a filter for customizable products on the products listing page?
4. Do you want a separate page/route for customizable products?
5. Should the image gallery on cards be interactive (hover/click) or just show count?

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Author**: Amazon Q Developer
