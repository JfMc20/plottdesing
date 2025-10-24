# 🖼️ Configuración de Cloudinary

## Error Actual
```
Upload preset not found
```

Este error ocurre porque falta configurar el **Upload Preset** en Cloudinary.

## 🚀 Solución Paso a Paso

### Paso 1: Acceder a Cloudinary Dashboard

1. Ve a: https://cloudinary.com/console
2. Login con tu cuenta

### Paso 2: Crear Upload Preset

1. En el menú lateral izquierdo, ve a:
   - **Settings** (engranaje) → **Upload**

2. Scroll down hasta la sección **Upload presets**

3. Click en **Add upload preset**

4. Configura el preset:
   ```
   ┌─────────────────────────────────────┐
   │ Upload preset name: plottdesign     │
   │ Signing Mode: UNSIGNED ⚠️ IMPORTANTE│
   │ Folder: products/                   │
   │ Use filename: Yes                   │
   │ Unique filename: Yes                │
   └─────────────────────────────────────┘
   ```

5. **IMPORTANTE**: Cambia "Signing Mode" a **"Unsigned"**
   - Por defecto está en "Signed"
   - DEBE ser "Unsigned" para que funcione desde el navegador

6. Click en **Save**

### Paso 3: Obtener el Preset Name

Después de crear el preset, verás algo así:

```
┌────────────────────────────────────────┐
│ Upload Preset                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ Name: plottdesign                      │
│ Mode: unsigned                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
└────────────────────────────────────────┘
```

### Paso 4: Configurar en el Código

Ahora necesitas añadir el preset al componente:

**Archivo:** `/apps/admin/src/components/ui/image-upload.tsx`

Busca el `CldUploadWidget` y añade `uploadPreset`:

```tsx
<CldUploadWidget
  onUpload={onUpload}
  uploadPreset="plottdesign"  // ← AÑADIR ESTO
>
```

## 📋 Variables de Entorno Completas

Asegúrate de tener esto en tu `.env`:

```env
# En /apps/admin/.env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"

# En /apps/storefront/.env (si usas upload allí también)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
```

## 🔍 Verificación

Para verificar que funciona:

1. Ve al admin: http://localhost:8888/products/new
2. Click en el botón de **Upload Image**
3. Selecciona una imagen
4. Debería subir sin errores

## ⚡ Quick Fix - Hardcoded Preset

Si ya creaste el preset en Cloudinary y solo necesitas actualizar el código:

```bash
# Edita el archivo
nano /root/plottdesing/apps/admin/src/components/ui/image-upload.tsx

# Busca: <CldUploadWidget
# Añade: uploadPreset="plottdesign"
```

## 🚨 Troubleshooting

### "Preset not found" después de configurar

1. **Verifica el nombre**: Debe ser exactamente igual (case-sensitive)
2. **Verifica que sea "unsigned"**: Signed no funciona desde el navegador
3. **Espera 1-2 minutos**: Cloudinary puede tardar en propagar el cambio
4. **Limpia la caché**: Ctrl + Shift + R en el navegador

### "Invalid cloud name"

```env
# Verifica que el cloud name sea correcto
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name-aqui"
```

### "Cross-origin error"

1. Ve a Cloudinary Settings → Security
2. Añade tu dominio a **Allowed fetch domains**:
   ```
   http://localhost:8888
   http://localhost:7777
   ```

## 🎯 Configuración Recomendada del Preset

```yaml
Upload Preset Settings:
  Name: plottdesign
  Signing Mode: Unsigned ⚠️
  Folder: products/

  Image Transformations:
    - Format: Auto
    - Quality: Auto

  Upload Control:
    - Max file size: 10 MB
    - Allowed formats: jpg, png, webp, gif

  Asset Management:
    - Use filename: Yes
    - Unique filename: Yes
    - Overwrite: No
```

## 📚 Referencias

- Cloudinary Upload Widget: https://cloudinary.com/documentation/upload_widget
- Upload Presets: https://cloudinary.com/documentation/upload_presets
- Unsigned Upload: https://cloudinary.com/documentation/upload_images#unsigned_upload
