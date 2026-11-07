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

export interface ProjectTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies?: string;
  status?: 'planned' | 'in_progress' | 'completed' | 'delayed';
  custom_class?: string;
  responsible?: string;
}

export interface SubcontractorExtraCharge {
  id: string;
  subcontractor_name: string;
  trade: string; // Ex: Elétrica, Alvenaria, Pintura
  amount: number;
  reason: string;
  evidence_description?: string;
  evidence_photos: string[];
  status: 'pending' | 'approved' | 'disputed';
  created_at: string;
  location?: string;
  unit_price?: number;
  quantity?: number;
  unit?: string;
  dispute_reason?: string;
  audited_by?: string;
  audited_at?: string;
}

export interface FieldReportPayload {
  task_id: string;
  task_name: string;
  project_id: string;
  reported_progress: number;
  report_text: string;
  reported_by: string;
  photo_base64?: string;
  timestamp: string;
}

export interface ChangeOrderPayload {
  project_id: string;
  title: string;
  description: string;
  requested_by: string;
  client_contact?: string;
  urgency: 'baixa' | 'media' | 'alta';
  status: 'pending_pricing';
  created_at: string;
}

export interface OrderItem {
  id: string;
  name: string;
  unit: string;
  expected_qty: number;
  received_qty?: number;
  category?: string;
}

export interface MaterialOrder {
  id: string;
  order_number: string;
  supplier: string;
  invoice_number?: string;
  delivery_forecast: string;
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
