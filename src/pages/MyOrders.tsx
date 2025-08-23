import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CalendarDays, Package, CreditCard, MapPin, Phone, Mail } from 'lucide-react';
import api from '../lib/api';
import { Link } from 'react-router-dom';

// Currency formatter for Libyan Dinar
const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${numAmount.toFixed(2)} د.ل`;
};

interface OrderItem {
  id: number;
  quantity: number;
  unit_price: string;
  is_wholesale: boolean;
  product: {
    id: number;
    name: string;
    retail_price: string;
  } | null;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  is_wholesale: boolean;
  created_at: string;
  order_number: number;
  items: OrderItem[];
}

const MyOrders = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/orders', {
          params: {
            user_id: user.id
          }
        });
        setOrders(response.data.data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Log In</h1>
        <p className="text-gray-600 mb-8">You need to be logged in to view your orders.</p>
        <Link to="/login">
          <Button>Log In</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Error</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('order.myOrders.title')}</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <Package className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('order.myOrders.noOrders')}</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">{t('order.myOrders.noOrdersMessage')}</p>
            <Link to="/products">
              <Button size="lg">{t('order.myOrders.startShopping')}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="bg-gray-50 border-b p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="space-y-3">
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        Order #{order.order_number}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span className="capitalize">{order.payment_method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-3">
                      <Badge className={`${getStatusColor(order.order_status)} px-3 py-1`}>
                        {order.order_status}
                      </Badge>
                      <span className="text-xl font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Order Items */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">{t('order.myOrders.itemsOrdered')}</h3>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex-1 min-w-0 pe-4">
                              <p className="font-medium text-gray-900 mb-2 leading-tight">
                                {item.product?.name || t('order.myOrders.productUnavailable')}
                              </p>
                              <div className="flex flex-wrap items-center gap-3">
                                <p className="text-sm text-gray-600">
                                  {t('order.myOrders.quantity')}: <span className="font-medium">{item.quantity}</span>
                                </p>
                                {item.is_wholesale && (
                                  <Badge variant="secondary" className="text-xs py-1">{t('order.myOrders.wholesale')}</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-end flex-shrink-0">
                              <p className="font-semibold text-gray-900 mb-1">{formatCurrency(item.unit_price)}</p>
                              <p className="text-sm text-gray-600">
                                {t('order.myOrders.total')}: <span className="font-medium">{formatCurrency(parseFloat(item.unit_price) * item.quantity)}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">{t('order.myOrders.deliveryInfo')}</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
                          <MapPin className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 mb-2">{t('order.myOrders.shippingAddress')}</p>
                            <p className="text-gray-900 break-words leading-relaxed">{order.shipping_address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
                          <Phone className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">{t('order.myOrders.phone')}</p>
                            <p className="text-gray-900">{order.customer_phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
                          <Mail className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 mb-2">{t('order.myOrders.email')}</p>
                            <p className="text-gray-900 break-words">{order.customer_email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
