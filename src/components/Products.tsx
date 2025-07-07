import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  description: string;
  image_url: string;
  retail_price: string;
  wholesale_price?: string;
  wholesale_threshold?: number;
  stock: number;
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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
  });

  const { data: response, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ['products', searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category_id', selectedCategory.toString());

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      return data;
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
      stock: product.stock
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">{t('products.title')}</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={t('products.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {response.data.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{product.name}</h2>
                {product.category && (
                  <span className="text-sm text-gray-500">{product.category.name}</span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.description}
              </p>
              {product.attributes && (
                <div className="space-y-2 mb-4">
                  {product.attributes.weight && (
                    <p className="text-sm text-gray-500">
                      {t('products.attributes.weight')}: {product.attributes.weight}
                    </p>
                  )}
                  {product.attributes.volume && (
                    <p className="text-sm text-gray-500">
                      {t('products.attributes.volume')}: {product.attributes.volume}
                    </p>
                  )}
                  {product.attributes.origin && (
                    <p className="text-sm text-gray-500">
                      {t('products.attributes.origin')}: {product.attributes.origin}
                    </p>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xl font-bold">${product.retail_price}</span>
                  {product.wholesale_price && product.wholesale_threshold && (
                    <p className="text-sm text-green-600">
                      ${product.wholesale_price} when buying {product.wholesale_threshold}+
                    </p>
                  )}
                  {product.stock <= 0 && (
                    <span className="ml-2 text-sm text-red-500">{t('products.outOfStock')}</span>
                  )}
                </div>
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="flex items-center gap-2"
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {t('products.addToCart')}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
