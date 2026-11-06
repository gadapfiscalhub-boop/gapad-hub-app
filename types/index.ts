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
  status: string; // Compatível com strings dinâmicas do backend ou status pré-definidos
  address?: string;
  city?: string;
  manager_name?: string;
  budget_total?: number;
  created_at?: string;
}

export interface LoginResponse {
  access_token?: string;
  token?: string;
  token_type?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    tenant_id?: string;
    tenant_name?: string;
    company_id?: string;
    company_name?: string;
  };
  tenant?: {
    id: string;
    name: string;
  };
  tenant_id?: string;
  tenant_name?: string;
}
