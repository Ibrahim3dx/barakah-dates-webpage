import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Calendar,
  Eye,
  Download
} from 'lucide-react';
import api from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface RecentOrder {
  id: number;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

interface TopProduct {
  id: number;
  name: string;
  sold: number;
  revenue: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface DashboardStats {
  total_revenue: string | number;
  total_orders: number;
  total_products: number;
  total_users: number;
  total_categories: number;
  recent_orders: RecentOrder[];
  top_products: TopProduct[];
  monthly_revenue: MonthlyRevenue[];
}

const DashboardView = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/stats');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${numAmount.toFixed(2)} د.ل`;
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('dashboard.title') || 'Dashboard Overview'}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('dashboard.overview') || 'Welcome to your dashboard overview'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('dashboard.export') || 'Export'}
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('dashboard.view_report') || 'View Report'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.total_revenue') || 'Total Revenue'}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats?.total_revenue || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.total_orders') || 'Total Orders'}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.total_orders || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.total_products') || 'Total Products'}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.total_products || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.total_customers') || 'Total Customers'}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.total_users || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {t('dashboard.revenue_overview') || 'Revenue Overview'}
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>{t('dashboard.chart_placeholder') || 'Chart will be displayed here'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {t('dashboard.recent_orders') || 'Recent Orders'}
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats?.recent_orders?.slice(0, 5).map((order, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{order.id || `ORD-${index + 1}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customer_name || 'Customer Name'}
                    </p>
                  </div>
                  <div className={`text-${isRTL ? 'left' : 'right'}`}>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.total_amount || 0)}
                    </p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {t(`dashboard.order_status.${order.status}`) || order.status}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>{t('dashboard.no_recent_orders') || 'No recent orders'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {t('dashboard.top_products') || 'Top Products'}
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.top_products?.slice(0, 6).map((product, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {product.name || `Product ${index + 1}`}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t('dashboard.sold')}: {product.sold || 0}
                    </p>
                  </div>
                </div>
              </div>
            )) || (
              <div className="col-span-full text-center text-gray-500 py-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>{t('dashboard.no_top_products') || 'No product data available'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
