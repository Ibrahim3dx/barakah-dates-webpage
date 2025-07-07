export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  order_status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  retail_price: number;
  price: number; // accessor for frontend compatibility
  stock: number; // matches the database field name
  image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
