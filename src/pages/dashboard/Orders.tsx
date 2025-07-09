import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, Edit } from 'lucide-react';
import api from '@/lib/api';
import OrderForm from '@/components/dashboard/OrderForm';
import { Order, OrdersResponse } from '@/types/dashboard';
import { useLanguage } from '@/contexts/LanguageContext';

// Currency formatter for Libyan Dinar
const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${numAmount.toFixed(2)} د.ل`;
};

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const { data: orders, isLoading } = useQuery<OrdersResponse>({
    queryKey: ['orders', searchQuery, statusFilter],
    queryFn: async () => {
      const response = await api.get(
        `/api/orders?search=${searchQuery}&status=${statusFilter}`
      );
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">{t('dashboard.orders.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t('dashboard.orders.title')}</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="max-w-lg w-full">
          <div className="relative">
            <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className={`block w-full ${isRTL ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder={t('dashboard.orders.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`block w-full sm:w-48 ${isRTL ? 'pr-3 pl-10' : 'pl-3 pr-10'} py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md`}
        >
          <option value="all">{t('dashboard.orders.all_statuses')}</option>
          <option value="pending">{t('dashboard.order_status.pending')}</option>
          <option value="processing">{t('dashboard.order_status.processing')}</option>
          <option value="completed">{t('dashboard.order_status.completed')}</option>
          <option value="cancelled">{t('dashboard.order_status.cancelled')}</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.orders.order_number')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.orders.customer_name')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.orders.date')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.orders.amount')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.orders.status')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.orders.payment_status')}
                </th>
                <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dashboard.orders.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders?.data?.map((order: Order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.order_status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.order_status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {t(`dashboard.order_status.${order.order_status}`) || order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.payment_status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.payment_status === 'paid' ? t('dashboard.orders.paid') :
                       order.payment_status === 'pending' ? t('dashboard.orders.unpaid') :
                       order.payment_status === 'failed' ? t('dashboard.orders.refunded') :
                       order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingOrder(order);
                          setShowOrderForm(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && editingOrder && (
        <OrderForm
          order={editingOrder}
          onClose={() => {
            setShowOrderForm(false);
            setEditingOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default Orders;
