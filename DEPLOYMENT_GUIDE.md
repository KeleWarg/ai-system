# 🚀 Deployment Guide - AI Design System

## Pre-Deployment Checklist

### ✅ Completed
- [x] Production build passes
- [x] TypeScript compilation successful
- [x] All Phase 1-4 features implemented
- [x] Security features in place (RLS, rate limiting, auth)
- [x] Toast notifications integrated
- [x] Confirmation dialogs for destructive actions
- [x] Empty states for better UX
- [x] Temp files excluded from build

---

## 🔐 Required Environment Variables

Make sure you have these ready:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Site URL (will be your Vercel URL)
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

---

## 📋 Deployment Steps

### Step 1: Push to GitHub (if not already)

```bash
# Initialize git (if not already initialized)
cd "/Users/keleibekwe/Documents/AI System/ai-design-system"
git init
git add .
git commit -m "Initial commit - Production ready"

# Create GitHub repo and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (first time - will prompt for setup)
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: ai-design-system
# - Directory: ./
# - Override settings? No
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install`

### Step 3: Add Environment Variables in Vercel

**In Vercel Dashboard:**
1. Go to your project
2. Click "Settings" → "Environment Variables"
3. Add each variable:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
ANTHROPIC_API_KEY = your-anthropic-api-key
NEXT_PUBLIC_SITE_URL = https://your-app.vercel.app
```

4. Make sure to select "Production" environment for all variables
5. Click "Save"

### Step 4: Redeploy with Environment Variables

```bash
# Redeploy to production
vercel --prod
```

---

## 🗄️ Supabase Setup for Production

### 1. Run Database Migrations

If you haven't already, run the schema on your production Supabase:

```sql
-- Run database/schema.sql in your Supabase SQL Editor
```

### 2. Verify RLS Policies

Ensure all RLS policies are enabled:
- Users table policies
- Themes table policies  
- Components table policies

### 3. Create Admin User

```sql
-- In Supabase SQL Editor, update your user to admin role
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

---

## 🔍 Post-Deployment Verification

### 1. Test Critical Flows

Visit your deployed app and test:

- [ ] **Homepage loads** → `https://your-app.vercel.app`
- [ ] **Login works** → `/admin/login`
- [ ] **Admin dashboard** → `/admin`
- [ ] **Create theme** → `/admin/themes/new`
- [ ] **Upload PNG and generate component** → `/admin/components/new`
- [ ] **View public docs** → `/docs/components`
- [ ] **API endpoints respond** → `/api/themes`, `/api/components`
- [ ] **MCP endpoint** → `/api/mcp`
- [ ] **llms.txt** → `/llms.txt`

### 2. Check Logs

In Vercel Dashboard:
- Go to "Deployments" → Latest deployment
- Click "View Function Logs"
- Check for any errors

### 3. Test Authentication

- [ ] Login with your Supabase credentials
- [ ] Verify you see admin panel
- [ ] Try accessing `/admin` without login (should redirect)
- [ ] Logout and login again

### 4. Test AI Features

- [ ] Upload a PNG spec sheet
- [ ] Verify Claude API responds
- [ ] Check rate limiting works (max 5 requests/minute)
- [ ] Generate component successfully

---

## ⚙️ Vercel Configuration Verification

Your `vercel.json` is already configured with:
- ✅ Cron job for preview cleanup (hourly)
- ✅ CORS headers
- ✅ Framework preset

No changes needed!

---

## 🔒 Security Checklist

### Before Going Live:

- [ ] **Update CORS policy** in `vercel.json` from `$VERCEL_URL` to your actual domain
- [ ] **Verify RLS policies** are enabled in Supabase
- [ ] **Check rate limiting** is working on AI endpoints
- [ ] **Review Supabase logs** for unauthorized access attempts
- [ ] **Enable Vercel Web Analytics** (optional)
- [ ] **Set up monitoring** (Vercel Analytics or external)

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Check build locally
npm run build

# Check TypeScript
npx tsc --noEmit

# Check for environment variables
vercel env ls
```

### Database Connection Issues

- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Test connection in Supabase dashboard

### AI Features Not Working

- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API key has credits
- Review rate limiting (5 requests/minute)

### Authentication Issues

- Clear browser cookies
- Verify Supabase JWT secret
- Check RLS policies are enabled

---

## 📊 Monitoring & Maintenance

### Set Up Monitoring

1. **Vercel Analytics** (Free tier available)
   - Dashboard → Analytics → Enable

2. **Error Tracking** (Optional)
   - Consider: Sentry, LogRocket, or Vercel Error Tracking

3. **Uptime Monitoring** (Optional)
   - Consider: UptimeRobot, Pingdom

### Regular Maintenance

- [ ] Monitor Anthropic API usage
- [ ] Check Supabase database size
- [ ] Review error logs weekly
- [ ] Update dependencies monthly
- [ ] Backup database regularly

---

## 🎯 Custom Domain (Optional)

### Add Custom Domain

1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Domains"
3. Add your domain: `yourdomain.com`
4. Follow DNS configuration instructions
5. Update `NEXT_PUBLIC_SITE_URL` to your custom domain

---

## 📝 Post-Deployment Updates

### To Deploy Updates:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push

# Vercel auto-deploys from main branch
# Or manually deploy:
vercel --prod
```

---

## 🚨 Rollback (If Needed)

If something goes wrong:

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"

---

## ✅ You're Ready!

Once deployed, your AI Design System will be live at:
- **Production:** `https://your-app.vercel.app`
- **Admin Panel:** `https://your-app.vercel.app/admin`
- **Documentation:** `https://your-app.vercel.app/docs`
- **API:** `https://your-app.vercel.app/api`

**Congratulations! 🎉**

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

