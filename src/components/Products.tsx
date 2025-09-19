import { useQuery } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
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
  is_active: boolean;
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
}

const Products = () => {
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const { data: response, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ['featured-products'],
    queryFn: async () => {
      // Fetch top 4 active products
      const response = await api.get('/api/products?per_page=4&active=true');
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
      stock: product.stock
    };

    addToCart(cartProduct);
    toast.success(`${product.name} ${t('products.addedToCart')}`);
  };

  if (isLoading) {
    return (
      <section id="products" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="products" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-red-500">Error loading products</div>
          </div>
        </div>
      </section>
    );
  }

  // Safety check for data
  if (!response?.data || !Array.isArray(response.data)) {
    return (
      <section id="products" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-gray-500">{t('products.noProducts')}</div>
          </div>
        </div>
      </section>
    );
  }

  // Only show products that are active and in stock
  const visibleProducts = response.data.filter((product: Product) => product.is_active === true && product.stock > 0);

  return (
    <section id="products" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('products.featuredProducts') || 'Featured Products'}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('products.featuredDescription') || 'Discover our premium selection of dates and traditional products'}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-orange-200 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-56 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/fallback-product-image.png';
                  }}
                />
                {product.category && (
                  <span className="absolute top-3 right-3 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    {product.category.name}
                  </span>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {product.attributes && (
                  <div className="space-y-1 mb-4">
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

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-2xl font-bold text-orange-600">{formatCurrency(product.retail_price)}</span>
                      {product.wholesale_price && product.wholesale_threshold && (
                        <p className="text-xs text-green-600 mt-1">
                          {formatCurrency(product.wholesale_price)} عند شراء {product.wholesale_threshold}+
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {t('products.stock')}: {product.stock}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                      product.stock <= 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {product.stock <= 0 ? t('products.outOfStock') : t('products.addToCart')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
            <Link to="/products">
              {t('products.viewAllProducts') || 'View All Products'}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Products;
