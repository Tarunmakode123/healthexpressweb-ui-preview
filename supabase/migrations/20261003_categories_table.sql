-- ============================================================
-- HEALTH EXPRESS — CATEGORIES TABLE & INITIAL PRODUCTION SEED
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NULL,
  icon TEXT NULL,
  image_url TEXT NULL,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

-- RLS Setup
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories 
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
CREATE POLICY "Admin can manage categories" ON public.categories 
  FOR ALL USING (public.check_is_admin() = true);

-- Seed initial categories from existing production service dataset
INSERT INTO public.categories (slug, name, description, icon, display_order, active)
VALUES
  ('lab-tests', 'Lab Tests', 'Diagnostic blood tests, urine tests, pathology, and clinical lab investigations.', 'FlaskConical', 1, true),
  ('imaging', 'Imaging & Radiology', 'X-Rays, MRI, CT Scans, Ultrasound, and diagnostic imaging services.', 'Scan', 2, true),
  ('health-packages', 'Health Packages', 'Full body health checkups, preventive health screens, and wellness packages.', 'ShieldCheck', 3, true),
  ('genetics', 'Genomics & Genetics', 'DNA testing, genetic wellness, pharmacogenomics, and hereditary risk profiling.', 'Dna', 4, true),
  ('home-nursing', 'Home Nursing', 'Professional home nursing care, post-surgical care, IV infusions, and elderly support.', 'Home', 5, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order,
  updated_at = now();
