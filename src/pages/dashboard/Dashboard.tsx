import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueData {
  date: string;
  amount: number;
}

interface OrderData {
  id: number;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

interface DashboardStats {
  total_revenue: string | number;
  total_orders: number;
  total_products: number;
  total_users: number;
  total_profit: string | number;
  average_order_value: string | number;
  top_products: Array<{
    product_id: number;
    total_quantity: string | number;
    total_revenue: string | number;
    product: {
      id: number;
      name: string;
      retail_price: string | number;
    };
  }>;
  order_status_distribution: Array<{
    order_status: string;
    count: number;
  }>;
  payment_method_distribution: Array<{
    payment_method: string;
    count: number;
  }>;
  recent_orders: Array<{
    id: number;
    customer_name: string;
    customer_email: string;
    total_amount: string | number;
    order_status: string;
    payment_status: string;
    created_at: string;
  }>;
  low_stock_products: Array<{
    id: number;
    name: string;
    stock: number;
    price: string | number;
  }>;
}

interface RevenueResponse {
  data: RevenueData[];
}

// Currency formatter for Libyan Dinar
const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) {
    return '0.00 د.ل';
  }
  return `${numAmount.toFixed(2)} د.ل`;
};

const Dashboard = () => {
  const { t } = useLanguage();

  // Initialize date range to current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [dateFrom, setDateFrom] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(lastDayOfMonth.toISOString().split('T')[0]);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', dateFrom, dateTo],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/stats', {
        params: { from: dateFrom, to: dateTo }
      });
      return response.data;
    },
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery<RevenueResponse>({
    queryKey: ['dashboard-revenue', dateFrom, dateTo],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/revenue', {
        params: { from: dateFrom, to: dateTo }
      });
      return response.data;
    },
  });

  const handleTodayClick = () => {
    const todayStr = today.toISOString().split('T')[0];
    setDateFrom(todayStr);
    setDateTo(todayStr);
  };

  const statsCards = [
    {
      title: t('dashboard.total_revenue'),
      value: stats?.total_revenue || 0,
      icon: DollarSign,
      color: 'bg-green-500',
      isCurrency: true,
    },
    {
      title: t('dashboard.total_orders'),
      value: stats?.total_orders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      isCurrency: false,
    },
    {
      title: t('dashboard.average_order_value'),
      value: stats?.average_order_value || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      isCurrency: true,
    },
    {
      title: t('dashboard.total_customers'),
      value: stats?.total_users || 0,
      icon: Users,
      color: 'bg-yellow-500',
      isCurrency: false,
    },
  ];

  const additionalStatsCards = [
    {
      title: t('dashboard.total_profit'),
      value: stats?.total_profit || 0,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      isCurrency: true,
    },
    {
      title: t('dashboard.total_products'),
      value: stats?.total_products || 0,
      icon: ShoppingCart,
      color: 'bg-indigo-500',
      isCurrency: false,
    },
  ];

  const revenueData = {
    labels: revenue?.data?.map((item: RevenueData) => item.date) || [],
    datasets: [
      {
        label: t('dashboard.revenue'),
        data: revenue?.data?.map((item: RevenueData) => item.amount) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  if (statsLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{t('dashboard.title')}</h1>

        {/* Date Filter */}
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">{t('dashboard.from')}:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">{t('dashboard.to')}:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <button
            onClick={handleTodayClick}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('dashboard.today')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <div
            key={card.title}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {card.isCurrency
                        ? formatCurrency(card.value)
                        : (typeof card.value === 'string' ? parseInt(card.value) : card.value).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {additionalStatsCards.map((card) => (
          <div
            key={card.title}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {card.isCurrency
                        ? formatCurrency(card.value)
                        : (typeof card.value === 'string' ? parseInt(card.value) : card.value).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.revenue_overview')}</h2>
        <div className="h-80">
          <Line
            data={revenueData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${t('dashboard.revenue')}: ${formatCurrency(context.parsed.y)}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  ticks: {
                    callback: function(value) {
                      return formatCurrency(Number(value));
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Two Column Layout for Top Products and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {t('dashboard.top_products')}
            </h3>
            {statsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.top_products?.length > 0 ? (
                  stats.top_products.map((item, index) => (
                    <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">#{index + 1}</span>
                        <span className="ms-2 text-sm text-gray-600">{item.product?.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{item.total_quantity} {t('dashboard.sold')}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(item.total_revenue)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">{t('dashboard.no_top_products')}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-red-600 mb-4">
              {t('dashboard.low_stock_alerts')}
            </h3>
            {statsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.low_stock_products?.length > 0 ? (
                  stats.low_stock_products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">{formatCurrency(product.price)}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {product.stock} {t('dashboard.left')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">{t('dashboard.no_low_stock')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {t('dashboard.recent_orders')}
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.order_id')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.customer')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.status')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recent_orders?.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.order_status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.order_status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : order.order_status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {t(`dashboard.order_status.${order.order_status}`) || order.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
