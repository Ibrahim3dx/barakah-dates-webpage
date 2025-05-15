import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
      const response = await fetch(`/api/orders/${id}`, {
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Order #{order.order_number}</h1>
              <p className="text-gray-600">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(order.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Shipping Information</h2>
              <p className="text-gray-600">{order.shipping_address}</p>
              <p className="text-gray-600">
                {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Payment Information</h2>
              <p className="text-gray-600">
                Method: {order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}
              </p>
              <p className="text-gray-600">
                Status: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t mt-6 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Button onClick={() => window.print()}>
            Print Order
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Orders
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 