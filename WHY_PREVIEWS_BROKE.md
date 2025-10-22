# Why Component Previews Stopped Working

## The Timeline

### Phase 1: It Was Working (Local Development) ✅

**When:** During initial development  
**Where:** Your local machine (`localhost:3000`)

```
1. You generated a component (e.g., Button)
2. AI created the TypeScript code
3. Code saved to database
4. Code ALSO written to `/components/registry/button.tsx` ✅
5. Preview used Next.js dynamic import:
   const Component = await import('@/components/registry/button')
6. ✅ Preview worked because file existed on filesystem
```

**Why it worked:**
- Files were physically written to your hard drive
- Next.js could import them
- Everything was happy

---

### Phase 2: Deployed to Vercel 🚀

**When:** First production deployment  
**Commit:** `db4a9e4` - "fix: resolve Vercel filesystem limitations"

You deployed to Vercel and discovered:

```typescript
// app/api/registry/write/route.ts (lines 39-54)
const isVercel = process.env.VERCEL === '1'

if (isVercel) {
  console.log('⚠️  Skipping file write on Vercel (read-only filesystem)')
  return NextResponse.json({
    success: true,
    message: 'Component saved to database (Vercel production)',
  })
}
```

**What this means:**
- ✅ Local dev: Files written to `/components/registry/`
- ❌ Production: Files NOT written (Vercel filesystem is read-only)
- Components only exist in database in production

**But previews still worked... for a while**

---

### Phase 3: The Silent Break 🐛

**When:** Testing components generated BEFORE deployment  
**What happened:**

```
Scenario A - Old Components (Generated Locally):
1. You generated Button locally
2. Button.tsx was written to /components/registry/ ✅
3. You committed and pushed to GitHub
4. Vercel built the app WITH button.tsx included
5. Preview worked: import('@/components/registry/button') ✅

Scenario B - New Components (Generated on Vercel):
1. User generates Card component in production
2. Card.tsx saved to database ONLY
3. Card.tsx NOT written to filesystem (read-only)
4. Preview tried: import('@/components/registry/card')
5. ❌ ERROR: "Cannot find module './card'"
```

**The illusion:** 
- You tested with components that existed in the build
- So previews seemed to work
- But new components generated in production failed

---

### Phase 4: The Iframe Fallback Attempt 🔧

**When:** October 22, 2025 (1:09 AM)  
**Commit:** `1dd3357` - "Fix: Add iframe fallback preview for Vercel production"

You added detection for production:

```typescript
// components/component-preview-real.tsx
const isProduction = window.location.hostname.includes('vercel.app')

if (isProduction) {
  // Use iframe-based preview from database
  const html = await fetch('/api/preview', { code: componentCode })
  setIframePreview(html)
}
```

**Result:**
- ✅ Detected production environment correctly
- ✅ Fell back to iframe preview
- ❌ But got new error: "Unexpected token '.'"

---

### Phase 5: The TypeScript Problem 💥

**What happened:**

The component code in your database looked like this:

```typescript
import * as React from "react"              // ❌ Can't import in iframe
import { cva } from "class-variance-authority"  // ❌ Can't import in iframe
import { cn } from "@/lib/utils"            // ❌ Path doesn't exist in iframe

export interface ButtonProps                // ❌ TypeScript not valid in browser
  extends React.ButtonHTMLAttributes<...> { }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...)
                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                  // ❌ TypeScript generics fail in Babel
```

When Babel in the iframe tried to transpile this:
```
Line 1: import * as React from "react"
        ^
SyntaxError: Unexpected token '.'
```

**Why the error:**
- Babel in browser doesn't handle imports
- TypeScript syntax isn't valid JavaScript
- The `.` after `import` was the first "unexpected" character

---

### Phase 6: Today's Fix ✅

**When:** Today  
**Commit:** `076bebd` - "fix: Strip TypeScript and imports from component code"

Created `stripImportsFromCode()` function that transforms:

```typescript
// BEFORE (from database)
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...)

// AFTER (sent to iframe)
// import * as React from "react"
// import { cva, type VariantProps } from "class-variance-authority"  
// import { cn } from "@/lib/utils"

/* export interface ButtonProps extends ... */

const Button = React.forwardRef(...)
```

Now Babel can transpile it! ✅

---

## Summary: What Changed and When

| Phase | Date | What Happened | Preview Status |
|-------|------|---------------|----------------|
| **1. Local Dev** | Initial build | Components written to filesystem | ✅ Working |
| **2. First Deploy** | Week ago? | Vercel stops writing files | ✅ Still working (old components in build) |
| **3. Generate New** | Days ago | New components only in DB | ❌ Broken ("Cannot find module") |
| **4. Add Iframe** | Oct 22, 1am | Fallback to iframe preview | ❌ Different error ("Unexpected token") |
| **5. Fix TypeScript** | Today | Strip imports and types | ✅ Working now! |

---

## Why It Seemed to Work Initially

### The Trap:

You were testing with components that you generated **locally** during development:

```
button.tsx     ← Generated locally, committed to repo
button2.tsx    ← Generated locally, committed to repo
card.tsx       ← Maybe generated locally too?
```

These files were **included in the Vercel build**, so they could be imported!

But any NEW component generated in production would fail because:
1. Vercel can't write the file (read-only)
2. Preview tries to import the file (doesn't exist)
3. Error: "Cannot find module"

---

## The Root Cause

**Vercel's Read-Only Filesystem**

```
┌────────────────────────────────────┐
│  Local Development                 │
│  ✅ Can write files                │
│  ✅ Dynamic imports work           │
│  ✅ Previews work                  │
└────────────────────────────────────┘
              │
              │ git push
              ▼
┌────────────────────────────────────┐
│  Vercel Production                 │
│  ❌ Cannot write files             │
│  ❌ New components only in DB      │
│  ❌ Dynamic imports fail           │
│  ✅ Iframe previews (after fix)   │
└────────────────────────────────────┘
```

---

## What We Learned

1. **Filesystem writes work locally but not on Vercel**
   - You already knew this (wrote the check in `write/route.ts`)
   - But the preview component wasn't updated to handle it

2. **Preview component assumed files existed**
   - Used dynamic imports: `import('@/components/registry/${slug}')`
   - This only works if the file was in the build

3. **Database has code, but it needs transformation**
   - Code has TypeScript and imports
   - Can't be directly executed in browser
   - Needs stripping before iframe rendering

---

## Why You Didn't Notice Earlier

**Possible Scenarios:**

### Scenario 1: Testing with Pre-Built Components
```
1. Generated Button locally during development
2. Committed button.tsx to repo
3. Deployed to Vercel (button.tsx in build)
4. Tested Button preview in production
5. ✅ Worked! (file existed in build)
6. Assumed all previews work
```

### Scenario 2: Didn't Test New Components in Production
```
1. Tested everything locally (all working)
2. Deployed to production
3. Tested old components (working)
4. But never tried generating NEW component in production
5. If you had, would have seen "Cannot find module"
```

### Scenario 3: Generated on Vercel but Didn't Preview
```
1. Generated component on Vercel
2. Component saved to database ✅
3. But didn't click to view preview page
4. So error never appeared
```

---

## The Fix Flow

```
Component in Database (TypeScript + Imports)
              ↓
    stripImportsFromCode()
              ↓
    Clean JavaScript (no imports, no types)
              ↓
    Inject into iframe HTML
              ↓
    Babel transpiles JSX
              ↓
    React renders component
              ↓
         ✅ Preview works!
```

---

## Moving Forward

### What's Working Now:

**Local Development:**
```typescript
// Uses native dynamic imports (fast!)
const Component = await import(`@/components/registry/${slug}`)
```

**Production (Vercel):**
```typescript
// Uses iframe with TypeScript stripping
const html = await fetch('/api/preview', { 
  code: stripImportsFromCode(componentCode) 
})
```

### Both paths work! 🎉

---

## Key Takeaway

**The preview didn't "stop working" - it never fully worked in production.**

It appeared to work because you were testing with components that existed in the build (generated locally before deployment).

The moment you tried to preview a component generated AFTER deployment, it would have failed with "Cannot find module" (which is what you reported).

We've now fixed both issues:
1. ✅ Iframe fallback for production
2. ✅ TypeScript stripping for browser compatibility

**Now it truly works in both environments!**

