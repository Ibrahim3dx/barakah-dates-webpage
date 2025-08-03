import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      // Store user data if needed
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success(t('auth.login.success') || 'Login successful');
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.login.error') || 'Login failed');
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setIsLoading(true);
    loginMutation.mutate(data);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-100 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className={`text-2xl font-bold text-center ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('auth.login.title') || 'Welcome Back'}
          </CardTitle>
          <CardDescription className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('auth.login.subtitle') || 'Enter your credentials to access your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className={isRTL ? 'text-right' : 'text-left'}>
                {t('auth.login.email') || 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.login.emailPlaceholder') || 'Enter your email'}
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
                {t('auth.login.password') || 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.login.passwordPlaceholder') || 'Enter your password'}
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

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? (t('auth.login.loading') || 'Signing in...')
                : (t('auth.login.submit') || 'Sign in')
              }
            </Button>

            <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                {t('auth.login.forgotPassword') || 'Forgot your password?'}
              </Link>
            </div>
          </form>
        </CardContent>
        <CardFooter className={`flex justify-center ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="text-sm text-gray-600">
            {t('auth.login.noAccount') || "Don't have an account?"}{' '}
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {t('auth.login.register') || 'Sign up'}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
