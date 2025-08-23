import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Currency formatter for Libyan Dinar
const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${numAmount.toFixed(2)} د.ل`;
};

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url: string;
  };
}

interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_method: 'massarat' | 'paypal';
  total_amount: number;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  created_at: string;
  items: OrderItem[];
}

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">Failed to load order details</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Package className="h-6 w-6 text-yellow-500" />;
      case 'processing':
        return <Truck className="h-6 w-6 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Header Section */}
          <div className="p-6 sm:p-8 border-b bg-gray-50">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order #{order.order_number}</h1>
                <p className="text-gray-600 text-base sm:text-lg">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">Shipping Information</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2">
                  <p className="font-medium text-gray-900 leading-relaxed">{order.shipping_address}</p>
                  <p className="text-gray-600">
                    {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">Payment Information</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
                  <p className="text-gray-900">
                    <span className="font-medium">Method:</span> {order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-medium">Status:</span> {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-3">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0 mx-auto sm:mx-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/fallback-product-image.png';
                      }}
                    />
                    <div className="flex-1 min-w-0 text-center sm:text-start">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2 leading-tight">{item.product.name}</h3>
                      <p className="text-gray-600">Quantity: <span className="font-medium">{item.quantity}</span></p>
                    </div>
                    <div className="text-center sm:text-end flex-shrink-0">
                      <p className="font-semibold text-lg text-gray-900 mb-1">{formatCurrency((item.price * item.quantity))}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t mt-8 pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 p-6 rounded-lg">
                <span className="text-xl font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => window.print()} size="lg" className="min-w-[150px]">
            Print Order
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} size="lg" className="min-w-[150px]">
            Back to Orders
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
