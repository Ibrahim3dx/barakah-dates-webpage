import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import api from '@/lib/api';

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
}

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
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
    queryKey: ['products', searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category_id', selectedCategory.toString());

      const response = await api.get(`/api/products?${params.toString()}`);
      return response.data;
    },
  });

  const handleAddToCart = (product: Product) => {
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
      stock: product.is_always_in_stock ? 999 : product.stock
    };

    addToCart(cartProduct);
    toast.success(`${product.name} ${t('products.addedToCart')}`);
  };

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              className="border border-orange-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
            >
              <option value="">{t('products.allCategories')}</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {/* No Products Message */}
        {response.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('products.noProducts')}</p>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {response.data.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg border border-orange-200 shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
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
                  onClick={() => handleAddToCart(product)}
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
        ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
