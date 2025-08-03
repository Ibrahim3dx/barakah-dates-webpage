import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().min(8, 'Password confirmation is required'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (token && email) {
      setValue('token', token);
      setValue('email', email);
    } else {
      toast.error('Invalid reset link');
      navigate('/login');
    }
  }, [searchParams, setValue, navigate]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t('auth.resetPassword.success') || 'Password reset successfully!');
      navigate('/login');
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.resetPassword.error') || 'Failed to reset password');
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    resetPasswordMutation.mutate(data);
  };

  return (
    <div className={`container mx-auto px-4 py-16 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className={`text-2xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('auth.resetPassword.title') || 'Reset Password'}
            </CardTitle>
            <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
              {t('auth.resetPassword.description') || 'Enter your new password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Hidden fields for email and token */}
              <input type="hidden" {...register('email')} />
              <input type="hidden" {...register('token')} />

              <div className="space-y-2">
                <Label htmlFor="password" className={isRTL ? 'text-right' : 'text-left'}>
                  {t('auth.resetPassword.password') || 'New Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
                  {...register('password')}
                  className={errors.password ? 'border-red-500' : ''}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.password && (
                  <p className={`text-red-500 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation" className={isRTL ? 'text-right' : 'text-left'}>
                  {t('auth.resetPassword.confirmPassword') || 'Confirm New Password'}
                </Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  placeholder="Confirm your new password"
                  {...register('password_confirmation')}
                  className={errors.password_confirmation ? 'border-red-500' : ''}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.password_confirmation && (
                  <p className={`text-red-500 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading
                  ? (t('auth.resetPassword.loading') || 'Resetting...')
                  : (t('auth.resetPassword.submit') || 'Reset Password')
                }
              </Button>
            </form>

            <div className={`mt-6 text-center ${isRTL ? 'text-right' : 'text-left'}`}>
              <Link
                to="/login"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                {t('auth.resetPassword.backToLogin') || 'Back to Sign In'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
