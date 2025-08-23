import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '@/lib/api';
import { City } from '@/types/dashboard';
import { useLanguage } from '@/contexts/LanguageContext';

interface CityFormProps {
  city: City | null;
  onClose: () => void;
}

const CityForm = ({ city, onClose }: CityFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    delivery_price: '',
    is_active: true
  });

  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  useEffect(() => {
    if (city) {
      setFormData({
        name: city.name,
        delivery_price: city.delivery_price.toString(),
        is_active: city.is_active
      });
    } else {
      setFormData({
        name: '',
        delivery_price: '',
        is_active: true
      });
    }
  }, [city]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        name: data.name,
        delivery_price: parseFloat(data.delivery_price),
        is_active: data.is_active
      };

      if (city) {
        const response = await api.put(`/api/cities/${city.id}`, payload);
        return response.data;
      } else {
        const response = await api.post('/api/cities', payload);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      onClose();
    },
    onError: (error: unknown) => {
      console.error('Error saving city:', error);
      // Handle error (show toast, etc.)
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {city ? (t('dashboard.cities.edit_city') || 'Edit City') : (t('dashboard.cities.add_city') || 'Add City')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('dashboard.cities.name') || 'City Name'}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${isRTL ? 'text-right' : ''}`}
              placeholder={t('dashboard.cities.name_placeholder') || 'Enter city name'}
            />
          </div>

          <div>
            <label htmlFor="delivery_price" className="block text-sm font-medium text-gray-700 mb-1">
              {t('dashboard.cities.delivery_price') || 'Delivery Price'}
            </label>
            <input
              type="number"
              id="delivery_price"
              name="delivery_price"
              value={formData.delivery_price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${isRTL ? 'text-right' : ''}`}
              placeholder={t('dashboard.cities.price_placeholder') || 'Enter delivery price'}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className={`${isRTL ? 'mr-2' : 'ml-2'} block text-sm text-gray-900`}>
              {t('dashboard.cities.is_active') || 'Active'}
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {mutation.isPending ? (t('common.saving') || 'Saving...') : (city ? (t('common.save') || 'Save') : (t('common.create') || 'Create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CityForm;
