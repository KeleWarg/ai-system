# Production Deployment Fix

## Problem
Components were saving to database but failing to render in production because:
1. Vercel filesystem is read-only
2. Dynamic imports (`import('@/components/registry/${slug}')`) fail when files don't exist
3. Component code was only in database, not bundled into deployment

## Solution
Implemented a **prebuild sync** that pulls components from database and writes them to the filesystem BEFORE the build runs. This ensures components are bundled into the Vercel deployment.

## How It Works

### Build Process Flow:
```
1. prebuild: scripts/prebuild-components.ts
   ↓ Fetches all components from Supabase
   ↓ Writes to components/registry/*.tsx
   ↓ Updates index.ts with exports
   ↓ Creates _meta.json
   
2. build: next build
   ↓ Next.js bundles all registry components
   ↓ Creates optimized production build
   
3. deploy: Vercel deployment
   ↓ All components are in the bundle
   ✅ Dynamic imports work!
```

### Vercel Configuration

Update your Vercel build command to:
```bash
npm run build
```

The `prebuild` script runs automatically via npm's lifecycle hooks.

### Environment Variables Required on Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ANTHROPIC_API_KEY=your_api_key
```

## Testing

### Local Test:
```bash
# Clear registry
rm -f components/registry/*.tsx

# Run prebuild
npm run prebuild

# Should see components synced from database
# components/registry/index.ts should have exports
```

### Production Behavior:

**Before Fix:**
- ❌ Save component → 500 error or blank preview
- ❌ Dynamic import fails (file not found)
- ❌ Components only in database

**After Fix:**
- ✅ Save component → stored in database
- ✅ Next deployment → prebuild syncs components
- ✅ Production → components bundled and working

## New Component Workflow

### Adding a Component:
1. Generate component (admin UI or CLI script)
2. Component saves to database ✅
3. Component saves to local filesystem ✅
4. **Deploy to Vercel:**
   - Vercel runs `npm run prebuild`
   - Script pulls component from database
   - Next.js bundles it
   - Component available in production ✅

### Important Notes:
- 🚀 **New components require a redeploy** to appear in production
- 💾 **Database is source of truth** - prebuild syncs from it
- 🔄 **Local changes persist** - they're in filesystem already
- ⚡ **Prebuild is fast** - only syncs components once per build

## Monitoring

Check build logs on Vercel for:
```
📦 Syncing components from database to filesystem...
Found X components to sync
✅ component-slug.tsx → ComponentName
✅ Updated registry index with X exports
🎉 Successfully synced X components!
```

## Alternative Approaches (Not Used)

### Option A: Runtime Evaluation (Security Risk)
- Evaluate component code at runtime using `eval()` or `new Function()`
- ❌ Rejected: Major security risk, XSS vulnerability

### Option B: API-Based Preview (Performance Issue)
- Render components server-side via API
- ❌ Rejected: Slow, complex, doesn't work with client components

### Option C: Build-Time Sync (CHOSEN ✅)
- Sync components during build
- ✅ Secure, fast, works with all Next.js features
- ✅ Components fully optimized and bundled

## Rollback Plan

If prebuild causes issues:
```json
{
  "scripts": {
    "prebuild": "npm run validate:colors",
    "build": "next build"
  }
}
```

This removes the component sync but keeps color validation.

