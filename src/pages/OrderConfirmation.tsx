import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle, MessageCircle } from 'lucide-react';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { orderId, orderNumber, whatsappUrl } = location.state || {};

  useEffect(() => {
    // If no order details are present, redirect to home
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null;
  }

  const handleWhatsAppClick = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="text-center py-12 px-8 bg-green-50 border-b">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('order.confirmation.title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              {t('order.confirmation.message')}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 border-b pb-3">
              {t('order.confirmation.details')}
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">{t('order.confirmation.orderNumber')}</span>
                <span className="font-semibold text-gray-900">#{orderNumber}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">{t('order.confirmation.date')}</span>
                <span className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {whatsappUrl && (
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <MessageCircle className="h-5 w-5 text-green-600 ml-2" />
                  <span className="text-green-800 font-semibold">{t('order.confirmation.whatsapp.title')}</span>
                </div>
                <p className="text-green-700 text-sm mb-4 leading-relaxed">
                  {t('order.confirmation.whatsapp.message')}
                </p>
                <Button
                  onClick={handleWhatsAppClick}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                  {t('order.confirmation.whatsapp.button')}
                </Button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                size="lg"
                className="min-w-[200px]"
              >
                {t('order.confirmation.continueShopping')}
              </Button>
              <Button
                onClick={() => navigate('/my-orders')}
                size="lg"
                className="min-w-[200px]"
              >
                {t('order.confirmation.viewOrders')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
