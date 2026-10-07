import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ALL_SERVICES, CATEGORIES, PROVIDERS } from '../data/services';
import { fetchCategories } from './categoryService';

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices' },
  { id: 'under-500', label: 'Under ₹500', min: 0, max: 500 },
  { id: '500-1000', label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { id: '1000-5000', label: '₹1,000 – ₹5,000', min: 1000, max: 5000 },
  { id: 'above-5000', label: 'Above ₹5,000', min: 5000, max: Infinity }
];

/**
 * Fetch catalog services with server-side pagination, search, and filtering.
 */
export async function fetchServices({
  category = 'all',
  search = '',
  priceRange = 'all',
  fulfillment = 'all',
  location = 'all',
  speciality = 'all',
  sortBy = 'relevance',
  page = 1,
  pageSize = 24
} = {}) {

  const validPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (validPage - 1) * pageSize;

  // 1. SUPABASE SERVERSIDE QUERY (PRODUCTION MODE)
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('services')
        .select('*', { count: 'exact' })
        .eq('active', true);

      // Category filter
      if (category && category !== 'all') {
        query = query.eq('category_id', category);
      }

      // Fulfillment filter
      if (fulfillment && fulfillment !== 'all') {
        if (fulfillment === 'home-collection') {
          query = query.eq('home_collection_available', true);
        } else if (fulfillment === 'centre-visit') {
          query = query.eq('centre_visit_required', true);
        }
      }

      // Search query across name, code, provider, description
      const q = search.trim().toLowerCase();
      if (q) {
        query = query.or(`service_name.ilike.%${q}%,service_code.ilike.%${q}%,description.ilike.%${q}%`);
      }

      // Price range filter
      if (priceRange !== 'all') {
        const range = PRICE_RANGES.find(r => r.id === priceRange);
        if (range) {
          query = query.gte('selling_price', range.min);
          if (range.max !== Infinity) {
            query = query.lte('selling_price', range.max);
          }
        }
      }

      // Sorting
      if (sortBy === 'price-low') {
        query = query.order('selling_price', { ascending: true });
      } else if (sortBy === 'price-high') {
        query = query.order('selling_price', { ascending: false });
      } else if (sortBy === 'name-az') {
        query = query.order('service_name', { ascending: true });
      } else if (sortBy === 'name-za') {
        query = query.order('service_name', { ascending: false });
      } else {
        query = query.order('id', { ascending: true });
      }

      // Pagination range
      query = query.range(offset, offset + pageSize - 1);

      const [{ data, count, error }, categoriesRes, totalActiveRes] = await Promise.all([
        query,
        fetchCategories(),
        supabase.from('services').select('id', { count: 'exact', head: true }).eq('active', true)
      ]);

      const activeCategories = (categoriesRes.categories || CATEGORIES).map(cat => ({
        ...cat,
        name: (cat.slug === 'imaging' || cat.id === 'imaging' || cat.name === 'Imaging & Radiology') ? 'Radiology' :
              (cat.slug === 'genetics' || cat.id === 'genetics' || cat.name === 'Genomics & Genetics') ? 'Genomics' : cat.name
      }));

      const enrichedCategories = await Promise.all(
        activeCategories.map(async (cat) => {
          const categoryKey = cat.slug || cat.id;

          const { count: catCount, error: catCountErr } = await supabase
            .from('services')
            .select('id', { count: 'exact', head: true })
            .eq('active', true)
            .eq('category_id', categoryKey);

          if (catCountErr) {
            console.warn('[catalogService] Failed to fetch category count', {
              category: categoryKey,
              error: catCountErr
            });

            return {
              ...cat,
              count: 0
            };
          }

          return {
            ...cat,
            count: catCount ?? 0
          };
        })
      );

      if (!error && data) {
        return {
          services: data.map(item => ({
            ...item,
            name: item.service_name,
            discount_price: item.selling_price,
            price: item.mrp,
            sample_type: item.specimen_type || item.sample_type || 'Standard Specimen'
          })),
          totalMatches: count || 0,
          totalActiveServices: totalActiveRes?.count ?? 2207,
          totalPages: Math.ceil((count || 0) / pageSize) || 1,
          page: validPage,
          pageSize,
          categories: enrichedCategories,
          providers: PROVIDERS
        };
      }
    } catch (err) {
      console.warn('Supabase service query fallback to local catalog:', err);
    }
  }

  // 2. LOCAL DATASET FILTERING (FALLBACK / DEMO MODE)
  let result = [...ALL_SERVICES];

  // Category filter
  if (category && category !== 'all') {
    result = result.filter(s => s.category_id === category);
  }

  // Search query filter
  const q = search.trim().toLowerCase();
  if (q) {
    result = result.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.service_code && s.service_code.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.subcategory && s.subcategory.toLowerCase().includes(q)) ||
      (s.parameters && s.parameters.some(p => p.toLowerCase().includes(q)))
    );
  }

  // Price range filter
  if (priceRange !== 'all') {
    const range = PRICE_RANGES.find(r => r.id === priceRange);
    if (range) {
      result = result.filter(s => s.discount_price >= range.min && s.discount_price <= range.max);
    }
  }

  // Fulfillment filter
  if (fulfillment !== 'all') {
    if (fulfillment === 'home-collection') {
      result = result.filter(s => s.home_collection_available === true || s.fulfillment === 'home-collection' || s.category_id === 'lab-tests');
    } else if (fulfillment === 'centre-visit') {
      result = result.filter(s => s.centre_visit_required === true || s.fulfillment === 'centre-visit' || s.category_id === 'imaging');
    } else if (fulfillment === 'online') {
      result = result.filter(s => s.is_online === true || s.fulfillment === 'online' || s.category_id === 'genetics');
    } else if (fulfillment === 'home-delivery') {
      result = result.filter(s => s.is_home_delivery === true || s.fulfillment === 'home-delivery' || s.category_id === 'home-nursing');
    }
  }

  // Location filter
  if (location !== 'all') {
    result = result.filter(s => !s.location || s.location === 'All' || s.location === location || (s.locations && s.locations.includes(location)));
  }

  // Speciality filter
  if (speciality !== 'all') {
    const specLower = speciality.toLowerCase();
    result = result.filter(s => 
      (s.speciality && s.speciality.toLowerCase().includes(specLower)) ||
      (s.subcategory && s.subcategory.toLowerCase().includes(specLower)) ||
      (s.category_name && s.category_name.toLowerCase().includes(specLower)) ||
      (s.name && s.name.toLowerCase().includes(specLower))
    );
  }

  // Sorting
  if (sortBy === 'price-low') {
    result.sort((a, b) => a.discount_price - b.discount_price);
  } else if (sortBy === 'price-high') {
    result.sort((a, b) => b.discount_price - a.discount_price);
  } else if (sortBy === 'name-az') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'name-za') {
    result.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortBy === 'popularity') {
    result.sort((a, b) => (b.parameters_count || 0) - (a.parameters_count || 0));
  }

  const totalMatches = result.length;
  const totalPages = Math.ceil(totalMatches / pageSize) || 1;
  const pageStart = (validPage - 1) * pageSize;
  const paginatedServices = result.slice(pageStart, pageStart + pageSize);

  const totalActiveServices = ALL_SERVICES.filter(s => s.active !== false).length;

  const fallbackCountMap = {};
  ALL_SERVICES.filter(s => s.active !== false).forEach(s => {
    if (s.category_id) {
      fallbackCountMap[s.category_id] = (fallbackCountMap[s.category_id] || 0) + 1;
    }
  });

  const enrichedFallbackCategories = CATEGORIES.map(cat => {
    const catKey = cat.slug || cat.id;
    return {
      ...cat,
      count: fallbackCountMap[catKey] !== undefined ? fallbackCountMap[catKey] : (fallbackCountMap[cat.id] || cat.count || 0)
    };
  });

  return {
    services: paginatedServices,
    totalMatches,
    totalActiveServices,
    totalPages,
    page: validPage,
    pageSize,
    categories: enrichedFallbackCategories,
    providers: PROVIDERS
  };
}

/**
 * Fetch a single service by slug.
 */
export async function fetchServiceBySlug(slug) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        return {
          ...data,
          name: data.service_name || data.name,
          discount_price: Number(data.selling_price || data.discount_price || data.mrp || 299),
          price: Number(data.mrp || data.price || data.selling_price || 299),
          sample_type: data.specimen_type || data.sample_type || 'Standard Specimen'
        };
      }
    } catch (err) {
      console.warn('Supabase fetchServiceBySlug fallback:', err);
    }
  }

  return ALL_SERVICES.find(s => s.slug === slug) || ALL_SERVICES[0];
}
