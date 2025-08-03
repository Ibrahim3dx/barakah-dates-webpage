import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

interface Product {
  id: number;
  name: string;
  description: string;
  category_id: number;
  price: number;
  wholesale_price?: number;
  retail_buying_price?: number;
  wholesale_buying_price?: number;
  wholesale_threshold?: number;
  stock: number;
  is_active: boolean;
  category?: Category;
}

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

const ProductForm = ({ product, onClose }: ProductFormProps) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    wholesale_price: '',
    retail_buying_price: '',
    wholesale_buying_price: '',
    wholesale_threshold: '',
    stock: '1', // Default to in stock
    is_active: true,
  });

  // Update form data when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id?.toString() || '',
        price: product.price?.toString() || '',
        wholesale_price: product.wholesale_price?.toString() || '',
        retail_buying_price: product.retail_buying_price?.toString() || '',
        wholesale_buying_price: product.wholesale_buying_price?.toString() || '',
        wholesale_threshold: product.wholesale_threshold?.toString() || '',
        stock: product.stock > 0 ? '1' : '0',
        is_active: product.is_active ?? true,
      });
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        category_id: '',
        price: '',
        wholesale_price: '',
        retail_buying_price: '',
        wholesale_buying_price: '',
        wholesale_threshold: '',
        stock: '1', // Default to in stock
        is_active: true,
      });
    }
  }, [product]);

  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch categories for the dropdown
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/api/categories');
      return response.data.data; // Assuming paginated response
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: Record<string, string | number | boolean | null>) => {
      if (product) {
        // If updating and no new image, send as JSON
        if (!image) {
          const response = await api.put(`/api/products/${product.id}`, data, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          return response.data;
        } else {
          // If updating with new image, use FormData with POST + method override
          const formData = new FormData();
          Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              formData.append(key, value.toString());
            }
          });
          formData.append('image', image);
          formData.append('_method', 'PUT');

          const response = await api.post(`/api/products/${product.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          return response.data;
        }
      } else {
        // Creating new product
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value.toString());
          }
        });
        if (image) {
          formData.append('image', image);
        }

        const response = await api.post('/api/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });

      // If it's a new product (no product prop), reset form but keep open
      if (!product) {
        // Reset form data after successful submission
        setFormData({
          name: '',
          description: '',
          category_id: '',
          price: '',
          wholesale_price: '',
          retail_buying_price: '',
          wholesale_buying_price: '',
          wholesale_threshold: '',
          stock: '1', // Default to in stock
          is_active: true,
        });

        // Reset image state and file input
        setImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Don't close the form, keep it open for adding more products
      } else {
        // If editing an existing product, close the form
        onClose();
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert formData to the correct format
    const dataToSend = {
      name: formData.name,
      description: formData.description,
      category_id: parseInt(formData.category_id) || null,
      price: parseFloat(formData.price.toString()) || 0,
      wholesale_price: formData.wholesale_price && formData.wholesale_price.trim() !== '' ? parseFloat(formData.wholesale_price.toString()) : null,
      retail_buying_price: formData.retail_buying_price && formData.retail_buying_price.trim() !== '' ? parseFloat(formData.retail_buying_price.toString()) : null,
      wholesale_buying_price: formData.wholesale_buying_price && formData.wholesale_buying_price.trim() !== '' ? parseFloat(formData.wholesale_buying_price.toString()) : null,
      wholesale_threshold: formData.wholesale_threshold && formData.wholesale_threshold.trim() !== '' ? parseInt(formData.wholesale_threshold.toString()) : null,
      stock: parseInt(formData.stock.toString()) || 0,
      is_active: formData.is_active
    };

    // Debug: Log the data being sent
    console.log('Form data being sent:', dataToSend);
    console.log('Current form state:', formData);

    mutation.mutate(dataToSend);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className={`bg-white rounded-lg p-6 max-w-2xl w-full ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className={`flex justify-between items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-xl font-semibold">
            {product ? t('dashboard.products.edit_product') : t('dashboard.products.add_product')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">{
          /* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              {t('dashboard.products.name')} *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              required
            />
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              {t('common.description')}
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              required
            />
          </div>

          {/* Category Field */}
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700"
            >
              {t('dashboard.products.category')} *
            </label>
            <select
              name="category_id"
              id="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              required
            >
              <option value="">{t('forms.select_category')}</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                {t('common.price')} *
              </label>
              <input
                type="number"
                name="price"
                id="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                required
              />
            </div>

            <div>
              <label
                htmlFor="wholesale_price"
                className="block text-sm font-medium text-gray-700"
              >
                {t('forms.wholesale_price')}
              </label>
              <input
                type="number"
                name="wholesale_price"
                id="wholesale_price"
                value={formData.wholesale_price}
                onChange={handleChange}
                step="0.01"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              />
            </div>
          </div>

          {/* Buying Price Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="retail_buying_price"
                className="block text-sm font-medium text-gray-700"
              >
                {t('forms.retail_buying_price')}
              </label>
              <input
                type="number"
                name="retail_buying_price"
                id="retail_buying_price"
                value={formData.retail_buying_price}
                onChange={handleChange}
                step="0.01"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              />
            </div>

            <div>
              <label
                htmlFor="wholesale_buying_price"
                className="block text-sm font-medium text-gray-700"
              >
                {t('forms.wholesale_buying_price')}
              </label>
              <input
                type="number"
                name="wholesale_buying_price"
                id="wholesale_buying_price"
                value={formData.wholesale_buying_price}
                onChange={handleChange}
                step="0.01"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              />
            </div>
          </div>

          {/* Wholesale Threshold and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="wholesale_threshold"
                className="block text-sm font-medium text-gray-700"
              >
                {t('forms.wholesale_threshold')}
              </label>
              <input
                type="number"
                name="wholesale_threshold"
                id="wholesale_threshold"
                value={formData.wholesale_threshold}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              />
            </div>

            <div>
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <input
                  type="checkbox"
                  name="in_stock"
                  id="in_stock"
                  checked={parseInt(formData.stock) > 0}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stock: e.target.checked ? '1' : '0',
                    }))
                  }
                  className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${isRTL ? 'ml-2' : 'mr-2'}`}
                />
                <label
                  htmlFor="in_stock"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('dashboard.products.in_stock') || 'In Stock'}
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('dashboard.products.stock_help') || 'Check if the product is currently available'}
              </p>
            </div>
          </div>

          {/* Image Field */}
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700"
            >
              {t('forms.product_image')}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              id="image"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className={`mt-1 block w-full text-sm text-gray-500
                file:${isRTL ? 'ml-4' : 'mr-4'} file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100`}
              accept="image/*"
            />
          </div>

          {/* Active Checkbox */}
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: e.target.checked,
                }))
              }
              className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${isRTL ? 'ml-2' : 'mr-2'}`}
            />
            <label
              htmlFor="is_active"
              className="block text-sm text-gray-900"
            >
              {t('common.active')}
            </label>
          </div>

          {/* Action Buttons */}
          <div className={`flex justify-end space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {mutation.isPending ? t('forms.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
