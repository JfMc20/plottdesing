# 📧 Guía de Testing de Emails

Esta guía te ayudará a probar el servicio de emails de PlottDesign.

## ✅ Prerequisitos

1. El servidor debe estar corriendo: `npm run dev`
2. Variables de entorno configuradas en `.env`:
   ```env
   MAIL_SMTP_HOST=smtp-relay.brevo.com
   MAIL_SMTP_PORT=587
   MAIL_SMTP_USER=99d820001@smtp-brevo.com
   MAIL_SMTP_PASS=tu-password
   MAIL_FROM_EMAIL=noreply@plottdesign.com
   MAIL_FROM_NAME=PlottDesign
   ```

## 🧪 Paso 1: Verificar Configuración

```bash
curl http://localhost:7777/api/email/test
```

**Respuesta esperada:**
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

Si ves `success: true`, ¡todo está bien! ✅

## 📨 Paso 2: Enviar Email de Prueba

### Opción A: Email de Verificación

```bash
curl -X POST http://localhost:7777/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"to": "TU_EMAIL_AQUI@gmail.com", "type": "verification"}'
```

Este email incluye:
- Asunto: `[TEST] Verify your email - PlottDesign`
- Código de verificación: `123456`
- Template profesional con tu marca

### Opción B: Email de Orden

```bash
curl -X POST http://localhost:7777/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"to": "TU_EMAIL_AQUI@gmail.com", "type": "order"}'
```

Este email incluye:
- Asunto: `[TEST] New Order Created - PlottDesign`
- Número de orden: `#12345`
- Monto: `$299.99`
- Botón para ver la orden

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Test verification email sent successfully to TU_EMAIL_AQUI@gmail.com",
  "messageId": "<unique-id@smtp-relay.brevo.com>",
  "type": "verification",
  "recipient": "TU_EMAIL_AQUI@gmail.com"
}
```

## 📬 Paso 3: Revisar tu Email

1. **Abre tu bandeja de entrada** del email que especificaste
2. **Busca emails de:** `PlottDesign <noreply@plottdesign.com>`
3. **Asunto comienza con:** `[TEST]`
4. **Si no lo ves:** Revisa la carpeta de SPAM/Promociones

### ¿El email llegó a SPAM?

Esto es normal en desarrollo. Para mejorar la entregabilidad:

1. **Marca como "No es spam"** en tu cliente de correo
2. **Añade** `noreply@plottdesign.com` **a tus contactos**
3. En producción, configura:
   - SPF record
   - DKIM signature
   - DMARC policy

## 🔍 Troubleshooting

### Error: "Missing email configuration"
```bash
# Verifica que las variables de entorno estén correctas
cat .env | grep MAIL_
```

### Error: "Failed to send email"
```bash
# Revisa los logs del servidor
npm run dev

# Deberías ver:
# 📧 Email sent successfully: { to: '...', subject: '...', messageId: '...' }
```

### Error: "Invalid email address format"
```bash
# Asegúrate de usar un email válido
curl -X POST http://localhost:7777/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"to": "email@valido.com", "type": "verification"}'
```

### Email no llega después de 5 minutos
1. Verifica la configuración de Brevo
2. Revisa los límites de envío de tu cuenta
3. Confirma que el email destino no está en lista negra

## 🚀 Siguiente Paso: Test Real

### Crear una orden de prueba

1. Crea una cuenta en la web
2. Añade productos al carrito
3. Completa el checkout
4. ¡El dueño debería recibir un email de notificación!

## 📚 Más Información

- **Documentación completa:** `src/lib/email/README.md`
- **Migración desde @persepolis/mail:** `MIGRATION_EMAIL_SERVICE.md`
- **Código del servicio:** `src/lib/email/service.ts`

## 🎯 Quick Commands

```bash
# Verificar configuración
curl http://localhost:7777/api/email/test

# Enviar email de verificación de prueba
curl -X POST http://localhost:7777/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"to": "tu@email.com", "type": "verification"}'

# Enviar email de orden de prueba
curl -X POST http://localhost:7777/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"to": "tu@email.com", "type": "order"}'

# Ver instrucciones del endpoint
curl http://localhost:7777/api/email/send-test
```

## ⚠️ Importante

- ❌ Los endpoints de testing **NO** están disponibles en producción
- ✅ Solo funcionan cuando `NODE_ENV=development`
- 🔒 En producción, los emails se envían solo a través de eventos reales (órdenes, verificaciones, etc.)

---

**¿Problemas?** Revisa los logs del servidor o consulta la documentación completa.
