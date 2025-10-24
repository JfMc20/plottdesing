# 🔐 Guía de Creación de Usuarios Administradores

Esta guía explica cómo crear y gestionar usuarios administradores en PlottDesign Admin Panel.

## 📋 Índice

1. [Prerequisitos](#prerequisitos)
2. [Configuración Inicial](#configuración-inicial)
3. [Crear Primer Administrador](#crear-primer-administrador)
4. [Crear Administradores Adicionales](#crear-administradores-adicionales)
5. [Arquitectura del Sistema](#arquitectura-del-sistema)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisitos

- Acceso a Supabase Dashboard
- Variables de entorno configuradas
- Base de datos Prisma sincronizada

## 🔧 Configuración Inicial

### 1. Variables de Entorno

Asegúrate de tener estas variables en `/apps/admin/.env`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lryfurpxiwatliwsoset.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Admin Emails - Lista de emails que pueden acceder al admin panel
ADMIN_EMAILS=admin@plottdesign.com,otro-admin@plottdesign.com

# Database
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
```

⚠️ **IMPORTANTE:** `SUPABASE_SERVICE_ROLE_KEY` es una clave sensible que permite operaciones de administrador. **NUNCA** la expongas al cliente.

### 2. Obtener Service Role Key

1. Ve a **Supabase Dashboard** → Tu Proyecto
2. Settings → API
3. Copia el **service_role key** (secret)
4. Pégalo en tu `.env` como `SUPABASE_SERVICE_ROLE_KEY`

---

## 👤 Crear Primer Administrador

Como no tienes usuarios admin todavía, hay **2 métodos** para crear el primero:

### Método 1: Desde Supabase Dashboard (Recomendado)

1. **Ve a Supabase Dashboard**
   - Abre tu proyecto en https://supabase.com/dashboard
   - Ve a **Authentication** → **Users**

2. **Crear Usuario**
   - Click en **Add User** → **Create new user**
   - Email: `admin@plottdesign.com`
   - Password: `TuPasswordSegura123!`
   - ✅ Marca: **Auto Confirm Email**

3. **Añadir a ADMIN_EMAILS**
   ```env
   ADMIN_EMAILS=admin@plottdesign.com
   ```

4. **Reinicia el servidor admin**
   ```bash
   cd /root/plottdesing/apps/admin
   npm run dev
   ```

5. **Login**
   - Ve a http://localhost:8888/login
   - Email: `admin@plottdesign.com`
   - Password: La que configuraste

### Método 2: Usando API directamente

Si tienes acceso directo al servidor:

```bash
curl -X POST https://lryfurpxiwatliwsoset.supabase.co/auth/v1/admin/users \
  -H "apikey: TU_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer TU_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@plottdesign.com",
    "password": "TuPasswordSegura123!",
    "email_confirm": true
  }'
```

Luego añade el email a `ADMIN_EMAILS` en `.env`.

---

## 👥 Crear Administradores Adicionales

Una vez que tengas un administrador activo:

### Opción A: Desde el Admin Panel (Recomendado)

1. **Login al Admin Panel**
   - http://localhost:8888/login
   - Usa tus credenciales de admin

2. **Ir a Admin Users**
   - En el menú lateral: **Settings** → **Admin Users**
   - O directo: http://localhost:8888/admin-users

3. **Crear Nuevo Admin**
   - Click en **Add Admin**
   - Email: `nuevo-admin@plottdesign.com`
   - Password: Mínimo 6 caracteres
   - Click **Create Admin**

4. **Añadir a ADMIN_EMAILS**
   ```env
   ADMIN_EMAILS=admin@plottdesign.com,nuevo-admin@plottdesign.com
   ```

5. **Reiniciar servidor** para que tome la nueva configuración

### Opción B: Usando el API

```bash
# Debes estar autenticado como admin
curl -X POST http://localhost:8888/api/admin-users \
  -H "Content-Type: application/json" \
  -H "Cookie: tu-cookie-de-sesion" \
  -d '{
    "email": "nuevo-admin@plottdesign.com",
    "password": "PasswordSegura123!"
  }'
```

---

## 🏗️ Arquitectura del Sistema

### Modelos de Datos

```prisma
// En storefront y admin schema.prisma

model Owner {
  id         String  @id @default(cuid())
  supabaseId String? @unique
  email      String  @unique
  phone      String? @unique
  name       String?
  avatar     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Flujo de Autenticación

```
┌─────────────────────────────────────────────────┐
│  1. Usuario intenta acceder a /admin           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2. Middleware verifica sesión Supabase         │
│     - Si NO autenticado → /login                │
│     - Si autenticado → continúa                 │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3. API Routes verifican ADMIN_EMAILS           │
│     - Lee user.email de sesión                  │
│     - Compara con process.env.ADMIN_EMAILS      │
│     - Si NO está → 403 Forbidden                │
│     - Si está → permite operación               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  4. Operaciones Admin (si autorizado)           │
│     - Crear productos                           │
│     - Gestionar órdenes                         │
│     - Crear otros admins                        │
└─────────────────────────────────────────────────┘
```

### Archivos Clave

```
apps/admin/
├── .env                                    # ADMIN_EMAILS aquí
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── admin-users/
│   │   │       ├── route.ts               # GET/POST crear admins
│   │   │       └── [userId]/route.ts      # DELETE admin
│   │   └── (dashboard)/
│   │       └── (routes)/
│   │           └── admin-users/
│   │               ├── page.tsx           # UI lista de admins
│   │               └── components/
│   │                   └── create-admin-dialog.tsx
│   └── lib/
│       └── auth-shared/
│           └── supabase/
│               └── admin.ts               # Cliente Supabase Admin
```

### Verificación de Permisos

**En cualquier API route:**

```typescript
// apps/admin/src/app/api/admin-users/route.ts

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Verificar si es admin
const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
if (!adminEmails.includes(user.email || '')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

## 🔍 Troubleshooting

### Error: "Forbidden" al intentar crear admin

**Causa:** Tu email no está en `ADMIN_EMAILS`

**Solución:**
```bash
# Edita .env
ADMIN_EMAILS=tu-email@plottdesign.com

# Reinicia el servidor
npm run dev
```

### Error: "Missing Supabase environment variables for admin client"

**Causa:** Falta `SUPABASE_SERVICE_ROLE_KEY` en `.env`

**Solución:**
1. Ve a Supabase Dashboard → Settings → API
2. Copia **service_role key**
3. Añade a `.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

### Usuario creado pero no puede hacer login

**Causa:** Email no confirmado

**Solución:**
1. Ve a Supabase Dashboard → Authentication → Users
2. Busca el usuario
3. Click en **...** → **Confirm Email**

### Error: "Password must be at least 6 characters"

**Causa:** Password muy corto

**Solución:** Usa un password de mínimo 6 caracteres al crear el admin.

### No veo la página de Admin Users

**Causa:** No tienes permisos o la ruta está mal

**Solución:**
1. Verifica que estás logueado
2. Ve directamente a: http://localhost:8888/admin-users
3. Verifica que tu email esté en `ADMIN_EMAILS`

---

## 🔒 Seguridad

### ⚠️ Buenas Prácticas

1. **NUNCA expongas `SUPABASE_SERVICE_ROLE_KEY` al cliente**
   - Solo úsala en API routes del servidor
   - Nunca en código del cliente

2. **Usa passwords fuertes**
   - Mínimo 8 caracteres
   - Combinación de letras, números y símbolos

3. **Limita ADMIN_EMAILS**
   - Solo emails de confianza
   - Revisa la lista periódicamente

4. **En producción:**
   - Cambia todos los passwords
   - Usa HTTPS siempre
   - Configura 2FA en Supabase

### 🚨 Si comprometes el Service Role Key

1. Ve a Supabase Dashboard → Settings → API
2. **Reset** el service role key
3. Actualiza `.env` en todos los ambientes
4. Reinicia todos los servidores

---

## 📚 Referencias

- **Supabase Auth Admin:** https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- **API Routes:** `/apps/admin/src/app/api/admin-users/route.ts`
- **Admin Client:** `/apps/admin/src/lib/auth-shared/supabase/admin.ts`

---

## ✅ Checklist de Setup

- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado en `.env`
- [ ] `ADMIN_EMAILS` configurado con tu email
- [ ] Primer admin creado en Supabase Dashboard
- [ ] Puedes hacer login en http://localhost:8888/login
- [ ] Puedes acceder a http://localhost:8888/admin-users
- [ ] Puedes crear nuevos admins desde el panel

---

**¿Necesitas ayuda?** Revisa los logs del servidor o consulta la documentación de Supabase Auth.
