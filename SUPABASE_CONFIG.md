# Configuración de Supabase

Este documento detalla los cambios de configuración necesarios en el panel de Supabase para mejorar la experiencia de autenticación.

## 1. Cambiar el Site URL y Branding

### Problema
Actualmente, cuando los usuarios inician sesión con Google, ven:
```
Sign in to lryfurpxiwatliwsoset.supabase.co
```

### Solución
Configurar el Site URL personalizado en Supabase:

1. Ve a **Supabase Dashboard** → Tu proyecto → **Authentication** → **URL Configuration**

2. Configura los siguientes campos:

   - **Site URL**: `https://tu-dominio.com` (o `http://localhost:7777` para desarrollo)

   - **Redirect URLs**: Agregar las siguientes URLs permitidas:
     ```
     http://localhost:7777/auth/callback
     https://tu-dominio.com/auth/callback
     http://localhost:8888/auth/callback  (para admin)
     ```

3. Ve a **Project Settings** → **General**:

   - **Project Name**: `PlottDesign` (esto se mostrará en los emails y pantallas de OAuth)

4. **Email Templates** → Personaliza los templates:

   Ve a **Authentication** → **Email Templates** y personaliza:

   - **Confirm signup**: Email de verificación
   - **Magic Link**: Login sin contraseña
   - **Change Email Address**: Cambio de email
   - **Reset Password**: Recuperación de contraseña

### Template de Email Recomendado para "Confirm signup":

```html
<h2>Welcome to PlottDesign!</h2>
<p>Follow this link to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>If you didn't create an account with us, you can safely ignore this email.</p>
```

---

## 2. Configuración de Google OAuth

### Obtener las credenciales de Google

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Google+ API**
4. Ve a **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configura:
   - **Application type**: Web application
   - **Authorized JavaScript origins**:
     ```
     http://localhost:7777
     https://tu-dominio.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://lryfurpxiwatliwsoset.supabase.co/auth/v1/callback
     ```

   > **Nota**: La redirect URI de Supabase la encuentras en:
   > Supabase Dashboard → Authentication → Providers → Google

6. Copia el **Client ID** y **Client Secret**

### Configurar en Supabase

1. Ve a **Authentication** → **Providers** → **Google**
2. Habilita el provider
3. Pega el **Client ID** y **Client Secret**
4. Guarda los cambios

### Scopes requeridos

Supabase automáticamente solicita estos scopes:
- `openid`
- `email`
- `profile`

Estos scopes permiten obtener:
- Email del usuario
- Nombre completo
- Foto de perfil (avatar_url o picture)

---

## 3. Variables de Entorno

Asegúrate de tener configuradas las siguientes variables en `.env`:

### Storefront (`apps/storefront/.env`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://lryfurpxiwatliwsoset.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Site URL (para producción)
NEXT_PUBLIC_URL=https://tu-dominio.com

# Google Auth (opcional, si no está habilitado por defecto)
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true

# Database
DATABASE_URL=postgresql://postgres:password@db.lryfurpxiwatliwsoset.supabase.co:5432/postgres

# Brevo Email
BREVO_API_KEY=tu_brevo_api_key
MAIL_FROM_EMAIL=noreply@plottdesign.com
MAIL_FROM_NAME=PlottDesign
```

### Admin (`apps/admin/.env`)

```bash
# Supabase (mismas credenciales)
NEXT_PUBLIC_SUPABASE_URL=https://lryfurpxiwatliwsoset.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Site URL (diferente puerto para desarrollo)
NEXT_PUBLIC_URL=http://localhost:8888

# Database (misma base de datos)
DATABASE_URL=postgresql://postgres:password@db.lryfurpxiwatliwsoset.supabase.co:5432/postgres
```

---

## 4. Migración de Base de Datos

Después de agregar el campo `avatarUrl` al schema de Prisma, ejecuta:

```bash
# Storefront
cd apps/storefront
npx prisma db push
npx prisma generate

# Admin
cd apps/admin
npx prisma db push
npx prisma generate
```

---

## 5. Verificación de Configuración

### Checklist

- [ ] Site URL configurado en Supabase
- [ ] Redirect URLs agregadas
- [ ] Project Name cambiado a "PlottDesign"
- [ ] Email templates personalizados
- [ ] Google OAuth configurado y habilitado
- [ ] Variables de entorno actualizadas en ambas apps
- [ ] Migración de Prisma ejecutada
- [ ] `npm install` ejecutado en storefront y admin
- [ ] Build exitoso sin errores

### Probar la configuración

1. **Registro con email**:
   - Ir a `/signup`
   - Registrarse con email
   - Verificar que aparezca la nueva pantalla de verificación
   - Revisar el email de confirmación

2. **Login con Google**:
   - Ir a `/login`
   - Click en "Continue with Google"
   - Verificar que el mensaje diga "Sign in to PlottDesign" (o tu dominio)
   - Después del login, verificar que la foto de perfil se guardó en la base de datos

3. **Verificar avatar en base de datos**:
   ```sql
   SELECT id, email, name, "avatarUrl" FROM "User" WHERE "avatarUrl" IS NOT NULL;
   ```

---

## 6. Troubleshooting

### "Sign in to lryfurpxiwatliwsoset.supabase.co" sigue apareciendo

- Verifica que el Site URL esté configurado correctamente
- Espera 5-10 minutos para que los cambios se propaguen
- Limpia la caché del navegador
- Verifica que estés usando el proyecto correcto de Supabase

### Avatar no se guarda

- Verifica que los scopes de Google OAuth incluyan `profile`
- Revisa los logs del servidor: `console.log(supabaseUser.user_metadata)`
- Asegúrate de que Prisma esté generado: `npx prisma generate`

### Email de verificación no llega

- Revisa la configuración SMTP en Supabase
- Verifica que el email template esté configurado
- Revisa la carpeta de spam
- Usa la función "Resend verification email" en la pantalla de verificación

---

## 7. Recursos Adicionales

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
