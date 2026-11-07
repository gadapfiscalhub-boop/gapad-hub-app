export interface User {
  id: string;
  email: string;
  name?: string;
  tenant_id?: string;
  tenant_name?: string;
  role?: string;
}

export interface AuthSession {
  token: string;
  refresh_token?: string;
  user: User;
}

export interface Project {
  id: string;
  code?: string;
  name: string;
  status: string;
  address?: string;
  city?: string;
  manager_name?: string;
  budget_total?: number;
  created_at?: string;
  client?: string;
  contract_value?: string;
  cronograma?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  unit: string; // Ex: 'sacos', 'barras', 'm³', 'unid'
  expected_qty: number;
  received_qty?: number;
  category?: string;
}

export interface MaterialOrder {
  id: string;
  order_number: string;
  supplier: string;
  invoice_number?: string;
  delivery_forecast: string; // Ex: 'Hoje', 'Amanhã', '10/11/2026'
  driver_name?: string;
  vehicle_plate?: string;
  items_count: number;
  status: 'in_transit' | 'pending' | 'delivered_partial' | 'delivered_full';
  items: OrderItem[];
}

export interface GoodsReceiptPayload {
  order_id: string;
  project_id: string;
  received_at: string;
  is_partial: boolean;
  received_by: string;
  notes?: string;
  items: {
    item_id: string;
    item_name: string;
    expected_qty: number;
    received_qty: number;
    difference: number;
  }[];
  invoice_photo_base64?: string;
  cargo_photo_base64?: string;
}
