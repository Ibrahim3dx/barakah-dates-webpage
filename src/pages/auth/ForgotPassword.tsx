import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reset link');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t('auth.forgotPassword.success') || 'Password reset link sent to your email!');
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.forgotPassword.error') || 'Failed to send reset link');
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    forgotPasswordMutation.mutate(data);
  };

  return (
    <div className={`container mx-auto px-4 py-16 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className={`text-2xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('auth.forgotPassword.title') || 'Forgot Password'}
            </CardTitle>
            <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
              {t('auth.forgotPassword.description') || 'Enter your email address and we\'ll send you a link to reset your password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className={isRTL ? 'text-right' : 'text-left'}>
                  {t('auth.forgotPassword.email') || 'Email Address'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.forgotPassword.emailPlaceholder') || 'Enter your email'}
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.email && (
                  <p className={`text-red-500 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading
                  ? (t('auth.forgotPassword.loading') || 'Sending...')
                  : (t('auth.forgotPassword.submit') || 'Send Reset Link')
                }
              </Button>
            </form>

            <div className={`mt-6 text-center ${isRTL ? 'text-right' : 'text-left'}`}>
              <Link
                to="/login"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                {t('auth.forgotPassword.backToLogin') || 'Back to Sign In'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
