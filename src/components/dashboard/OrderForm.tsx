import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '@/lib/api';
import { Order } from '@/types/dashboard';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderFormProps {
  order?: Order;
  onClose: () => void;
}

const OrderForm = ({ order, onClose }: OrderFormProps) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [formData, setFormData] = useState({
    customer_name: order?.customer_name || '',
    customer_email: order?.customer_email || '',
    customer_phone: order?.customer_phone || '',
    shipping_address: order?.shipping_address || '',
    order_status: order?.order_status || 'pending',
    payment_status: order?.payment_status || 'pending',
    notes: order?.notes || '',
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: Partial<Order>) => {
      const response = await api.put(`/api/orders/${order?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
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
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className={`flex justify-between items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-xl font-semibold">
            {t('forms.edit_order')} #{order?.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="customer_name"
                className="block text-sm font-medium text-gray-700"
              >
                {t('dashboard.orders.customer_name')} *
              </label>
              <input
                type="text"
                name="customer_name"
                id="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                required
              />
            </div>

            <div>
              <label
                htmlFor="customer_email"
                className="block text-sm font-medium text-gray-700"
              >
                {t('dashboard.orders.customer_email')} *
              </label>
              <input
                type="email"
                name="customer_email"
                id="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="customer_phone"
              className="block text-sm font-medium text-gray-700"
            >
              {t('forms.customer_phone')} *
            </label>
            <input
              type="tel"
              name="customer_phone"
              id="customer_phone"
              value={formData.customer_phone}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              required
            />
          </div>

          <div>
            <label
              htmlFor="shipping_address"
              className="block text-sm font-medium text-gray-700"
            >
              {t('forms.shipping_address')} *
            </label>
            <textarea
              name="shipping_address"
              id="shipping_address"
              value={formData.shipping_address}
              onChange={handleChange}
              rows={3}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="order_status"
                className="block text-sm font-medium text-gray-700"
              >
                {t('dashboard.orders.status')}
              </label>
              <select
                name="order_status"
                id="order_status"
                value={formData.order_status}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <option value="pending">{t('dashboard.order_status.pending')}</option>
                <option value="processing">{t('dashboard.order_status.processing')}</option>
                <option value="completed">{t('dashboard.order_status.completed')}</option>
                <option value="cancelled">{t('dashboard.order_status.cancelled')}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="payment_status"
                className="block text-sm font-medium text-gray-700"
              >
                {t('dashboard.orders.payment_status')}
              </label>
              <select
                name="payment_status"
                id="payment_status"
                value={formData.payment_status}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <option value="pending">{t('dashboard.order_status.pending')}</option>
                <option value="paid">{t('dashboard.orders.paid')}</option>
                <option value="failed">{t('forms.payment_failed')}</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              {t('forms.notes')}
            </label>
            <textarea
              name="notes"
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}
            />
          </div>

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
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {mutation.isPending ? t('forms.saving') : t('forms.save_order')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
