import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">{t('orderConfirmation.title')}</h1>
          <p className="text-gray-600 mb-8">{t('orderConfirmation.message')}</p>
        </div>

        <div className="space-y-4">
          <Button onClick={() => navigate('/products')} className="w-full">
            {t('orderConfirmation.continueShopping')}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/orders')}
            className="w-full"
          >
            {t('orderConfirmation.viewOrders')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 