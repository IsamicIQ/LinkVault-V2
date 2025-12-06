# Supabase Configuration for Fake/Test Emails

To allow users to sign up with fake email domains (like `example.com`, `testing.com`, etc.), you need to configure your Supabase project settings.

## Steps to Allow Any Email Domain

### 1. Disable Email Confirmation (Recommended for Development/Testing)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Settings**
4. Scroll down to **Email Auth** section
5. Find **"Enable email confirmations"** toggle
6. **Turn OFF** email confirmations
7. Click **Save**

This allows users to sign up with any email (including fake domains) without needing to verify their email address.

### 2. Alternative: Keep Email Confirmation but Allow Any Domain

If you want to keep email confirmation enabled but still allow fake domains:

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**, ensure **"Enable email confirmations"** is ON
3. Scroll to **"Email Templates"** section
4. The system will still send confirmation emails, but fake email addresses won't be able to receive them
5. Users with fake emails can still create accounts, but won't be able to confirm them

**Note:** With email confirmation enabled, users with fake emails won't be able to fully activate their accounts unless you manually confirm them in the Supabase dashboard.

### 3. Disable Email Domain Restrictions (if any)

Supabase doesn't typically restrict email domains by default, but if you're experiencing issues:

1. Go to **Authentication** → **Settings**
2. Check for any **"Allowed email domains"** or **"Blocked email domains"** settings
3. Ensure no restrictions are set, or add your test domains to the allowed list

### 4. Test the Configuration

After making changes:

1. Try signing up with a fake email: `test@example.com`
2. Use password: `test123456`
3. You should be able to create the account and log in immediately (if email confirmation is disabled)

## Current Configuration

The application code is already configured to:
- Accept any email format that matches standard email regex
- Handle signups with or without email confirmation
- Redirect users appropriately after signup

## Important Notes

- **Development/Testing**: Disabling email confirmation is fine for development and testing
- **Production**: Consider keeping email confirmation enabled for production to prevent spam accounts
- **Fake Emails**: With email confirmation disabled, users can use any email format including:
  - `user@example.com`
  - `test@testing.com`
  - `fake@fake.com`
  - Any other domain

## Troubleshooting

If you still can't sign up with fake emails:

1. Check Supabase logs: **Logs** → **Auth Logs**
2. Look for any error messages related to email validation
3. Verify the **"Enable email confirmations"** setting is OFF
4. Try clearing browser cache and cookies
5. Check that your Supabase project is not in a restricted mode

