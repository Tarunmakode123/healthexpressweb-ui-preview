-- ============================================================
-- HEALTH EXPRESS — UPDATE CATEGORY NAMES FOR GENOMICS & RADIOLOGY
-- ============================================================

-- 1. Update public.categories table
UPDATE public.categories
SET name = 'Genomics', updated_at = now()
WHERE slug = 'genetics';

UPDATE public.categories
SET name = 'Radiology', updated_at = now()
WHERE slug = 'imaging';

-- 2. Update public.services category_name values
UPDATE public.services
SET category_name = 'Genomics'
WHERE category_id = 'genetics' OR lower(category_name) = 'genomics & genetics';

UPDATE public.services
SET category_name = 'Radiology'
WHERE category_id = 'imaging' OR lower(category_name) = 'imaging & radiology';
