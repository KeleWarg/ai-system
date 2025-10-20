# Deployment Guide

This guide will walk you through deploying your AI Design System to Vercel.

## Prerequisites

Before deploying, ensure you have:

- [x] Completed all 9 parts of the build
- [x] Supabase project set up with schema deployed
- [x] Anthropic API key obtained
- [x] All tests passing locally
- [ ] Vercel account (free tier works)
- [ ] GitHub account (optional, for CI/CD)

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

## Step 3: Deploy (Preview)

From your project root:

```bash
cd ai-design-system
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No
- **Project name?** → `ai-design-system` (or your preferred name)
- **Directory?** → `./`
- **Override settings?** → No

Vercel will deploy a preview version and give you a URL like:
`https://ai-design-system-abc123.vercel.app`

## Step 4: Configure Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`ai-design-system`)
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your-anon-key-from-supabase
```

```
SUPABASE_SERVICE_ROLE_KEY
Value: your-service-role-key-from-supabase
⚠️ IMPORTANT: Keep this secret! Never expose in client code
```

```
ANTHROPIC_API_KEY
Value: your-anthropic-api-key
⚠️ IMPORTANT: Keep this secret!
```

```
NEXT_PUBLIC_SITE_URL
Value: https://your-project-name.vercel.app
```

### How to Get These Values:

#### Supabase Keys:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

#### Anthropic API Key:
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Go to **API Keys**
3. Create a new key or copy existing one
4. Copy key → `ANTHROPIC_API_KEY`

#### Site URL:
Use your Vercel deployment URL (e.g., `https://ai-design-system.vercel.app`)

## Step 5: Apply Environment Variables

After adding all variables:
1. Click **Save** for each variable
2. Go to **Deployments** tab
3. Click the **⋮** menu on your latest deployment
4. Click **Redeploy**
5. Check "Use existing Build Cache" is **unchecked**
6. Click **Redeploy**

## Step 6: Deploy to Production

Once your preview deployment works correctly:

```bash
vercel --prod
```

This will deploy to your production URL.

## Step 7: Update NEXT_PUBLIC_SITE_URL

After production deployment:
1. Copy your production URL (e.g., `https://ai-design-system.vercel.app`)
2. Update `NEXT_PUBLIC_SITE_URL` in Vercel Environment Variables
3. Redeploy one more time

## Step 8: Test Production Deployment

Test all key endpoints:

```bash
# Replace with your actual URL
SITE_URL="https://ai-design-system.vercel.app"

# Test homepage
curl $SITE_URL

# Test Registry API
curl $SITE_URL/api/registry

# Test MCP Server
curl $SITE_URL/api/mcp

# Test llms.txt
curl $SITE_URL/llms.txt

# Test component docs (if components exist)
curl $SITE_URL/docs/components
```

## Step 9: Optional - Connect GitHub for CI/CD

For automatic deployments on every push:

1. Create a GitHub repository
2. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/ai-design-system.git
   git branch -M main
   git push -u origin main
   ```
3. In Vercel Dashboard:
   - Go to **Settings** → **Git**
   - Connect your GitHub repository
   - Vercel will now auto-deploy on every push to main

## Production Checklist

Before announcing your design system:

- [ ] All environment variables set in Vercel
- [ ] Supabase database schema deployed
- [ ] At least one admin user created in Supabase
- [ ] Test login at `/admin/login`
- [ ] Create at least one theme
- [ ] Upload and generate at least one component
- [ ] Test Registry API returns components
- [ ] Test MCP Server endpoint works
- [ ] Test llms.txt is accessible
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production URL
- [ ] Test component copying from public docs

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Try building locally: `npm run build`

### Environment Variables Not Working
- Ensure you redeployed after adding variables
- Check variable names match exactly (case-sensitive)
- Don't use quotes around values in Vercel UI

### API Routes Return 500
- Check Vercel function logs
- Verify Supabase connection works
- Verify Anthropic API key is valid

### Components Not Showing
- Check if Supabase database has data
- Verify RLS policies allow public read access for components
- Check browser console for errors

### Real-time Updates Not Working
- Ensure Supabase Realtime is enabled for your tables
- Check Supabase logs for websocket connections
- Verify RLS policies allow subscriptions

## Custom Domain (Optional)

To use your own domain:

1. Go to Vercel Dashboard → **Settings** → **Domains**
2. Add your domain
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain
5. Redeploy

## Monitoring & Analytics

Vercel provides built-in analytics:
- Go to **Analytics** tab in dashboard
- View page views, API calls, and performance metrics

## Cost Considerations

**Free Tier Limits:**
- 100 GB bandwidth/month
- 100 GB-hours serverless function execution
- 6,000 build minutes/month

**Supabase Free Tier:**
- 500 MB database
- 1 GB bandwidth/month
- 2 GB storage

**Anthropic API:**
- Pay-as-you-go pricing
- Monitor usage in Anthropic Console

## Next Steps

After deployment:
1. Share your design system URL with your team
2. Add components via admin panel
3. Integrate with AI tools (v0, Claude, Cursor)
4. Monitor usage and performance
5. Iterate based on feedback

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

🎉 **Congratulations!** Your AI Design System is now live!

