import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Globe, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useIsMobile } from '../hooks/use-mobile';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="bg-white shadow-sm relative">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}/logo.png`}
                alt="بركة التمور"
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center gap-4">
                <Link to="/products" className="text-gray-600 hover:text-gray-900">
                  {t('nav.products')}
                </Link>

                {(user?.roles?.includes('Admin') || user?.roles?.includes('Super Admin')) && (
                  <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                    {t('nav.dashboard')}
                  </Link>
                )}

                <Link to="/cart" className="relative">
                  <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-gray-900" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>

                {/* <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLanguage}
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">عربي</span>
                </Button> */}

                {user ? (
                  <div className="flex items-center gap-4">
                    <Link to="/my-orders" className="text-gray-600 hover:text-gray-900">
                      {t('nav.orders')}
                    </Link>
                    {/* {(user?.roles?.includes('Admin') || user?.roles?.includes('Super Admin')) && (
                      <Link to="/dashboard">
                        <Button variant="outline">{t('nav.dashboard')}</Button>
                      </Link>
                    )} */}
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
            )}

            {/* Mobile Navigation */}
            {isMobile && (
              <div className="flex items-center gap-2">
                {/* Cart Icon for Mobile */}
                <Link to="/cart" className="relative" onClick={closeMenu}>
                  <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-gray-900" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMenu}
                  className="md:hidden"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobile && isMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={closeMenu}
              />

              {/* Menu */}
              <div className={`absolute top-16 left-0 right-0 bg-white shadow-lg border-t z-50 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                <div className="container mx-auto px-4 py-4">
                  <div className={`flex flex-col space-y-4 ${language === 'ar' ? 'items-end' : 'items-start'}`}>
                    <Link
                      to="/products"
                      className="text-gray-600 hover:text-gray-900 py-2 w-full"
                      onClick={closeMenu}
                    >
                      {t('nav.products')}
                    </Link>

                    {user && (
                      <Link
                        to="/my-orders"
                        className="text-gray-600 hover:text-gray-900 py-2 w-full"
                        onClick={closeMenu}
                      >
                        {t('nav.orders')}
                      </Link>
                    )}

                    {(user?.roles?.includes('Admin') || user?.roles?.includes('Super Admin')) && (
                      <Link to="/dashboard" onClick={closeMenu} className="w-full">
                        <Button variant="outline" className={`w-full ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                          {t('nav.dashboard')}
                        </Button>
                      </Link>
                    )}

                    {/* <Button
                      variant="ghost"
                      onClick={toggleLanguage}
                      className={`flex items-center gap-2 w-full ${language === 'ar' ? 'justify-end' : 'justify-start'}`}
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">عربي</span>
                    </Button> */}

                    <div className="border-t pt-4 w-full">
                      {user ? (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            logout();
                            closeMenu();
                          }}
                          className={`flex items-center gap-2 w-full text-red-600 hover:text-red-700 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}
                        >
                          <LogOut className="h-4 w-4" />
                          {t('nav.logout')}
                        </Button>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Link to="/login" onClick={closeMenu} className="w-full">
                            <Button variant="ghost" className="w-full">
                              {t('nav.login')}
                            </Button>
                          </Link>
                          <Link to="/register" onClick={closeMenu} className="w-full">
                            <Button className="w-full">
                              {t('nav.register')}
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
