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
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('order.confirmation.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('order.confirmation.message')}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">
              {t('order.confirmation.details')}
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('order.confirmation.orderNumber')}</span>
                <span className="font-medium">#{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('order.confirmation.date')}</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {whatsappUrl && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <MessageCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">{t('order.confirmation.whatsapp.title')}</span>
                </div>
                <p className="text-green-700 text-sm mb-3">
                  {t('order.confirmation.whatsapp.message')}
                </p>
                <Button
                  onClick={handleWhatsAppClick}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {t('order.confirmation.whatsapp.button')}
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              {t('order.confirmation.continueShopping')}
            </Button>
            <Button
              onClick={() => navigate('/my-orders')}
            >
              {t('order.confirmation.viewOrders')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
