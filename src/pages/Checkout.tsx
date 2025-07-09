import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import api from '../lib/api';

// Currency formatter for Libyan Dinar
const formatCurrency = (amount: number) => {
  return `${amount.toFixed(2)} د.ل`;
};

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  paymentMethod: z.enum(['cash', 'massarat', 'paypal']).default('cash'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autofillData, setAutofillData] = useState<Partial<CheckoutFormData> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  // Fetch user profile data for auto-fill
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const response = await api.get('/api/profile');
          if (response.data?.autofill) {
            setAutofillData(response.data.autofill);
            // Reset form with auto-fill data
            reset(response.data.autofill);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user, reset]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Prepare order data for API
      const orderData = {
        ...(user && { user_id: user.id }), // Include user_id if logged in
        customer_name: `${data.firstName} ${data.lastName}`,
        customer_email: data.email,
        customer_phone: data.phone,
        shipping_address: `${data.address}, ${data.city}, ${data.state} ${data.zipCode}, ${data.country}`,
        payment_method: data.paymentMethod,
        notes: '',
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      console.log('Creating order:', orderData);

      // Create the order via API
      const response = await api.post('/api/orders', orderData);

      if (response.data) {
        console.log('Order created successfully:', response.data);

        // Check if there's a WhatsApp URL for manual messaging
        if (response.data.whatsapp_url) {
          // Open WhatsApp URL in a new tab
          window.open(response.data.whatsapp_url, '_blank');
        }

        // Clear the cart and redirect to order confirmation
        clearCart();
        navigate('/order-confirmation', {
          state: {
            orderId: response.data.id,
            orderNumber: response.data.order_number || response.data.id,
            whatsappUrl: response.data.whatsapp_url
          }
        });
        toast.success(t('checkout.success'));
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error(t('checkout.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">{t('checkout.empty.title')}</h1>
        <p className="text-gray-600 mb-8">{t('checkout.empty.message')}</p>
        <Button onClick={() => navigate('/products')}>
          {t('checkout.empty.continue')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('checkout.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          {user && autofillData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <span className="font-medium">{t('checkout.autofill.title')}:</span> {t('checkout.autofill.message')}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('checkout.form.firstName')}
                </label>
                <Input
                  {...register('firstName')}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('checkout.form.lastName')}
                </label>
                <Input
                  {...register('lastName')}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('checkout.form.email')}
              </label>
              <Input
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('checkout.form.phone')}
              </label>
              <Input
                type="tel"
                {...register('phone')}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('checkout.form.address')}
              </label>
              <Input
                {...register('address')}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('checkout.form.city')}
                </label>
                <Input
                  {...register('city')}
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('checkout.form.state')}
                </label>
                <Input
                  {...register('state')}
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('checkout.form.zipCode')}
                </label>
                <Input
                  {...register('zipCode')}
                  className={errors.zipCode ? 'border-red-500' : ''}
                />
                {errors.zipCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('checkout.form.country')}
                </label>
                <Input
                  {...register('country')}
                  className={errors.country ? 'border-red-500' : ''}
                />
                {errors.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('checkout.form.paymentMethod')}
              </label>
              <select
                {...register('paymentMethod')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">{t('checkout.payment.cash')}</option>
                <option value="massarat">{t('checkout.payment.massarat')}</option>
                <option value="paypal">{t('checkout.payment.paypal')}</option>
              </select>
              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentMethod.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : t('checkout.form.submit')}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t('checkout.summary.title')}</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>{t('checkout.summary.total')}</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
