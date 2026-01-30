export interface BuyerStats {
  total_buyers: number;
  frequent_buyers: number;
  new_buyers: number;
  at_risk_buyers: number;
  repeat_customers: number;
  repeat_rate: number;
}

export interface OrderSummary {
  order_id: string;
  order_number: string;
  total: number;
  status: string;
  items_count: number;
  created_at: string;
}

export interface Buyer {
  buyer_id: string;
  buyer_username: string | null;
  customer_name: string | null;
  phone: string | null;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  first_order_date: string;
  last_order_date: string;
  days_since_last_order: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  status: 'frequent' | 'new' | 'at_risk' | 'regular';
  tags: string[];
}

export interface BuyerProfile extends Buyer {
  shipping_address: string | null;
  conversation_id: string | null;
  notes: string | null;
  order_history: OrderSummary[];
}

export interface BuyersListResponse {
  buyers: Buyer[];
  total: number;
  limit: number;
  offset: number;
}

export type BuyerStatusFilter = 'all' | 'frequent' | 'new' | 'at_risk' | 'regular';
