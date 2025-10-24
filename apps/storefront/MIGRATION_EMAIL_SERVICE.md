# Email Service Migration

## ⚠️ @persepolis/mail is DEPRECATED

**Date:** 2025-10-24
**Replaced by:** `/src/lib/email/service.ts`

## Why?

The `@persepolis/mail` package was creating duplication and violating the DRY principle:
- Two different services doing the same thing
- Both using the same SMTP configuration (Brevo)
- No centralized documentation
- Harder to maintain across the monorepo

## What Changed?

### Before (OLD - DON'T USE)
```typescript
import { sendMail } from '@persepolis/mail'
import { render } from '@react-email/render'
import Mail from '@/emails/order_notification_owner'

await sendMail({
  name: config.name,
  to: 'user@example.com',
  subject: 'An order was created.',
  html: await render(
    Mail({
      id: order.id,
      payable: '100.00',
      orderNum: '12345',
    })
  ),
})
```

### After (NEW - USE THIS)
```typescript
import { sendEmail, OrderNotificationEmail } from '@/lib/email'

await sendEmail({
  to: 'user@example.com',
  subject: 'An order was created.',
  template: OrderNotificationEmail({
    id: order.id,
    payable: '100.00',
    orderNum: '12345',
  }),
})
```

## Benefits of New Service

✅ **Simpler API** - No need to manually call `render()`
✅ **Better typing** - Full TypeScript support
✅ **Centralized** - Single source of truth
✅ **Better error handling** - Consistent logging
✅ **Documentation** - See `/src/lib/email/README.md`
✅ **Testing endpoint** - `/api/email/test` for verification

## Migration Checklist

- [x] Remove `@persepolis/mail` from package.json
- [x] Replace imports in `/app/api/orders/route.ts`
- [x] Update email templates to use new service
- [ ] Run `npm install` to remove the package
- [ ] Test email sending functionality
- [ ] Update other apps if they use `@persepolis/mail`

## Configuration

Both services use the same environment variables:
```env
MAIL_SMTP_HOST=smtp-relay.brevo.com
MAIL_SMTP_PORT=587
MAIL_SMTP_USER=your-smtp-user
MAIL_SMTP_PASS=your-smtp-password
MAIL_FROM_EMAIL=noreply@plottdesign.com
MAIL_FROM_NAME=PlottDesign
```

## Email Architecture

### Supabase Auth (Automatic)
- Email verification on signup
- Password reset
- Email change confirmation

### Custom Email Service (Manual - Use for)
- Order notifications to owners
- Marketing emails
- Custom transactional emails
- Newsletter subscriptions

## Testing

Test your email configuration:
```bash
# Development only
curl http://localhost:7777/api/email/test
```

## Need Help?

See `/src/lib/email/README.md` for complete documentation.
