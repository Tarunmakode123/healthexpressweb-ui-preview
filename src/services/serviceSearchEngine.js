/**
 * Service Search Engine API
 * Scalable search engine supporting keyword, tag, category, and symptom queries.
 * Designed for pagination and debounced asynchronous querying.
 */
import { ALL_SERVICES, CATEGORIES } from '../data/services';

export async function searchServicesQuery(query = '', options = {}) {
  const { limit = 6, categoryId = null } = options;
  const rawQuery = (query || '').toLowerCase().trim();

  let results = ALL_SERVICES;

  if (categoryId && categoryId !== 'all') {
    results = results.filter(s => s.category_id === categoryId);
  }

  if (rawQuery) {
    results = results.filter(service => {
      const nameMatch = service.name.toLowerCase().includes(rawQuery);
      const categoryMatch = service.category_id.toLowerCase().includes(rawQuery);
      const subcategoryMatch = (service.subcategory || '').toLowerCase().includes(rawQuery);
      const descMatch = (service.shortDesc || '').toLowerCase().includes(rawQuery);
      const paramMatch = service.parameters && service.parameters.some(p => p.toLowerCase().includes(rawQuery));

      // Intelligent natural language & symptom keyword resolution
      const isKneeOrOrtho = (rawQuery.includes('knee') || rawQuery.includes('joint') || rawQuery.includes('pain') || rawQuery.includes('ortho')) && 
        (service.category_id === 'surgery' || service.category_id === 'imaging');
      const isHomeNurse = (rawQuery.includes('nurse') || rawQuery.includes('nursing') || rawQuery.includes('dressing') || rawQuery.includes('attendant')) && 
        service.category_id === 'home-care';
      const isDiabetes = (rawQuery.includes('sugar') || rawQuery.includes('diabetes') || rawQuery.includes('glucose')) && 
        (service.id === 'hba1c' || service.category_id === 'health-packages');

      return nameMatch || categoryMatch || subcategoryMatch || descMatch || paramMatch || isKneeOrOrtho || isHomeNurse || isDiabetes;
    });
  }

  return {
    total: results.length,
    items: results.slice(0, limit),
    categories: CATEGORIES,
    hasMore: results.length > limit
  };
}
