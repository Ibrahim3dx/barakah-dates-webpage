import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Categories from './components/Categories';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/dashboard/Dashboard';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardProducts from './pages/dashboard/Products';
import DashboardCategories from './pages/dashboard/Categories';
import DashboardOrders from './pages/dashboard/Orders';
import DashboardUsers from './pages/dashboard/Users';
import DashboardSettings from './pages/dashboard/Settings';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import Index from './pages/Index';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Toaster position="top-right" />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navbar />}>
                  <Route index element={<Index />} />
                  <Route path="products" element={<Products />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="order-confirmation" element={<OrderConfirmation />} />
                  <Route path="my-orders" element={<MyOrders />} />
                </Route>

                {/* Protected Dashboard Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<DashboardProducts />} />
                  <Route path="categories" element={<DashboardCategories />} />
                  <Route path="orders" element={<DashboardOrders />} />
                  <Route path="users" element={<DashboardUsers />} />
                  <Route path="settings" element={<DashboardSettings />} />
                </Route>
              </Routes>
            </Router>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
