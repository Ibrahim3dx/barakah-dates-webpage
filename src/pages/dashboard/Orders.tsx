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
  const { t } = useLanguage();

  const { data: orders, isLoading } = useQuery<OrdersResponse>({
    queryKey: ['orders', searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);

      const response = await api.get(`/api/orders?${params.toString()}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">{t('dashboard.orders.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">{t('dashboard.orders.title')}</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full ps-10 pe-3 py-2.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              placeholder={t('dashboard.orders.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full ps-3 pe-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white transition-colors"
          >
            <option value="all">{t('dashboard.orders.all_statuses')}</option>
            <option value="pending">{t('dashboard.order_status.pending')}</option>
            <option value="processing">{t('dashboard.order_status.processing')}</option>
            <option value="completed">{t('dashboard.order_status.completed')}</option>
            <option value="cancelled">{t('dashboard.order_status.cancelled')}</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.orders.order_number')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.orders.customer_name')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.orders.date')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.orders.amount')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.orders.status')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.orders.payment_status')}
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dashboard.orders.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders?.data?.length > 0 ? (
                orders.data.map((order: Order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <div className="flex justify-end space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            setEditingOrder(order);
                            setShowOrderForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                          title="Edit order"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                          title="View order"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-gray-400 mb-2">📦</div>
                      <p>{t('dashboard.orders.no_orders')}</p>
                    </div>
                  </td>
                </tr>
              )}
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
