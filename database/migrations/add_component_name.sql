-- Migration: Add component_name column to components table
-- Purpose: Store the exact TypeScript export name for components (e.g., "Button2", "CardHeader")
-- This ensures we can validate and dynamically import components correctly

-- Add component_name column
ALTER TABLE public.components 
ADD COLUMN IF NOT EXISTS component_name TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_components_component_name ON public.components(component_name);

-- Add comment for documentation
COMMENT ON COLUMN public.components.component_name IS 'Exact TypeScript export name (e.g., Button2, CardHeader)';

-- Backfill existing components: derive component_name from slug
-- Example: "button-2" -> "Button2", "card-header" -> "CardHeader"
UPDATE public.components 
SET component_name = (
  SELECT string_agg(
    CONCAT(UPPER(LEFT(part, 1)), SUBSTRING(part, 2)),
    ''
  )
  FROM unnest(string_to_array(slug, '-')) AS part
)
WHERE component_name IS NULL;

-- Make component_name NOT NULL after backfill
ALTER TABLE public.components 
ALTER COLUMN component_name SET NOT NULL;

-- Add unique constraint to ensure no duplicate export names
ALTER TABLE public.components
ADD CONSTRAINT unique_component_name UNIQUE (component_name);

