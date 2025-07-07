import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  retail_price: number;
  wholesale_price?: number;
  wholesale_threshold?: number;
  image_url: string;
  stock: number;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  retail_price: number;
  wholesale_price?: number;
  wholesale_threshold?: number;
  quantity: number;
  image_url: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  getItemPrice: (item: CartItem) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Validate and clean cart data
        const validatedCart = parsedCart.map((item: Partial<CartItem>) => ({
          id: item.id || 0,
          name: item.name || '',
          image_url: item.image_url || '',
          price: Number(item.price) || Number(item.retail_price) || 0,
          retail_price: Number(item.retail_price) || Number(item.price) || 0,
          wholesale_price: item.wholesale_price ? Number(item.wholesale_price) : undefined,
          wholesale_threshold: item.wholesale_threshold,
          quantity: Number(item.quantity) || 1
        }));
        setItems(validatedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Function to calculate the price based on quantity (wholesale vs retail)
  const getItemPrice = (item: CartItem): number => {
    if (item.wholesale_threshold && item.wholesale_price && item.quantity >= item.wholesale_threshold) {
      return Number(item.wholesale_price) || 0;
    }
    return Number(item.retail_price) || Number(item.price) || 0;
  };

  const addToCart = (product: Product) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);

      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        retail_price: product.retail_price,
        wholesale_price: product.wholesale_price,
        wholesale_threshold: product.wholesale_threshold,
        quantity: 1,
        image_url: product.image_url
      }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + (getItemPrice(item) * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalAmount,
      getItemPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
