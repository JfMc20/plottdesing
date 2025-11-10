# 🔐 Plan de Refactorización - Sistema de Autenticación

## 📊 Estado Actual

### Estructura Existente:

```
packages/auth/                          ← Paquete compartido (✅ BIEN)
├── src/
│   ├── supabase/
│   │   ├── client.ts                  ← Cliente browser
│   │   ├── server.ts                  ← Cliente server
│   │   └── middleware.ts              ← updateSession, checkAdminRole
│   ├── utils/
│   │   └── get-user.ts                ← getCurrentUser, checkIsAdmin
│   └── types/
│       └── index.ts                   ← UserRole, AuthUser, SupabaseEnv

apps/admin/src/lib/auth-shared/        ← DUPLICADO (❌ MAL)
├── supabase/
│   ├── client.ts                      ← Copia del paquete
│   ├── server.ts                      ← Copia del paquete
│   ├── middleware.ts                  ← Copia del paquete
│   └── admin.ts                       ← ⚠️ ÚNICO archivo específico de admin
├── utils/
│   └── get-user.ts                    ← Copia del paquete
└── types/
    └── index.ts                       ← Copia del paquete

apps/admin/src/lib/supabase/           ← Re-exports innecesarios (❌ MAL)
├── client.ts                          ← export { createClient } from auth-shared
└── server.ts                          ← export { createClient } from auth-shared
```

### Problema Principal:
**DUPLICACIÓN TOTAL** - El código de `packages/auth` está copiado en `apps/admin/src/lib/auth-shared/`

### Dependencia en package.json:
```json
"@persepolis/auth": "file:../../packages/auth"
```
✅ Ya está configurado correctamente

---

## 🎯 Solución Propuesta

### Estrategia: Migración Segura en 3 Pasos

#### PASO 1: Mover `admin.ts` al paquete compartido
**Archivo único:** `/apps/admin/src/lib/auth-shared/supabase/admin.ts`

**Acción:**
1. Mover a `/packages/auth/src/supabase/admin.ts`
2. Exportar en `/packages/auth/src/index.ts`

**Razón:** Es funcionalidad de autenticación reutilizable (service_role client)

---

#### PASO 2: Actualizar imports en admin
**Cambiar todos los imports de:**
```typescript
// ❌ ANTES
import { createClient } from '@/lib/auth-shared/supabase/client'
import { updateSession } from '@/lib/auth-shared/supabase/middleware'
import { getCurrentUser } from '@/lib/auth-shared/utils/get-user'
import { createAdminClient } from '@/lib/auth-shared/supabase/admin'
```

**A:**
```typescript
// ✅ DESPUÉS
import { createClient } from '@persepolis/auth'
import { updateSession } from '@persepolis/auth/supabase/middleware'
import { getCurrentUser } from '@persepolis/auth/utils/get-user'
import { createAdminClient } from '@persepolis/auth/supabase/admin'
```

**Archivos a actualizar:**
- `/apps/admin/src/middleware.ts`
- `/apps/admin/src/lib/auth/get-owner.ts`
- `/apps/admin/src/components/navbar.tsx`
- `/apps/admin/src/app/api/admin-users/route.ts`
- `/apps/admin/src/app/api/admin-users/[userId]/route.ts`
- `/apps/admin/src/app/(dashboard)/(routes)/admin-users/page.tsx`

---

#### PASO 3: Eliminar carpetas duplicadas
**Eliminar:**
- `/apps/admin/src/lib/auth-shared/` (completo)
- `/apps/admin/src/lib/supabase/` (completo)

---

## 📝 Implementación Detallada

### PASO 1: Mover admin.ts al paquete compartido

#### 1.1 Crear archivo en paquete
```bash
# Copiar el archivo
cp apps/admin/src/lib/auth-shared/supabase/admin.ts packages/auth/src/supabase/admin.ts
```

#### 1.2 Actualizar exports en packages/auth/src/index.ts
```typescript
// Supabase clients - import separately to avoid bundling server code in client
export { createClient } from './supabase/client'

// Client-side utilities
export { resendEmailVerificationClient } from './utils/email-verification-client'

// Types
export type { UserRole, AuthUser, SupabaseEnv } from './types'

// NOTE: Server-side utilities should be imported directly:
// import { createClient } from '@persepolis/auth/supabase/server'
// import { createAdminClient } from '@persepolis/auth/supabase/admin'  ← AGREGAR
// import { updateSession, updateSessionWithUser, checkAdminRole } from '@persepolis/auth/supabase/middleware'
// import { getCurrentUser, checkIsAdmin } from '@persepolis/auth/utils/get-user'
// import { resendEmailVerification } from '@persepolis/auth/utils/email-verification'
```

---

### PASO 2: Script de migración de imports

```bash
#!/bin/bash
# migrate-auth-imports.sh

# Función para reemplazar imports
replace_imports() {
  local file=$1
  
  # Reemplazar imports de auth-shared
  sed -i "s|from '@/lib/auth-shared/supabase/client'|from '@persepolis/auth'|g" "$file"
  sed -i "s|from '@/lib/auth-shared/supabase/server'|from '@persepolis/auth/supabase/server'|g" "$file"
  sed -i "s|from '@/lib/auth-shared/supabase/middleware'|from '@persepolis/auth/supabase/middleware'|g" "$file"
  sed -i "s|from '@/lib/auth-shared/supabase/admin'|from '@persepolis/auth/supabase/admin'|g" "$file"
  sed -i "s|from '@/lib/auth-shared/utils/get-user'|from '@persepolis/auth/utils/get-user'|g" "$file"
  sed -i "s|from '@/lib/auth-shared/types'|from '@persepolis/auth'|g" "$file"
  
  # Reemplazar imports de lib/supabase
  sed -i "s|from '@/lib/supabase/client'|from '@persepolis/auth'|g" "$file"
  sed -i "s|from '@/lib/supabase/server'|from '@persepolis/auth/supabase/server'|g" "$file"
}

# Buscar y reemplazar en todos los archivos
find apps/admin/src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  replace_imports "$file"
  echo "✓ Actualizado: $file"
done

echo "✅ Migración de imports completada"
```

---

### PASO 3: Limpieza

```bash
#!/bin/bash
# cleanup-auth-duplicates.sh

# Eliminar carpetas duplicadas
rm -rf apps/admin/src/lib/auth-shared
rm -rf apps/admin/src/lib/supabase

echo "✅ Carpetas duplicadas eliminadas"
```

---

## 🧪 Validación

### Checklist de Verificación:

```bash
# 1. Verificar que no hay imports rotos
cd apps/admin
npm run build

# 2. Verificar que no quedan referencias a auth-shared
grep -r "auth-shared" apps/admin/src --include="*.ts" --include="*.tsx"
# Resultado esperado: Sin resultados

# 3. Verificar que no quedan referencias a lib/supabase
grep -r "from '@/lib/supabase" apps/admin/src --include="*.ts" --include="*.tsx"
# Resultado esperado: Sin resultados

# 4. Verificar imports correctos
grep -r "@persepolis/auth" apps/admin/src --include="*.ts" --include="*.tsx"
# Resultado esperado: Todos los imports de auth
```

---

## 📊 Impacto de la Refactorización

### Antes:
```
apps/admin/src/lib/
├── auth-shared/          ← 8 archivos duplicados
│   ├── supabase/         ← 4 archivos
│   ├── utils/            ← 1 archivo
│   └── types/            ← 1 archivo
├── supabase/             ← 2 re-exports innecesarios
└── auth/                 ← 1 archivo (get-owner.ts)
```

### Después:
```
apps/admin/src/lib/
└── auth/                 ← 1 archivo (get-owner.ts)
```

### Métricas:
- **Archivos eliminados:** 10
- **Líneas de código eliminadas:** ~150
- **Reducción de duplicación:** 100%
- **Mantenibilidad:** +80%

---

## ⚠️ Consideraciones de Seguridad

### admin.ts - Service Role Key
El archivo `admin.ts` usa `SUPABASE_SERVICE_ROLE_KEY` que:
- ✅ Bypassa Row Level Security (RLS)
- ✅ Solo debe usarse en server-side
- ✅ Ya está correctamente implementado con validaciones

**No hay cambios de seguridad** - Solo movemos el archivo al paquete compartido.

---

## 🚀 Ejecución del Plan

### Orden de Ejecución (SIN ROMPER NADA):

```bash
# 1. Mover admin.ts al paquete
cp apps/admin/src/lib/auth-shared/supabase/admin.ts packages/auth/src/supabase/admin.ts

# 2. Actualizar exports del paquete (manual)
# Editar: packages/auth/src/index.ts

# 3. Ejecutar script de migración de imports
bash migrate-auth-imports.sh

# 4. Verificar que compila
cd apps/admin && npm run build

# 5. Si todo OK, limpiar duplicados
bash cleanup-auth-duplicates.sh

# 6. Verificar nuevamente
npm run build

# 7. Commit
git add .
git commit -m "refactor(auth): consolidate auth to shared package"
```

---

## 🎯 Resultado Final

### Estructura Limpia:
```
packages/auth/                          ← Única fuente de verdad
├── src/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   └── admin.ts                   ← Movido aquí
│   ├── utils/
│   │   └── get-user.ts
│   └── types/
│       └── index.ts

apps/admin/src/lib/
└── auth/
    └── get-owner.ts                   ← Lógica específica de admin
```

### Imports en Admin:
```typescript
// ✅ Todo desde el paquete compartido
import { createClient } from '@persepolis/auth'
import { createClient as createServerClient } from '@persepolis/auth/supabase/server'
import { createAdminClient } from '@persepolis/auth/supabase/admin'
import { updateSession, checkAdminRole } from '@persepolis/auth/supabase/middleware'
import { getCurrentUser } from '@persepolis/auth/utils/get-user'
```

---

## ✅ Beneficios

1. **Eliminación de duplicación:** 100% del código de auth
2. **Single Source of Truth:** Un solo lugar para mantener
3. **Reutilización:** Otros apps pueden usar el mismo paquete
4. **Consistencia:** Misma implementación en todos lados
5. **Mantenibilidad:** Cambios en un solo lugar
6. **Testing:** Testear el paquete una vez

---

**¿Procedemos con la implementación?**
