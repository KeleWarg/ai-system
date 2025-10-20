# Supabase Setup Instructions

Part 2 code is complete! Now you need to set up your Supabase project.

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: ai-design-system
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait ~2 minutes for initialization

## Step 2: Get API Credentials

1. In your project dashboard, go to **Settings** → **API**
2. Copy these three values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (click "Reveal" first, starts with `eyJ...`)

## Step 3: Update .env.local

Open `.env.local` and fill in your credentials:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Anthropic API (add this in Part 6)
ANTHROPIC_API_KEY=

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 4: Apply Database Schema

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `database/schema.sql` in your editor
4. Copy the **entire file contents**
5. Paste into the Supabase SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see: "Success. No rows returned"

## Step 5: Verify Tables Created

1. Click **Table Editor** (left sidebar)
2. You should see these tables:
   - `users`
   - `themes`
   - `components`

## Step 6: Create Admin User

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Fill in:
   - **Email**: your-email@example.com
   - **Password**: your-secure-password
   - **Auto Confirm User**: ✅ **YES** (important!)
4. Click **Create User**

## Step 7: Promote User to Admin

1. Go to **SQL Editor**
2. Run this query (replace with your email):

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Step 8: Run Tests Again

```bash
npm run test:part2
```

You should now see **16/16 tests passed**!

## ✅ Checklist

- [ ] Supabase project created
- [ ] Credentials added to `.env.local`
- [ ] Database schema applied
- [ ] Tables visible in Table Editor
- [ ] Admin user created
- [ ] User promoted to admin role
- [ ] Tests passing (16/16)

## 🎉 Part 2 Complete!

Once all tests pass, you're ready for **Part 3: Authentication**!

## Troubleshooting

**"Success. No rows returned" but tables not showing?**
- Refresh the page
- Check you're in the "public" schema (dropdown in Table Editor)

**"Permission denied" errors?**
- Verify RLS policies were created (check SQL Editor history)
- Make sure you used the anon key, not service key for client

**Connection errors?**
- Double-check URL and keys in `.env.local`
- No quotes around values
- No extra spaces
- Restart dev server: `npm run dev`

