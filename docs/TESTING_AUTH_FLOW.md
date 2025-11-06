# Guía de Testing del Flujo de Autenticación

Esta guía te ayuda a probar fácilmente el flujo completo de registro y verificación de email.

## Configuración Inicial

### 1. Obtener Service Role Key de Supabase

1. Ve a **Supabase Dashboard** → Tu proyecto
2. Ve a **Settings** → **API**
3. Copia la **service_role key** (⚠️ NUNCA expongas esta key públicamente)
4. Agrégala a tu `.env`:

```bash
# .env (apps/storefront/.env)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Instalar dependencia tsx (si no la tienes)

```bash
cd apps/storefront
npm install -D tsx
```

## Flujo de Testing Recomendado

### Opción 1: Testing con Email de Prueba

```bash
# 1. Registrar usuario de prueba
# Ve a: http://localhost:7777/signup
# Email: test@test.com
# Password: test123

# 2. Verificar logs en consola
# Deberías ver:
# 📝 Full signup response: { ... }
# 📝 Session object: { hasSession: false, ... }  <- Si confirmación está ON
# ✅ Email confirmation required - showing verification screen

# 3. Revisar email de confirmación
# Busca en tu bandeja de entrada el email de Supabase

# 4. Click en el link de confirmación
# Te redirigirá a /auth/confirm

# 5. Hacer login
# Ve a: http://localhost:7777/login

# 6. Limpiar para volver a probar
npm run test:clean-user test@test.com
```

### Opción 2: Testing con Gmail (OAuth)

```bash
# 1. Login con Google
# Ve a: http://localhost:7777/login
# Click en "Continue with Google"
# Selecciona tu cuenta de Gmail

# 2. Verificar que el avatar se guardó
# Abre Developer Tools → Console
# Deberías ver el avatar en la navegación

# 3. Limpiar para volver a probar
npm run test:clean-user tucorreo@gmail.com
```

## Comandos Útiles

### Limpiar un usuario específico

```bash
# Borra el usuario de Supabase Y Prisma
npm run test:clean-user test@test.com
npm run test:clean-user josem.csegurity@gmail.com
```

### Limpiar todos los usuarios de prueba

```bash
# Borra todos los emails que contengan:
# - test@, demo@, prueba@
# - @test.com, @example.com, @mailinator.com
npm run test:clean-all
```

### Ver usuarios en la base de datos

```bash
npm run db:studio
```

Luego ve a: http://localhost:5555

## Verificar Configuración de Email Confirmation

### Comprobar si está habilitada en Supabase

1. Ve a **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
2. Busca la sección **"Email Confirmation"**
3. Debería estar **habilitada** (✅)

### Comprobar en código

Cuando te registres, revisa la consola del navegador:

```javascript
📝 Session object: { hasSession: false, ... }
// ↑ hasSession: false = Confirmación HABILITADA ✅
// ↑ hasSession: true = Confirmación DESHABILITADA ❌
```

## Escenarios de Testing

### ✅ Escenario 1: Registro exitoso con confirmación

```
1. Usuario se registra → Ve pantalla de verificación
2. Email llega correctamente → Usuario hace click
3. Redirige a /auth/confirm → Muestra mensaje de éxito
4. Usuario hace login → Entra al sitio
```

### ✅ Escenario 2: Login con Google

```
1. Usuario hace click en "Continue with Google"
2. Selecciona cuenta → Redirige a /auth/callback
3. Avatar se sincroniza → Usuario entra al sitio
4. Avatar aparece en la navegación
```

### ✅ Escenario 3: Reenviar email de verificación

```
1. Usuario se registra → Ve pantalla de verificación
2. Email no llega → Click en "Resend verification email"
3. Email se reenvía → Usuario recibe nuevo email
```

### ⚠️ Escenario 4: Email ya registrado

```
1. Usuario intenta registrarse con email existente
2. Sistema detecta identities.length === 0
3. Muestra error: "This email is already registered. Please login instead."
```

## Troubleshooting

### ❌ El script clean-test-users falla

**Error:**
```
Error: SUPABASE_SERVICE_ROLE_KEY is not defined
```

**Solución:**
Agrega la key al `.env`:
```bash
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### ❌ No llega el email de verificación

**Posibles causas:**

1. **Email confirmation deshabilitada**
   - Ve a Supabase Dashboard → Authentication → Providers → Email
   - Habilita "Confirm email"

2. **Email template no configurado**
   - Ve a Authentication → Email Templates
   - Verifica que "Confirm signup" esté activo

3. **Email en spam**
   - Revisa la carpeta de spam
   - Agrega noreply@supabase.io a contactos

### ❌ La pantalla de verificación no aparece

**Diagnóstico:**

Revisa los logs en consola:

```javascript
// Si ves esto:
📝 Session object: { hasSession: true, ... }
// Significa que la confirmación está DESHABILITADA

// Si ves esto:
📝 Session object: { hasSession: false, ... }
// Significa que la confirmación está HABILITADA ✅
```

**Solución:**
- Ve a Supabase Dashboard
- Authentication → Providers → Email
- Habilita "Confirm email"

### ❌ Error: Unique constraint failed

**Causa:**
Usuario existe en Prisma pero tiene diferente supabaseId

**Solución:**
```bash
npm run test:clean-user email@example.com
```

O bórralo manualmente:
```bash
npm run db:studio
# Ve a la tabla User
# Busca el usuario por email
# Borra el registro
```

## Ciclo Completo de Testing (15 min)

```bash
# 1. Limpia usuarios anteriores
npm run test:clean-user test@test.com

# 2. Abre el sitio
# http://localhost:7777/signup

# 3. Registra usuario
# Email: test@test.com
# Password: test123

# 4. Verifica pantalla de verificación
# Deberías ver el componente VerificationSuccess

# 5. Revisa email
# Busca email de Supabase

# 6. Click en link de confirmación
# Deberías ser redirigido a /auth/confirm

# 7. Haz login
# http://localhost:7777/login

# 8. Verifica que entró correctamente
# Deberías ver tu nombre/email en el dropdown del avatar

# 9. Limpia para próximo test
npm run test:clean-user test@test.com

# 10. Prueba con Google
# Click en "Continue with Google"
# Verifica que el avatar de Google aparece

# 11. Limpia
npm run test:clean-user tucorreo@gmail.com
```

## Logs Útiles para Debug

### Registro exitoso con confirmación:

```
📝 Full signup response: {
  user: { ... },
  session: null  ← IMPORTANTE
}
📝 User object: {
  email: "test@test.com",
  email_confirmed_at: null,  ← IMPORTANTE
  ...
}
✅ No session created - email confirmation required
```

### Login con Google exitoso:

```
🔍 Callback received: {
  code: 'present',
  ...
}
✅ Session created successfully!
   User: tucorreo@gmail.com
🏠 Regular login, redirecting to /
```

---

## Recursos Adicionales

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email#email-templates)
- Documentación interna: `SUPABASE_CONFIG.md`
- Verificación de email: `VERIFICACION_EMAIL_SUPABASE.md`
