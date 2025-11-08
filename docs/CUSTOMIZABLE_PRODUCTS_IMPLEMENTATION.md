# Customizable Products Implementation

## ✅ Implementación Completada

### 1. Homepage Structure
**Archivo**: `/apps/storefront/src/app/(store)/(routes)/page.tsx`

```
[Banner Carousel]
    ↓
[Customizable Products Section]
    ├── Heading: "Customizable Products"
    ├── Carousel (imágenes exclusivas de productos customizables)
    └── CustomizableProductGrid (cards especiales)
    ↓
[Regular Products Section]
    ├── Heading: "Products"
    └── ProductGrid (cards normales)
    ↓
[Blogs Section]
```

---

### 2. Components Created

#### A. CustomizableProduct Component
**Archivo**: `/apps/storefront/src/components/native/CustomizableProduct.tsx`

**Características**:
- Card con border destacado (`border-2 border-primary/20`)
- Badge "Customizable" con icono de pincel
- Muestra brand y categoría
- Contador de fotos adicionales
- Texto "Click to customize your design"
- Precio base + indicador "+ design"
- Click abre modal de personalización

#### B. CustomizeModal Component
**Archivo**: `/apps/storefront/src/components/native/CustomizeModal.tsx`

**Campos del formulario**:
1. **Product Preview** - Imagen y detalles del producto
2. **Print Zone** * (requerido) - Selector de zona de impresión
3. **Size** * (requerido) - Selector de tamaño
4. **Your Design** * (requerido) - Upload de imagen del cliente
5. **Additional Notes** (opcional) - Textarea para instrucciones adicionales

**Funcionalidades**:
- Carga dinámica de zones y sizes desde CategoryItem
- Upload de imagen con preview
- Validación de campos requeridos
- Loading states
- Responsive design

---

### 3. API Endpoints Created

#### A. GET `/api/category-items/[id]`
**Archivo**: `/apps/storefront/src/app/api/category-items/[id]/route.ts`

**Propósito**: Obtener CategoryItem con sus zones y sizes

**Response**:
```json
{
  "id": "...",
  "name": "T-Shirt",
  "sizes": [
    { "id": "...", "name": "Small", "code": "S" },
    { "id": "...", "name": "Medium", "code": "M" }
  ],
  "zones": [
    { "id": "...", "name": "Front", "code": "FRONT" },
    { "id": "...", "name": "Back", "code": "BACK" }
  ]
}
```

#### B. POST `/api/customization-requests`
**Archivo**: `/apps/storefront/src/app/api/customization-requests/route.ts`

**Propósito**: Recibir solicitudes de personalización del cliente

**Request Body**:
```json
{
  "productId": "...",
  "zoneId": "...",
  "sizeId": "...",
  "designImage": "https://...",
  "notes": "Optional instructions"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Customization request received",
  "data": { ... }
}
```

#### C. POST `/api/upload`
**Archivo**: `/apps/storefront/src/app/api/upload/route.ts`

**Propósito**: Upload de imágenes del cliente a Cloudinary

**Request**: FormData con file
**Response**:
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "customizations/..."
}
```

---

### 4. Database Schema

**Campo agregado al modelo Product**:
```prisma
model Product {
  // ... otros campos
  isCustomizable Boolean @default(true)
  categoryItemId String?
  CategoryItem   CategoryItem? @relation(...)
}
```

**Relaciones utilizadas**:
- Product → CategoryItem
- CategoryItem → ProductZone[]
- CategoryItem → ProductSize[]

---

### 5. User Flow

```
1. Cliente ve homepage
   ↓
2. Ve carrusel exclusivo de productos customizables
   ↓
3. Ve grid de cards customizables (con badge especial)
   ↓
4. Click en card customizable
   ↓
5. Se abre modal con formulario:
   - Selecciona zona de impresión (ej: "Frente")
   - Selecciona tamaño (ej: "Medium")
   - Sube su diseño/imagen
   - Agrega notas opcionales
   ↓
6. Click "Send Customization Request"
   ↓
7. Request enviado al servidor
   ↓
8. Administrador recibe notificación con:
   - Producto seleccionado
   - Zona de impresión
   - Tamaño
   - Imagen del cliente
   - Notas adicionales
```

---

### 6. Visual Differences

#### Card Normal:
```
┌─────────────────┐
│                 │
│     IMAGEN      │
│                 │
├─────────────────┤
│ [Category]      │
│ Título          │
│ Descripción     │
│ $99.99          │
└─────────────────┘
```

#### Card Customizable:
```
┌─────────────────┐
│ [Customizable]🎨│ ← Badge destacado
│     IMAGEN      │
│ [+3 photos]     │
├─────────────────┤
│ [Category][Brand]│
│ Título          │
│ Descripción     │
│ Click to customize│ ← Texto especial
│ $99.99  + design│ ← Indicador
└─────────────────┘
Border: primary/20
Cursor: pointer
```

---

### 7. Environment Variables Required

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
```

---

### 8. TODO / Next Steps

1. **Crear modelo CustomizationRequest en Prisma**:
```prisma
model CustomizationRequest {
  id           String   @id @default(cuid())
  productId    String
  product      Product  @relation(...)
  zoneId       String
  zone         ProductZone @relation(...)
  sizeId       String
  size         ProductSize @relation(...)
  designImage  String
  notes        String?
  userId       String?
  user         User?    @relation(...)
  status       String   @default("pending")
  createdAt    DateTime @default(now())
}
```

2. **Integrar con sistema de autenticación**:
   - Asociar requests con usuario logueado
   - Guardar en historial del usuario

3. **Notificaciones al administrador**:
   - Email notification
   - Dashboard notification
   - SMS (opcional)

4. **Preview del diseño** (opcional):
   - Mostrar mockup del producto con el diseño del cliente
   - Usar canvas o library de mockups

5. **Pricing dinámico**:
   - Calcular precio según zona y tamaño
   - Mostrar precio final antes de enviar

6. **Agregar al carrito**:
   - Permitir agregar producto customizado al carrito
   - Guardar configuración de personalización

---

### 9. Files Modified/Created

**Modified**:
- `/apps/storefront/src/app/(store)/(routes)/page.tsx`
- `/apps/storefront/prisma/schema.prisma`

**Created**:
- `/apps/storefront/src/components/native/CustomizableProduct.tsx`
- `/apps/storefront/src/components/native/CustomizeModal.tsx`
- `/apps/storefront/src/app/api/category-items/[id]/route.ts`
- `/apps/storefront/src/app/api/customization-requests/route.ts`
- `/apps/storefront/src/app/api/upload/route.ts`

---

### 10. Testing Checklist

- [ ] Carrusel de productos customizables se muestra correctamente
- [ ] Cards customizables tienen estilo diferenciado
- [ ] Modal se abre al hacer click en card
- [ ] Zones y sizes se cargan desde CategoryItem
- [ ] Upload de imagen funciona
- [ ] Validación de campos requeridos
- [ ] Request se envía correctamente
- [ ] Responsive design en mobile
- [ ] Dark mode funciona correctamente
- [ ] Loading states se muestran apropiadamente

---

**Implementado por**: Amazon Q Developer  
**Fecha**: 2025-11-07  
**Status**: ✅ Completado - Listo para testing
