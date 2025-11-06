# Configuración de Verificación de Email en Supabase

## Problema Actual

La pantalla de verificación de email no aparece después del registro porque **Supabase tiene la confirmación de email deshabilitada**.

Cuando un usuario se registra:
- Si `email_confirmed_at` es `null` → Muestra pantalla de verificación ✅
- Si `email_confirmed_at` tiene fecha → Usuario entra directamente ❌

## Solución: Habilitar Email Confirmation en Supabase

### Paso 1: Configurar Email Confirmation

1. Ve a **Supabase Dashboard** → Tu proyecto
2. Ve a **Authentication** → **Providers** → **Email**
3. Encuentra la sección **"Email Confirmation"**
4. **Habilita** la opción: **"Confirm email"**
5. Guarda los cambios

### Paso 2: Verificar la configuración de Email Templates

1. Ve a **Authentication** → **Email Templates**
2. Asegúrate de que el template **"Confirm signup"** esté configurado
3. Template recomendado:

```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email address</a></p>
```

### Paso 3: Configurar Redirect URLs

1. Ve a **Authentication** → **URL Configuration**
2. Agrega las siguientes **Redirect URLs**:
   ```
   http://localhost:7777/auth/callback
   https://tu-dominio.com/auth/callback
   ```

### Paso 4: Verificar SMTP Configuration (Opcional pero recomendado)

Por defecto, Supabase usa su propio servicio de email, pero puedes configurar tu propio SMTP:

1. Ve a **Project Settings** → **Authentication**
2. Scroll down a **"SMTP Settings"**
3. Si quieres usar tu propio email:
   - **Enable Custom SMTP**: ON
   - **SMTP Host**: smtp-relay.brevo.com
   - **SMTP Port**: 587
   - **SMTP User**: Tu email de Brevo
   - **SMTP Password**: Tu API key de Brevo
   - **Sender email**: noreply@plottdesign.com
   - **Sender name**: PlottDesign

> **Nota**: Si no configuras SMTP custom, Supabase enviará los emails desde su servidor.

## Testing

### 1. Registrar un nuevo usuario

1. Ve a `/signup`
2. Ingresa email y contraseña
3. Click en "Create Account"
4. **Deberías ver**: La nueva pantalla de verificación con el componente `VerificationSuccess`

### 2. Verificar en consola del navegador

Abre las Developer Tools y verifica los logs:
```
📝 Signup data: { email: "...", email_confirmed_at: null, identities: 1 }
✅ Email confirmation required - showing verification screen
```

Si ves:
```
email_confirmed_at: "2025-10-30T..."  (una fecha)
```
Significa que la confirmación está deshabilitada en Supabase.

### 3. Revisar el email

1. Revisa tu bandeja de entrada
2. Busca el email de confirmación de Supabase
3. Click en el link de confirmación
4. Deberías ser redirigido a `/auth/confirm`

## Troubleshooting

### La pantalla de verificación no aparece

**Causa**: Email confirmation está deshabilitado en Supabase

**Solución**:
1. Ve a Supabase Dashboard
2. Authentication → Providers → Email
3. Habilita "Confirm email"

### No llega el email de confirmación

**Causa 1**: Configuración SMTP incorrecta
- Verifica las credenciales de SMTP en Supabase
- Si usas el SMTP de Supabase por defecto, revisa spam

**Causa 2**: Email template no configurado
- Ve a Authentication → Email Templates
- Asegúrate de que "Confirm signup" esté activo

**Causa 3**: Rate limiting
- Supabase limita emails por hora
- Espera unos minutos y reintenta

### El link de confirmación no funciona

**Causa**: Redirect URL no configurada

**Solución**:
1. Ve a Authentication → URL Configuration
2. Agrega `http://localhost:7777/auth/callback`
3. Agrega tu dominio de producción

### Usuario entra directamente sin confirmar

**Causa**: `autoconfirm` está habilitado

**Solución**:
1. Ve a Authentication → Settings
2. Busca "Enable email confirmations"
3. Asegúrate de que esté HABILITADO

## Verificación Final

Para confirmar que todo está configurado correctamente:

```bash
# 1. Verifica los logs en el navegador al registrarte
# Deberías ver: email_confirmed_at: null

# 2. Verifica en Supabase Dashboard
# Ve a Authentication → Users
# El usuario recién creado debería tener:
# - email_confirmed_at: null (hasta que confirme)
# - confirmation_sent_at: (fecha/hora)

# 3. Después de confirmar el email
# - email_confirmed_at: (fecha/hora)
```

## Configuración recomendada para producción

```
✅ Enable email confirmations: ON
✅ Enable email change confirmations: ON
✅ Secure email change: ON
✅ Session duration: 604800 (7 días)
✅ JWT expiry: 3600 (1 hora)
```

## Flujo completo esperado

1. Usuario completa formulario de registro
2. Supabase crea usuario con `email_confirmed_at = null`
3. **Frontend muestra `VerificationSuccess` component**
4. Supabase envía email de confirmación
5. Usuario click en link del email
6. Redirige a `/auth/callback?token=...`
7. Callback intercambia token por sesión
8. Redirige a `/auth/confirm` (página de éxito)
9. Usuario hace login normalmente

---

## Recursos adicionales

- [Supabase Email Authentication](https://supabase.com/docs/guides/auth/auth-email)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email#email-templates)
- [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
