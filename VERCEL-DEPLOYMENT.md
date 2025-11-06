# Vercel Deployment Guide

## Quick Deploy

### 1. Environment Variables (Required)

Set these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Site URL (optional, auto-detected in production)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 2. Build Settings

The build command will automatically run:
```bash
npm run build
# This includes: npm run prebuild → npm run validate:colors && tsx scripts/prebuild-components.ts
```

**Build Command:** `npm run build` (default)
**Output Directory:** `.next` (default)
**Install Command:** `npm install` (default)

### 3. Deploy Process

```bash
# Push to git (triggers automatic deployment if connected to Vercel)
git push origin main

# Or deploy manually via Vercel CLI
npx vercel --prod
```

### 4. Post-Deployment

After first deployment:
1. Components are synced from database during build
2. All components bundled into deployment
3. Dynamic imports work automatically
4. Theme switching enabled

### 5. Adding New Components

**Production Workflow:**
1. Create component via admin UI or CLI
2. Component saves to database ✅
3. **Redeploy to Vercel** (components pulled during prebuild)
4. Component available in production ✅

**Automatic Redeployment Options:**
- Push any change to trigger rebuild
- Use Vercel deploy hooks
- Manual redeploy via Vercel dashboard

## How It Works

### Build Process
```
1. npm run prebuild
   ↓ Validates color system
   ↓ Fetches all components from Supabase
   ↓ Writes to components/registry/*.tsx
   ↓ Updates index.ts with exports
   
2. npm run build (next build)
   ↓ Next.js bundles all components
   ↓ Creates optimized production build
   
3. Deploy
   ↓ All components included in bundle
   ✅ Dynamic imports work!
```

### Component Flow
```
Local Development:
1. Generate component → Saves to DB + Filesystem
2. Preview immediately ✅

Production:
1. Generate component → Saves to DB only
2. Next deployment → Prebuild syncs from DB
3. Component bundled and available ✅
```

## Troubleshooting

### Build Fails

**Error:** "SUPABASE_SERVICE_ROLE_KEY not found"
**Fix:** Add environment variable in Vercel settings

**Error:** "ANTHROPIC_API_KEY not found"
**Fix:** Add environment variable in Vercel settings

**Error:** "Module not found: Can't resolve './component-name'"
**Fix:** Component not synced - check prebuild logs

### Components Not Showing

**Issue:** New component not visible after deployment
**Fix:** Component was added after last build - redeploy to sync

**Issue:** "Component not found in module"
**Fix:** Check component_name in database matches export name

## Advanced Configuration

### Custom Build Command

If you need custom prebuild logic:

```json
{
  "scripts": {
    "prebuild": "npm run validate:colors && tsx scripts/prebuild-components.ts && tsx scripts/custom-setup.ts",
    "build": "next build"
  }
}
```

### Vercel Deploy Hooks

Automate redeployment when components are added:

1. Create deploy hook in Vercel dashboard
2. Call hook URL after component creation
3. Automatic rebuild and deployment

### Preview Deployments

Preview deployments also run prebuild:
- PR branches get their own preview URL
- Components synced from database
- Test before merging to production

## Monitoring

### Check Build Logs

Look for:
```
📦 Syncing components from database to filesystem...
Found X components to sync
✅ component-slug.tsx → ComponentName
🎉 Successfully synced X components!
```

### Verify Components

After deployment:
```bash
# Check component URLs
https://your-domain.vercel.app/docs/components/component-slug
https://your-domain.vercel.app/admin/components/component-slug
```

## Security Notes

- ✅ Service role key only used during build (server-side)
- ✅ Anon key safe for client-side use
- ✅ Row Level Security enforced on Supabase
- ✅ Admin routes protected by authentication

## Need Help?

- Check Vercel build logs
- Verify environment variables are set
- Test prebuild script locally: `npm run prebuild`
- Check Supabase connection: `npx tsx scripts/check-db-components.ts`

