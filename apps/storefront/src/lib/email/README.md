# Email Service

Servicio unificado de correo electrónico para PlottDesign. Utiliza Brevo SMTP y React Email para enviar correos transaccionales.

## Configuración

Las siguientes variables de entorno son requeridas en `.env`:

```env
MAIL_SMTP_HOST=smtp-relay.brevo.com
MAIL_SMTP_PORT=587
MAIL_SMTP_USER=your-brevo-smtp-user
MAIL_SMTP_PASS=your-brevo-smtp-password
MAIL_FROM_EMAIL=noreply@plottdesign.com
MAIL_FROM_NAME=PlottDesign
```

## Uso

### Enviar email con plantilla React Email

```typescript
import { sendEmail, VerificationEmail } from '@/lib/email'

await sendEmail({
  to: 'user@example.com',
  subject: 'Verify your email',
  template: <VerificationEmail name="John Doe" code="123456" />
})
```

### Enviar email de texto plano

```typescript
import { sendPlainEmail } from '@/lib/email'

await sendPlainEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  text: 'Thanks for signing up!',
  html: '<p>Thanks for signing up!</p>'
})
```

### Verificar conexión

```typescript
import { verifyEmailConnection } from '@/lib/email'

const isReady = await verifyEmailConnection()
```

## Testing (Solo en Development)

### 1. Verificar configuración SMTP

```bash
curl http://localhost:7777/api/email/test
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "Email service is configured correctly",
  "config": {
    "host": "smtp-relay.brevo.com",
    "port": "587",
    "from": "PlottDesign <noreply@plottdesign.com>"
  }
}
```

### 2. Enviar email de prueba

#### Email de verificación
```bash
curl -X POST http://localhost:7777/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"to": "tu-email@example.com", "type": "verification"}'
```

#### Email de orden
```bash
curl -X POST http://localhost:7777/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"to": "tu-email@example.com", "type": "order"}'
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "Test verification email sent successfully to tu-email@example.com",
  "messageId": "<message-id@smtp>",
  "type": "verification",
  "recipient": "tu-email@example.com"
}
```

### 3. Revisar tu bandeja de entrada

Después de enviar el email de prueba:
1. Revisa tu bandeja de entrada
2. Si no lo ves, revisa la carpeta de SPAM
3. Los emails tienen el prefijo `[TEST]` en el asunto

**Nota:** Los endpoints de testing solo funcionan en modo development.

## Plantillas disponibles

- `VerificationEmail` - Email de verificación de cuenta
- `OrderNotificationEmail` - Notificación de pedido al propietario

## Principio DRY

Este servicio centraliza toda la lógica de envío de emails:

- ✅ **Una sola configuración SMTP** (no múltiples transporters)
- ✅ **Reutilización de plantillas** React Email
- ✅ **Manejo de errores consistente**
- ✅ **Logging unificado**

## Supabase Auth

**IMPORTANTE**: Supabase Auth maneja automáticamente el envío de emails de:
- Verificación de email en signup
- Recuperación de contraseña
- Cambio de email

Para estos casos, Supabase usa su propio servicio de email. Para emails transaccionales personalizados (como notificaciones de pedidos), usa este servicio.

## Migración desde código existente

### ❌ Antes (sin DRY)
```typescript
// Cada archivo creaba su propio transporter
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SMTP_HOST,
  // ... configuración repetida
})

await transporter.sendMail({...})
```

### ✅ Ahora (con DRY)
```typescript
import { sendEmail, VerificationEmail } from '@/lib/email'

await sendEmail({
  to: 'user@example.com',
  subject: 'Verify your email',
  template: <VerificationEmail name="User" code="123456" />
})
```
