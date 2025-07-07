import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, totalAmount, getItemPrice } = useCart();
  const { t } = useLanguage();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error(t('cart.empty.message'));
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">{t('cart.empty.title')}</h1>
        <p className="text-gray-600 mb-8">{t('cart.empty.message')}</p>
        <Button onClick={() => navigate('/products')}>
          {t('cart.empty.continue')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="p-6 border-b last:border-b-0">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <div className="text-gray-600">
                      <p>${(Number(getItemPrice(item)) || 0).toFixed(2)} each</p>
                      {item.wholesale_threshold && item.quantity >= item.wholesale_threshold && (
                        <p className="text-green-600 text-sm">Wholesale price applied!</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${((Number(getItemPrice(item)) || 0) * item.quantity).toFixed(2)}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t('cart.summary.title')}</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>{t('cart.summary.subtotal')}</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('cart.summary.shipping')}</span>
                <span>{t('cart.summary.free')}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>{t('cart.summary.total')}</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full mt-4"
              >
                {t('cart.summary.checkout')}
              </Button>
              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full"
              >
                {t('cart.summary.clear')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
