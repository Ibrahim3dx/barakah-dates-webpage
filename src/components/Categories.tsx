import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  products_count?: number;
}

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['categories', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      return data.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error loading categories: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('categories.title')}</h1>
            <p className="text-gray-600">{t('home.categories.title')}</p>
          </div>

          {/* Search Section */}
          <div className="flex justify-center">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder={t('categories.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-8">
        {/* No Categories Message */}
        {categories && categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('categories.noCategories')}</p>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg border border-orange-200 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:border-orange-300">
                <div className="relative">
                  <img
                    src={category.image_url || '/placeholder.svg'}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white text-lg font-semibold mb-1">
                      {category.name}
                    </h3>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {category.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Package className="h-4 w-4 mr-1" />
                      <span>
                        {category.products_count || 0} {t('categories.productsCount')}
                      </span>
                    </div>

                    <button className="text-orange-600 hover:text-orange-700 text-sm font-medium group-hover:underline">
                      {t('categories.viewProducts')} ←
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
