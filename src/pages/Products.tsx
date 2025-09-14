import { useState, useCallback, useMemo, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useDebounce } from '../hooks/useDebounce';

// Currency formatter for Libyan Dinar
const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${numAmount.toFixed(2)} د.ل`;
};

interface Product {
  id: number;
  name: string;
  description: string;
  image_url: string;
  retail_price: string;
  wholesale_price?: string;
  wholesale_threshold?: number;
  stock: number;
  is_always_in_stock: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  attributes?: {
    weight?: string;
    volume?: string;
    origin?: string;
    shelf_life?: string;
    harvest_date?: string;
    ingredients?: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

interface ApiResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

// Memoized ProductCard component to prevent unnecessary re-renders
const ProductCard = memo(({ product, onAddToCart, t }: { 
  product: Product; 
  onAddToCart: (product: Product) => void;
  t: (key: string) => string;
}) => {
  return (
    <div className="bg-white rounded-lg border border-orange-200 shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/fallback-product-image.png';
          }}
        />
        {product.category && (
          <span className="absolute top-2 right-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            {product.category.name}
          </span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium">{t('products.outOfStock')}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {product.attributes && (
          <div className="space-y-1 mb-3">
            {product.attributes.weight && (
              <p className="text-xs text-gray-500">
                <span className="font-medium">{t('products.attributes.weight')}:</span> {product.attributes.weight}
              </p>
            )}
            {product.attributes.origin && (
              <p className="text-xs text-gray-500">
                <span className="font-medium">{t('products.attributes.origin')}:</span> {product.attributes.origin}
              </p>
            )}
          </div>
        )}

        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-lg font-bold text-orange-600">{formatCurrency(product.retail_price)}</span>
              {product.wholesale_price && product.wholesale_threshold && (
                <p className="text-xs text-green-600">
                  {formatCurrency(product.wholesale_price)} عند شراء {product.wholesale_threshold}+
                </p>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {product.is_always_in_stock
                ? product.stock > 0
                  ? t('products.inStock')
                  : t('products.outOfStock')
                : `${t('products.stock')}: ${product.stock}`}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock <= 0}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              product.stock <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {product.stock <= 0 ? t('products.outOfStock') : t('products.addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

// Loading skeleton component
const ProductSkeleton = () => (
  <div className="bg-white rounded-lg border border-orange-200 shadow-md overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="border-t border-gray-100 pt-3">
        <div className="flex justify-between items-center mb-3">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

const Products = () => {
  const [searchInput, setSearchInput] = useState(''); // Raw search input
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchInput, 300);
  
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/api/categories');
      const data = response.data;
      // Return the data array from the paginated response
      return data.data || [];
    },
  });

  const { data: response, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ['products', debouncedSearchQuery, selectedCategory, currentPage, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (selectedCategory) params.append('category_id', selectedCategory.toString());
      params.append('page', currentPage.toString());
      params.append('per_page', pageSize.toString());

      const response = await api.get(`/api/products?${params.toString()}`);
      return response.data;
    },
  });

  const handleCategoryChange = useCallback((categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page when changing category
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchInput(query);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    if (product.stock <= 0) {
      toast.error(t('products.outOfStock'));
      return;
    }

    // Convert to the format expected by cart
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.retail_price),
      retail_price: parseFloat(product.retail_price),
      wholesale_price: product.wholesale_price ? parseFloat(product.wholesale_price) : undefined,
      wholesale_threshold: product.wholesale_threshold,
      image_url: product.image_url,
      stock: product.stock
    };

    addToCart(cartProduct);
    toast.success(`${product.name} ${t('products.addedToCart')}`);
  }, [addToCart, t]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error loading products: {error.message}</div>
      </div>
    );
  }

  // Debug logs
  console.log('Response:', response);
  console.log('Response data:', response?.data);
  console.log('Is array?', Array.isArray(response?.data));

  // Safety check for data
  if (!response?.data || !Array.isArray(response.data)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">{t('products.noProducts')}</div>
      </div>
    );
  }

  // Filter out inactive products (assuming 'active' property exists)
  const activeProducts = response.data.filter((product: any) => product.active !== false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('products.title')}</h1>
            <p className="text-gray-600">{t('home.hero.subtitle')}</p>
          </div>

          {/* Filter Section */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder={t('products.search')}
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : null)}
              className="border border-orange-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
            >
              <option value="">{t('products.allCategories')}</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">
                {t('common.items_per_page') || 'Items per page:'}
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-orange-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={36}>36</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: pageSize }, (_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}

        {/* No Products Message */}
        {!isLoading && response?.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('products.noProducts')}</p>
            {debouncedSearchQuery && (
              <p className="text-gray-400 text-sm mt-2">
                {t('products.noSearchResults') || `No results found for "${debouncedSearchQuery}"`}
              </p>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && activeProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProducts.map((product) => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                t={t}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {response && response.last_page > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="px-4 py-2 border border-orange-300 rounded-md text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.previous') || 'Previous'}
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, response.last_page) }, (_, i) => {
                  const startPage = Math.max(1, Math.min(response.last_page - 4, currentPage - 2));
                  const pageNumber = startPage + i;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        currentPage === pageNumber
                          ? 'bg-orange-500 text-white'
                          : 'bg-white text-orange-700 border border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(response.last_page, currentPage + 1))}
                disabled={currentPage >= response.last_page}
                className="px-4 py-2 border border-orange-300 rounded-md text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.next') || 'Next'}
              </button>
            </div>
          </div>
        )}

        {/* Results Info */}
        {response && response.total > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            {t('common.showing') || 'Showing'} {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, response.total)} {t('common.of') || 'of'} {response.total} {t('common.results') || 'results'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
