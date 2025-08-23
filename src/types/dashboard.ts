export interface Order {
  id: number;
  order_number?: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  payment_method?: string;
  order_status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  quantity: number;
  unit_price: string;
  is_wholesale: boolean;
  product: {
    id: number;
    name: string;
    retail_price: string;
  } | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category_id: number;
  retail_price: number;
  price: number; // accessor for frontend compatibility
  wholesale_price?: number;
  retail_buying_price?: number;
  wholesale_buying_price?: number;
  wholesale_threshold?: number;
  stock: number; // matches the database field name
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
  };
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

export interface City {
  id: number;
  name: string;
  delivery_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CitiesResponse {
  data: City[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}
