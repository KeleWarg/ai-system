-- Fix RLS Policies for Better Security
-- Run this migration to add ownership-based UPDATE policies

-- ============================================================================
-- THEMES TABLE - Fix UPDATE policy
-- ============================================================================

-- Drop existing permissive UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update themes" ON public.themes;

-- Option 1 (RECOMMENDED): Only creator or admin can update
CREATE POLICY "Users can update own themes or admins can update any"
  ON public.themes FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    public.is_admin()
  );

-- NOTE: If you want to allow ALL authenticated users to update (current behavior),
-- then re-create the original policy:
-- CREATE POLICY "Authenticated users can update themes"
--   ON public.themes FOR UPDATE
--   TO authenticated
--   USING (true);

-- ============================================================================
-- COMPONENTS TABLE - Fix UPDATE policy
-- ============================================================================

-- Drop existing permissive UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update components" ON public.components;

-- Option 1 (RECOMMENDED): Only creator or admin/editor can update
CREATE POLICY "Users can update own components or admin/editor can update any"
  ON public.components FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'editor')
    )
  );

-- NOTE: If you want to allow ALL authenticated users to update (current behavior),
-- then re-create the original policy:
-- CREATE POLICY "Authenticated users can update components"
--   ON public.components FOR UPDATE
--   TO authenticated
--   USING (true);

-- ============================================================================
-- Optional: Add created_by column if missing
-- ============================================================================

-- Add created_by to themes table if it doesn't exist
-- DO $$ 
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM information_schema.columns 
--     WHERE table_name='themes' AND column_name='created_by'
--   ) THEN
--     ALTER TABLE public.themes ADD COLUMN created_by UUID REFERENCES public.users(id);
--   END IF;
-- END $$;

-- ============================================================================
-- RECOMMENDED: Add audit logging trigger
-- ============================================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  resource_type TEXT NOT NULL, -- 'component', 'theme', 'user'
  resource_id UUID NOT NULL,
  changes JSONB, -- before/after data
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- INSTRUCTIONS
-- ============================================================================

-- To apply these fixes:
-- 1. Review the changes and decide which option you want
-- 2. Connect to your Supabase database
-- 3. Run this SQL script in the SQL editor
-- 4. Test the policies by trying to update a theme/component as a regular user
-- 5. Verify that only owners or admins can update resources

-- To test the new policies:
-- 1. Create a test user (non-admin)
-- 2. Create a theme/component as that user
-- 3. Try to update it as the same user (should work)
-- 4. Try to update it as a different user (should fail)
-- 5. Try to update it as an admin (should work)

