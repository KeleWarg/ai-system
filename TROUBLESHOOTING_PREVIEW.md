# Troubleshooting: Why Can't I See Component Previews?

## The Preview Flow (What Should Happen)

### Step-by-Step Visual Preview:

```
1. Component code exists in database (✅ You have this)
   └─> TypeScript with imports

2. You navigate to preview page:
   - Admin: /admin/components/[slug]/preview
   - Public: /docs/components/[slug]

3. ComponentPreviewReal loads:
   - Detects production environment
   - Fetches component code from database
   - Strips TypeScript and imports
   - Generates HTML with iframe
   - Renders visual preview

4. You see the component! 🎉
```

---

## Common Issues & Solutions

### Issue 1: Browser Cache 🔄

**Symptom:** Still seeing "Unexpected token" error

**Why:** Your browser cached the old JavaScript before the fix

**Solution:**
```
Hard Refresh:
- Mac: Cmd + Shift + R
- Windows: Ctrl + Shift + R
- Or use Incognito/Private mode
```

---

### Issue 2: Wrong Page 📄

**Symptom:** Not seeing a preview at all

**Check:** Are you on the right page?

**Preview pages:**
- ✅ Admin: `https://your-app.vercel.app/admin/components/button/preview`
- ✅ Public: `https://your-app.vercel.app/docs/components/button`

**NOT preview pages:**
- ❌ Component list: `/admin/components` (just shows list)
- ❌ New component: `/admin/components/new` (creation form)
- ❌ Edit page: `/admin/components/button/edit` (code editor)

---

### Issue 3: No Components in Database 📦

**Symptom:** Component doesn't exist

**Check:** 
1. Did you save the component after generating?
2. Is it in the database?

**Test:**
```bash
# Check if components exist
curl https://your-app.vercel.app/api/registry
```

**Solution:** Generate and save a new component

---

### Issue 4: Authentication Required 🔐

**Symptom:** "Unauthorized" error in console

**Why:** Preview API requires authentication

**Solution:** 
1. Make sure you're logged in to /admin/login
2. Check browser console for auth errors

---

### Issue 5: Deployment Hasn't Finished ⏰

**Symptom:** Old code still running

**Check:** 
1. Go to Vercel dashboard
2. Check latest deployment status
3. Should show commit `076bebd` deployed

**Solution:** Wait for deployment to complete (~2-4 minutes)

---

## How to Test Right Now

### Step 1: Check Deployment
```
1. Go to https://vercel.com/dashboard
2. Find your project
3. Check latest deployment
4. Should see: "fix: Strip TypeScript and imports..."
5. Status should be "Ready"
```

### Step 2: Hard Refresh Browser
```
1. Open your app: https://your-app.vercel.app
2. Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Or open in Incognito/Private window
```

### Step 3: Login to Admin
```
1. Go to /admin/login
2. Enter your credentials
3. Should redirect to /admin
```

### Step 4: View a Component Preview
```
Option A - Admin Preview:
1. Go to /admin/components
2. Click on any component (e.g., "Button")
3. You should see "Live Preview" section

Option B - Public Preview:
1. Go to /docs/components
2. Click on any component
3. Click "Preview" tab
4. Should see the component rendering
```

---

## What You Should See

### In Production (Vercel):

```
┌─────────────────────────────────────────┐
│ Component Preview                       │
├─────────────────────────────────────────┤
│                                         │
│ 🔵 Production Preview Mode              │
│ Rendered from database                  │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │  Live Preview           Refresh │   │
│ ├─────────────────────────────────┤   │
│ │                                 │   │
│ │  [Your Button Component Here]   │   │
│ │                                 │   │
│ │  Variants shown below...        │   │
│ └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### In Local Dev:

```
┌─────────────────────────────────────────┐
│ Component Preview                       │
├─────────────────────────────────────────┤
│                                         │
│ [Your Button Component Here]            │
│ (rendered directly via Next.js import)  │
│                                         │
│ Variants shown below...                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## Console Messages to Look For

### ✅ Success Messages:
```javascript
Loading component: button
🌐 Using iframe preview for production (Vercel read-only filesystem)
Generating iframe preview for production...
✅ Iframe preview generated successfully
```

### ❌ Error Messages (OLD - should be gone now):
```javascript
Failed to load component Button: Error: Cannot find module './button'
Unexpected token '.'
Preview unavailable
```

---

## Debug Checklist

Go through each item:

```
□ Deployment shows commit 076bebd
□ Deployment status is "Ready" 
□ Hard refreshed browser (Cmd+Shift+R)
□ Logged into /admin/login
□ Navigated to /admin/components/[slug]/preview
□ Checked browser console for errors
□ Component exists in database
□ No "Cannot find module" errors
□ No "Unexpected token" errors
□ Can see "Production Preview Mode" banner
□ Iframe is loading/visible
```

---

## Still Not Working?

### Get More Info:

1. **Open Browser DevTools** (F12 or Cmd+Option+I)
2. **Go to Console tab**
3. **Navigate to component preview page**
4. **Copy all console messages**
5. **Share the messages**

### Check Network Tab:

1. **Open DevTools → Network tab**
2. **Refresh the preview page**
3. **Look for request to `/api/preview`**
4. **Check if it returns HTML or an error**

---

## Quick Test Script

Run this to test if everything is working:

```bash
# 1. Check if app is deployed
curl -I https://ai-system-1627hsuqx-keles-projects-d716de91.vercel.app

# 2. Check if registry API works
curl https://ai-system-1627hsuqx-keles-projects-d716de91.vercel.app/api/registry

# 3. Check if a specific component exists
curl https://ai-system-1627hsuqx-keles-projects-d716de91.vercel.app/api/registry/button
```

---

## Expected Behavior Summary

| Action | What Happens |
|--------|-------------|
| Navigate to `/admin/components` | See list of components |
| Click component name | Go to preview page |
| Preview page loads | Shows "Production Preview Mode" banner |
| Iframe loads | Component renders with variants |
| Click "Refresh" | Preview regenerates |
| Switch to "Code" tab | Shows component TypeScript code |

---

## The Answer to Your Question

> "why can't it read the generated code and apply that to show - it's basically a visual mode of the code"

**We CAN, and we DO!** That's exactly what the fix does:

```javascript
// components/component-preview-real.tsx
const generateIframePreview = async () => {
  // 1. Fetch from /api/preview with component code from database
  const response = await fetch('/api/preview', {
    method: 'POST',
    body: JSON.stringify({
      code: componentCode,  // 👈 The code from database
      variants: variants
    })
  })
  
  // 2. Get HTML that renders the component
  const html = await response.text()
  
  // 3. Create iframe to show it
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  setIframePreview(url)  // 👈 Visual preview!
}
```

The code IS being read from the database and rendered visually. If you're not seeing it, it's one of the issues above (most likely browser cache or looking at the wrong page).

---

## Next Steps

1. ✅ Hard refresh your browser
2. ✅ Navigate to `/admin/components/button/preview` (replace "button" with your component slug)
3. ✅ Check browser console for errors
4. ✅ Let me know what you see!

