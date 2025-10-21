# 🚀 Quick Deployment Steps

## ✅ COMPLETED
- [x] Code committed and pushed to GitHub
- [x] Production build tested and passing
- [x] All Phase 3 & 4 features complete

---

## 🎯 NEXT: Deploy to Vercel

### Option 1: Vercel Dashboard (Easiest)

1. **Go to Vercel:** https://vercel.com/new
2. **Import Repository:**
   - Click "Add New" → "Project"
   - Select your GitHub account
   - Find repository: `ai-system`
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `ai-design-system` (IMPORTANT!)
   - **Build Command:** `npm run build` (default)
   - **Install Command:** `npm install` (default)
   - Click "Deploy" (will fail first time - need env vars)

4. **Add Environment Variables:**
   
   After first deployment (will fail), go to:
   - Settings → Environment Variables
   - Add each of these:

   ```
   NEXT_PUBLIC_SUPABASE_URL = [Your Supabase URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [Your Supabase Anon Key]
   SUPABASE_SERVICE_ROLE_KEY = [Your Supabase Service Role Key]
   ANTHROPIC_API_KEY = [Your Anthropic API Key]
   NEXT_PUBLIC_SITE_URL = https://[your-vercel-url].vercel.app
   ```

5. **Redeploy:**
   - Go to Deployments
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger auto-deploy

---

### Option 2: Vercel CLI (For Advanced Users)

```bash
# 1. Install Vercel CLI (if not installed)
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy to staging
cd "/Users/keleibekwe/Documents/AI System/ai-design-system"
vercel

# 4. Deploy to production
vercel --prod

# Note: You'll need to add environment variables via dashboard first
```

---

## 🔐 Where to Find Your Keys

### Supabase Keys
1. Go to: https://app.supabase.com/project/_/settings/api
2. Copy:
   - **URL:** `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role (secret):** `SUPABASE_SERVICE_ROLE_KEY`

### Anthropic API Key
1. Go to: https://console.anthropic.com/settings/keys
2. Create new key if needed
3. Copy: `ANTHROPIC_API_KEY`

### Site URL
- **For first deploy:** Use the Vercel URL you get after deployment
- **Example:** `https://ai-system-abc123.vercel.app`
- **Later:** Can add custom domain in Vercel settings

---

## ✅ Post-Deployment Checklist

After deployment succeeds:

1. **Visit your site:** `https://[your-url].vercel.app`
2. **Test login:** Go to `/admin/login`
3. **Check if you're admin:**
   - If not, run in Supabase SQL Editor:
   ```sql
   UPDATE public.users 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```
4. **Test component creation:** `/admin/components/new`
5. **Verify all pages load:**
   - `/` (homepage)
   - `/docs/components` (public docs)
   - `/admin` (admin dashboard)
   - `/api/themes` (API endpoint)

---

## 🎊 You're Live!

Once deployed, your AI Design System will be at:
- **Main Site:** `https://your-url.vercel.app`
- **Admin:** `https://your-url.vercel.app/admin`
- **Docs:** `https://your-url.vercel.app/docs`
- **API:** `https://your-url.vercel.app/api/mcp`

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Make sure Root Directory is set to `ai-design-system`

### Can't Login
- Verify Supabase URL is correct
- Check if user exists in Supabase Auth
- Try resetting password in Supabase dashboard

### AI Features Don't Work
- Verify `ANTHROPIC_API_KEY` is correct
- Check you have credits in Anthropic account
- Look at function logs in Vercel

### "Unauthorized" Errors
- Make sure you're logged in
- Verify your user has role = 'admin' in database
- Check RLS policies are enabled in Supabase

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

**Ready to deploy? Let's go! 🚀**

