import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <>
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}/logo.png`}
                alt="Barakah Dates"
                className="h-10 w-auto"
              />
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/products" className="text-gray-600 hover:text-gray-900">
                {t('nav.products')}
              </Link>

              <Link to="/categories" className="text-gray-600 hover:text-gray-900">
                {t('nav.categories')}
              </Link>

              <Link to="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-gray-900" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm">{language === 'ar' ? 'EN' : 'عربي'}</span>
              </Button>

              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/my-orders" className="text-gray-600 hover:text-gray-900">
                    {t('nav.orders')}
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/dashboard">
                      <Button variant="outline">{t('nav.dashboard')}</Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    onClick={logout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('nav.logout')}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login">
                    <Button variant="ghost">{t('nav.login')}</Button>
                  </Link>
                  <Link to="/register">
                    <Button>{t('nav.register')}</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
