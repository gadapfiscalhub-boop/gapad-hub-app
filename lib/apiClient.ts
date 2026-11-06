/**
 * Client HTTP customizado para o GADAP Field App.
 * Aponta automaticamente para NEXT_PUBLIC_API_URL e injeta:
 * - Authorization: Bearer <JWT>
 * - X-Project-ID: <active_project_id> (quando selecionado)
 * - X-Tenant-ID: <tenant_id> (quando disponível)
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://gapad-hub.vercel.app/api/v1';

export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  data?: any; // Suporte para { data: body } estilo Axios / Fetch custom
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, data: requestBody, body, headers, ...restOptions } = options;

  let url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Obter credenciais salvas no cliente
  let token: string | null = null;
  let activeProjectId: string | null = null;
  let tenantId: string | null = null;

  if (typeof window !== 'undefined') {
    token = localStorage.getItem('gadap_token');
    activeProjectId = localStorage.getItem('gadap_active_project_id');
    const userRaw = localStorage.getItem('gadap_user');
    if (userRaw) {
      try {
        const parsed = JSON.parse(userRaw);
        tenantId = parsed.tenant_id || parsed.company_id || null;
      } catch (e) {
        // Ignorar erro de parse
      }
    }
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (activeProjectId) {
    reqHeaders['X-Project-ID'] = activeProjectId;
  }

  if (tenantId) {
    reqHeaders['X-Tenant-ID'] = tenantId;
  }

  const finalBody =
    body !== undefined
      ? body
      : requestBody !== undefined
      ? JSON.stringify(requestBody)
      : undefined;

  const response = await fetch(url, {
    ...restOptions,
    headers: reqHeaders,
    body: finalBody,
  });

  // Em caso de 401 não autorizado, deslogar se em ambiente cliente
  if (response.status === 401 && typeof window !== 'undefined') {
    if (!window.location.pathname.includes('/login')) {
      localStorage.removeItem('gadap_token');
      localStorage.removeItem('gadap_user');
      localStorage.removeItem('gadap_active_project_id');
      window.location.href = '/login';
    }
  }

  let data: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      data?.detail || data?.message || `Erro HTTP ${response.status}`;
    throw new ApiError(response.status, errorMessage, data);
  }

  return data as T;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
