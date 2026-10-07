import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CATEGORIES as FALLBACK_CATEGORIES } from '../data/services';

/**
 * Fetch Categories for Admin Panel with Search, Filter & Pagination
 */
export async function fetchAdminCategories({
  search = '',
  activeStatus = 'all',
  page = 1,
  pageSize = 20
} = {}) {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase connection is missing. Returning local fallback categories for admin.');
    let filtered = [...FALLBACK_CATEGORIES];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(c => (c.name || '').toLowerCase().includes(q) || (c.id || c.slug || '').toLowerCase().includes(q));
    }

    return {
      success: true,
      categories: filtered,
      totalMatches: filtered.length,
      totalPages: 1,
      page: 1,
      pageSize
    };
  }

  try {
    const validPage = Math.max(1, parseInt(page, 10) || 1);
    const offset = (validPage - 1) * pageSize;

    let query = supabase
      .from('categories')
      .select('*', { count: 'exact' });

    // Active status filter
    if (activeStatus === 'active') {
      query = query.eq('active', true);
    } else if (activeStatus === 'inactive') {
      query = query.eq('active', false);
    }

    // Search query across name and slug
    const q = (search || '').trim();
    if (q) {
      query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
    }

    // Sort by display_order ASC, then name ASC
    query = query
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
      .range(offset, offset + pageSize - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('fetchAdminCategories DB error:', error.message);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      categories: data || [],
      totalMatches: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize) || 1,
      page: validPage,
      pageSize
    };
  } catch (err) {
    console.error('fetchAdminCategories exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Create a new Category in public.categories database table
 */
export async function createAdminCategory(categoryData) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase connection is not configured.' };
  }

  const name = (categoryData.name || '').trim();
  const slug = (categoryData.slug || categoryData.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim().toLowerCase();

  if (!name || !slug) {
    return { success: false, error: 'Category Name and Slug are required.' };
  }

  const payload = {
    name,
    slug,
    description: categoryData.description ? categoryData.description.trim() : null,
    icon: categoryData.icon ? categoryData.icon.trim() : 'Layers',
    image_url: categoryData.image_url ? categoryData.image_url.trim() : null,
    display_order: Number(categoryData.display_order || 0),
    active: categoryData.active !== undefined ? Boolean(categoryData.active) : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: `A category with the slug "${slug}" already exists. Please use a unique slug.` };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('createAdminCategory exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update an existing Category record in public.categories database table
 */
export async function updateAdminCategory(id, categoryData) {
  if (!id) return { success: false, error: 'Missing category ID.' };
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase connection is not configured.' };

  const name = (categoryData.name || '').trim();
  if (!name) {
    return { success: false, error: 'Category Name is required.' };
  }

  const payload = {
    name,
    description: categoryData.description ? categoryData.description.trim() : null,
    icon: categoryData.icon ? categoryData.icon.trim() : 'Layers',
    image_url: categoryData.image_url ? categoryData.image_url.trim() : null,
    display_order: Number(categoryData.display_order || 0),
    active: categoryData.active !== undefined ? Boolean(categoryData.active) : true,
    updated_at: new Date().toISOString()
  };

  if (categoryData.slug && categoryData.slug.trim()) {
    payload.slug = categoryData.slug.trim().toLowerCase();
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: `A category with the slug "${payload.slug}" already exists.` };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('updateAdminCategory exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Toggle Active / Inactive status of a Category
 */
export async function toggleAdminCategoryStatus(id, activeStatus) {
  if (!id) return { success: false, error: 'Missing category ID.' };
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase connection is not configured.' };

  try {
    const { error } = await supabase
      .from('categories')
      .update({ active: Boolean(activeStatus), updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
