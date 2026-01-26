export type OrderStatus =
  | 'pending_details'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  buyer_id: string;
  instagram_user_id: string;
  buyer_instagram_username?: string;
  conversation_id: string;
  items: OrderItem[];
  total: number;
  customer_name?: string;
  shipping_address?: string;
  phone?: string;
  payment_reference?: string;
  payment_method?: string;
  payment_confirmed_at?: string;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderStatistics {
  total_orders: number;
  total_revenue: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}
