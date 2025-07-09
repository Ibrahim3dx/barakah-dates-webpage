import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  is_active: boolean;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

interface CategoryFormProps {
  category?: Category;
  onClose: () => void;
}

const CategoryForm = ({ category, onClose }: CategoryFormProps) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    is_active: category?.is_active ?? true,
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: Record<string, string | boolean>) => {
      if (category) {
        // Update existing category
        const response = await api.put(`/api/categories/${category.id}`, data);
        return response.data;
      } else {
        // Create new category
        const response = await api.post('/api/categories', data);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSend = {
      name: formData.name,
      description: formData.description,
      is_active: formData.is_active
    };

    mutation.mutate(dataToSend);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 max-w-md w-full mx-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className={`flex justify-between items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-xl font-semibold">
            {category ? t('dashboard.categories.edit_category') : t('dashboard.categories.add_category')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              {t('dashboard.categories.name')} *
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

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              {t('dashboard.categories.description')}
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder={t('forms.category_description_placeholder')}
            />
          </div>

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

          <div className={`flex justify-end space-x-3 pt-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {mutation.isPending ? t('forms.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
