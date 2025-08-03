import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(t('auth.register.success') || 'Registration successful! Please login.');
      navigate('/login');
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.register.error') || 'Registration failed');
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setIsLoading(true);
    registerMutation.mutate(data);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-100 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className={`text-2xl font-bold text-center ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('auth.register.title') || 'Create Account'}
          </CardTitle>
          <CardDescription className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('auth.register.subtitle') || 'Enter your details to create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={isRTL ? 'text-right' : 'text-left'}>
                {t('auth.register.name') || 'Full Name'}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={t('auth.register.namePlaceholder') || 'Enter your full name'}
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {errors.name && (
                <p className={`text-sm text-red-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={isRTL ? 'text-right' : 'text-left'}>
                {t('auth.register.email') || 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.register.emailPlaceholder') || 'Enter your email'}
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {errors.email && (
                <p className={`text-sm text-red-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={isRTL ? 'text-right' : 'text-left'}>
                {t('auth.register.password') || 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.register.passwordPlaceholder') || 'Enter your password'}
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {errors.password && (
                <p className={`text-sm text-red-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className={isRTL ? 'text-right' : 'text-left'}>
                {t('auth.register.confirmPassword') || 'Confirm Password'}
              </Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder={t('auth.register.confirmPasswordPlaceholder') || 'Confirm your password'}
                {...register('password_confirmation')}
                className={errors.password_confirmation ? 'border-red-500' : ''}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {errors.password_confirmation && (
                <p className={`text-sm text-red-500 ${isRTL ? 'text-right' : 'text-left'}`}>
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
                ? (t('auth.register.loading') || 'Creating account...')
                : (t('auth.register.submit') || 'Create account')
              }
            </Button>
          </form>
        </CardContent>
        <CardFooter className={`flex justify-center ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="text-sm text-gray-600">
            {t('auth.register.haveAccount') || 'Already have an account?'}{' '}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {t('auth.register.login') || 'Sign in'}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
