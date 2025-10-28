# 🔐 Supabase Auth Implementation Guide

## Overview

This project has been migrated from custom OTP authentication to **Supabase Auth** with Google OAuth and Magic Links. This provides enterprise-grade security, better UX, and significantly less maintenance.

## ✅ What Was Implemented

### Security Improvements
- ✅ **Google OAuth** - One-click sign-in with Google
- ✅ **Magic Links** - Passwordless email authentication
- ✅ **Automatic token refresh** - Built-in session management
- ✅ **Rate limiting** - Protection against brute force attacks
- ✅ **Admin role verification** - Email-based access control for admin panel
- ✅ **Server-side validation** - Uses `getUser()` for secure token verification

### Architecture
- ✅ **Shared auth package** (`packages/auth`) - DRY principle, zero code duplication
- ✅ **Admin role checking** - Middleware verifies admin emails
- ✅ **Automatic user sync** - Supabase users linked to Prisma models via `supabaseId`
- ✅ **Type-safe** - Full TypeScript support

### Database Changes
- Added `supabaseId` field to `User`, `Owner`, and `Author` models
- Removed `OTP` fields (no longer needed)
- Maintains backward compatibility with existing data

---

## 🚀 Setup Instructions

### 1. Environment Variables

#### Admin App (`apps/admin/.env`)

```env
# Database
DATABASE_URL="postgresql://postgres:your-password@db.lryfurpxiwatliwsoset.supabase.co:5432/postgres"

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL="https://lryfurpxiwatliwsoset.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Admin Access Control - IMPORTANT!
ADMIN_EMAILS="plottdesign.es@gmail.com,another-admin@example.com"

# Email Service (for transactional emails - not auth)
MAIL_SMTP_HOST="smtp-relay.brevo.com"
MAIL_SMTP_PORT="587"
MAIL_SMTP_USER="your-brevo-login"
MAIL_SMTP_PASS="your-brevo-api-key"
MAIL_FROM_EMAIL="noreply@plottdesign.com"
MAIL_FROM_NAME="PlottDesign"

# App Config
NEXT_PUBLIC_URL="http://localhost:8888"
NODE_ENV="development"
```

#### Storefront App (`apps/storefront/.env`)

```env
# Database (same as admin)
DATABASE_URL="postgresql://postgres:your-password@db.lryfurpxiwatliwsoset.supabase.co:5432/postgres"

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL="https://lryfurpxiwatliwsoset.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Email Service
MAIL_SMTP_HOST="smtp-relay.brevo.com"
MAIL_SMTP_PORT="587"
MAIL_SMTP_USER="your-brevo-login"
MAIL_SMTP_PASS="your-brevo-api-key"
MAIL_FROM_EMAIL="noreply@plottdesign.com"
MAIL_FROM_NAME="PlottDesign"

# App Config
NEXT_PUBLIC_URL="http://localhost:7777"
NODE_ENV="development"
```

---

### 2. Get Supabase API Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/lryfurpxiwatliwsoset/settings/api)
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (admin only)

---

### 3. Configure Google OAuth

#### A. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**

#### B. OAuth Consent Screen

1. Navigate to **APIs & Services → OAuth consent screen**
2. Select **External** user type
3. Fill in:
   - **App name**: PlottDesign
   - **User support email**: plottdesign.es@gmail.com
   - **Developer contact**: plottdesign.es@gmail.com
4. Add scopes:
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Save

#### C. Create OAuth Credentials

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: **PlottDesign Web**
5. **Authorized JavaScript origins**:
   ```
   http://localhost:7777
   http://localhost:8888
   https://your-production-domain.com
   ```
6. **Authorized redirect URIs**:
   ```
   https://lryfurpxiwatliwsoset.supabase.co/auth/v1/callback
   ```
7. Copy **Client ID** and **Client Secret**

#### D. Configure in Supabase

1. Go to [Supabase Auth Providers](https://supabase.com/dashboard/project/lryfurpxiwatliwsoset/auth/providers)
2. Find **Google** provider
3. Enable it
4. Paste:
   - Client ID
   - Client Secret
5. Save

---

### 4. Configure Redirect URLs in Supabase

1. Go to [URL Configuration](https://supabase.com/dashboard/project/lryfurpxiwatliwsoset/auth/url-configuration)
2. Add redirect URLs:
   ```
   http://localhost:7777/auth/callback
   http://localhost:8888/auth/callback
   https://your-production-domain.com/auth/callback
   https://admin.your-production-domain.com/auth/callback
   ```

---

### 5. Database Migration

Run the Prisma migration to add `supabaseId` fields:

```bash
# Admin
cd apps/admin
npx prisma db push
npx prisma generate

# Storefront
cd apps/storefront
npx prisma db push
npx prisma generate
```

---

## 🔒 Security Features

### Admin Panel Access Control

The admin middleware verifies user email against `ADMIN_EMAILS`:

```typescript
// apps/admin/src/middleware.ts
const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim())
const { isAdmin, user } = await checkAdminRole(req, adminEmails)
```

**To grant admin access:**
1. Add email to `ADMIN_EMAILS` in `.env`
2. User signs in with Google (or magic link)
3. Middleware automatically creates `Owner` record
4. User has admin access

### Authentication Flow

#### Google OAuth
```
User clicks "Continue with Google" →
Google auth page →
User approves →
Redirects to /auth/callback →
Supabase creates session →
User redirected to dashboard
```

#### Magic Link
```
User enters email →
Supabase sends magic link →
User clicks link in email →
Redirects to /auth/callback →
Supabase creates session →
User redirected to dashboard
```

---

## 📁 Project Structure

```
packages/auth/           # Shared authentication package
├── src/
│   ├── supabase/
│   │   ├── client.ts    # Browser client
│   │   ├── server.ts    # Server client
│   │   └── middleware.ts # Middleware utilities
│   ├── utils/
│   │   └── get-user.ts  # User fetching
│   └── types/
│       └── index.ts     # TypeScript types

apps/admin/
├── src/
│   ├── middleware.ts    # Admin role verification
│   ├── lib/
│   │   ├── supabase/    # Re-exports from shared package
│   │   └── auth/
│   │       └── get-owner.ts  # Get current admin owner
│   └── app/
│       ├── auth/callback/route.ts
│       ├── api/auth/logout/route.ts
│       └── login/components/user-auth-form.tsx

apps/storefront/
├── src/
│   ├── middleware.ts    # Session refresh only
│   ├── lib/
│   │   ├── supabase/    # Re-exports from shared package
│   │   └── auth/
│   │       └── get-user.ts  # Get current user
│   └── app/
│       ├── auth/callback/route.ts
│       ├── api/auth/logout/route.ts
│       └── login/components/user-auth-form.tsx
```

---

## 🧪 Testing

### 1. Test Admin Login

```bash
cd apps/admin
npm run dev
```

1. Navigate to http://localhost:8888/login
2. Click "Continue with Google"
3. Sign in with an email from `ADMIN_EMAILS`
4. You should be redirected to dashboard
5. Check database: `Owner` record should be created with `supabaseId`

### 2. Test Storefront Login

```bash
cd apps/storefront
npm run dev
```

1. Navigate to http://localhost:7777/login
2. Try both Google OAuth and Magic Link
3. Check database: `User` record should be created with `supabaseId`

### 3. Test Logout

```bash
# Visit in browser:
http://localhost:8888/api/auth/logout  # Admin
http://localhost:7777/api/auth/logout  # Storefront
```

---

## 🛠️ Development

### Using the Shared Auth Package

```typescript
// Import from shared package
import { createClient, getCurrentUser, checkIsAdmin } from '@persepolis/auth'

// Client Components
'use client'
const supabase = createClient()
await supabase.auth.signInWithOAuth({ provider: 'google' })

// Server Components
const user = await getCurrentUser()
if (!user) redirect('/login')

// Admin checking
const { isAdmin } = await checkIsAdmin(['admin@example.com'])
```

### Database User Sync

Users are automatically synced when they first authenticate:

**Admin:**
- `apps/admin/src/lib/auth/get-owner.ts:22-35` - Auto-creates Owner if admin email

**Storefront:**
- `apps/storefront/src/lib/auth/get-user.ts:24-37` - Auto-creates User with Cart

---

## 🚨 Important Notes

1. **Never commit real API keys** - Use `.env.example` as template
2. **ADMIN_EMAILS is critical** - Only emails in this list can access admin panel
3. **Test both apps** before deploying
4. **Backup database** before running migrations
5. **Google OAuth** requires HTTPS in production

---

## 📚 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Next.js Auth Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)

---

## ✅ Migration Checklist

- [ ] Get Supabase API keys
- [ ] Configure Google OAuth credentials
- [ ] Add redirect URLs to Supabase
- [ ] Set environment variables in both apps
- [ ] Add admin emails to `ADMIN_EMAILS`
- [ ] Run database migrations
- [ ] Test admin login with Google
- [ ] Test storefront login with Magic Link
- [ ] Test logout functionality
- [ ] Verify user sync in database
- [ ] Deploy to production

---

**Last Updated:** October 2025
**Status:** ✅ Complete and ready for production
