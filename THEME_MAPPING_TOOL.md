# Theme Mapping Tool Implementation

## Overview

The Theme Mapping Tool is a user-friendly interface that allows admins to map spec sheet requirements to their actual theme tokens without touching code directly. It provides real-time score updates and structured guidance for fixing validation issues.

## Key Features

### 1. **Simple, Direct Mapping**
- No complex code parsing or editing
- Clear spec requirement → theme option mapping
- Dropdown/checkbox inputs for all mappings

### 2. **Real-Time Score Preview**
- Shows current validation score (e.g., 45/100)
- Live preview of score after mappings (e.g., → 85/100 ↑)
- Updates instantly as user makes selections

### 3. **Theme-Aware Options**
- Only shows colors/sizes from user's actual theme
- Provides exact match suggestions when available
- Visual color swatches for comparison

### 4. **Improved Validation Scoring**
- Less harsh penalties (capped at 25-35 points per category)
- More accurate reflection of "visual closeness"
- Prevents scores from hitting 0 too easily

## Architecture

### New Files Created

1. **`lib/mapping-extractor.ts`**
   - Extracts actionable issues from validation recommendations
   - Returns flat array of `MappingIssue` objects
   - No complex regex, just direct parsing of validation text

2. **`lib/code-mapper.ts`**
   - Applies user mappings to component code
   - Simple find/replace operations
   - Handles colors, spacing, and variants

3. **`components/ui/mapping-inputs.tsx`**
   - Specialized inputs for each mapping type:
     - `ColorMappingInput`: Theme color picker with visual swatches
     - `SpacingMappingInput`: Size selector with Tailwind options
     - `VariantMappingInput`: Checkboxes for variant values

### Files Modified

1. **`components/visual-parameter-editor.tsx`**
   - Complete rewrite from complex tabs/accordions to simple list
   - Real-time score calculation via `useEffect`
   - Clean shadcn-style UI

2. **`lib/ai/spec-validator.ts`**
   - Improved scoring formula with capped deductions:
     - Variants: max -25 points
     - Spacing: max -35 points
     - Colors: max -25 points
     - General quality: -10 if multiple categories fail

3. **`app/admin/components/new/page.tsx`**
   - Updated button text: "🎨 Map to Theme"
   - Passes `currentTheme` prop to editor
   - Handles updated score from editor

### Files Deleted (Cleanup)

1. `lib/component-parser.ts` - Too complex, replaced by mapping-extractor
2. `lib/component-updater.ts` - Replaced by code-mapper
3. `lib/tailwind-converter.ts` - Simplified into mapping-inputs
4. `components/ui/property-input.tsx` - Replaced by mapping-inputs

## User Flow

1. **Upload spec sheet** → AI extracts requirements
2. **Generate component** → AI creates code
3. **View validation** → Shows score (e.g., 45/100) with issues
4. **Click "🎨 Map to Theme"** → Opens mapping tool
5. **Map each issue**:
   - Variants: Check which values to include
   - Spacing: Select size from dropdown (with exact match highlighted)
   - Colors: Pick theme token from dropdown (with visual comparison)
6. **Watch score improve** in real-time as mappings are applied
7. **Click "Apply Mappings"** → Code updates, validation re-runs
8. **New score displayed** (e.g., 85/100)

## Example UI Layout

```
┌─────────────────────────────────────────────────────┐
│ Map Spec to Your Theme                              │
│ ───────────────────────────────────────────────────│
│ Current Score: 45/100    Preview: 85/100 (+40) ↑   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ VARIANT OPTIONS (3)                                 │
├─────────────────────────────────────────────────────┤
│ ⚠️ Missing variant: type                            │
│    Add these variant options to match design...     │
│    ☑ primary  ☑ secondary  ☑ ghost  ☑ white       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ SPACING & SIZING (10)                               │
├─────────────────────────────────────────────────────┤
│ ⚠️ height: 40px                                     │
│    Set the spacing to match design...               │
│    [h-10 (40px - exact match) ▼]                   │
│    Recommended: h-10                                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ COLORS (1)                                          │
├─────────────────────────────────────────────────────┤
│ ⚠️ Replace color: #047857                          │
│    Replace hardcoded color with theme token...      │
│    [bg-primary ▼]                                   │
│    [#047857] → [bg-primary]                        │
└─────────────────────────────────────────────────────┘

[Apply Mappings & Update Code]  [Cancel]
```

## Benefits

1. **No code knowledge needed** - Just selections from dropdowns
2. **Theme-aware** - Only valid theme options shown
3. **Real-time feedback** - See improvements immediately
4. **Clear guidance** - Each issue explains what's wrong and why
5. **Accurate scoring** - Better reflects actual visual match
6. **Simple logic** - Easy to maintain and extend

## Testing

1. Navigate to: `http://localhost:3000/admin/components/new`
2. Upload a spec sheet
3. Generate component
4. Click "🎨 Map to Theme"
5. Verify:
   - Issues are listed clearly
   - Score preview updates in real-time
   - Dropdowns contain theme-appropriate options
   - Apply button updates code and re-validates

## Future Enhancements

- Add preview of actual component rendering with mappings applied
- Support for typography mapping (font sizes, weights)
- Bulk mapping suggestions (e.g., "Map all spacing to exact matches")
- Theme color picker with visual palette
- Export/import mapping presets for consistency across components

