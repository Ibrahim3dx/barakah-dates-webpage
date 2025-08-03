import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().min(8, 'Password confirmation is required'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const ChangePassword = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordFormData) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password change failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t('auth.changePassword.success') || 'Password changed successfully!');
      reset();
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.changePassword.error') || 'Failed to change password');
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    changePasswordMutation.mutate(data);
  };

  return (
    <div className={`container mx-auto px-4 py-16 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className={`text-2xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('auth.changePassword.title') || 'Change Password'}
            </CardTitle>
            <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
              {t('auth.changePassword.description') || 'Enter your current password and choose a new one'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password" className={isRTL ? 'text-right' : 'text-left'}>
                  {t('auth.changePassword.currentPassword') || 'Current Password'}
                </Label>
                <Input
                  id="current_password"
                  type="password"
                  {...register('current_password')}
                  className={errors.current_password ? 'border-red-500' : ''}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.current_password && (
                  <p className={`text-red-500 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                    {errors.current_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={isRTL ? 'text-right' : 'text-left'}>
                  {t('auth.changePassword.newPassword') || 'New Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
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
                  {t('auth.changePassword.confirmPassword') || 'Confirm New Password'}
                </Label>
                <Input
                  id="password_confirmation"
                  type="password"
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
                  ? (t('auth.changePassword.loading') || 'Changing Password...')
                  : (t('auth.changePassword.submit') || 'Change Password')
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
