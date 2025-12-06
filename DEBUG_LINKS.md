# Debugging Link Saving/Loading Issues

## Quick Checks

1. **Open Browser Console** (F12) and check for errors
2. **Check if user is authenticated** - Look for console logs showing user ID
3. **Check Network tab** - See if API calls are being made and what responses you get

## Common Issues

### Links Not Saving
- Check browser console for errors when clicking "Save Link"
- Verify you're logged in (email should show in header)
- Check if RLS policies are set up correctly in Supabase

### Links Not Loading
- Check browser console for errors
- Verify user authentication
- Check if RLS policies allow SELECT for your user
- Try clicking the refresh button (circular arrow icon)

## Manual Database Check

Run this in Supabase SQL Editor to see all your links:

```sql
SELECT 
  id,
  url,
  title,
  user_id,
  created_at
FROM links
ORDER BY created_at DESC;
```

To see links for a specific user (replace with your user ID):

```sql
SELECT 
  id,
  url,
  title,
  user_id,
  created_at
FROM links
WHERE user_id = 'YOUR_USER_ID_HERE'
ORDER BY created_at DESC;
```

## Check RLS Policies

Run this to verify RLS policies exist:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'links';
```

## Test Authentication

In browser console, run:

```javascript
// Check current user
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

// Check session
const { data: { session } } = await supabase.auth.getSession()
console.log('Current session:', session)
```

