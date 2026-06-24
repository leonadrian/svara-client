import { auth } from '../../firebase';

export async function getAuthHeaders() {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = (import.meta as any).env?.VITE_API_URL || '';
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });

  if (!response.ok) {
    let errMsg = `API error: ${response.status} ${response.statusText}`;
    try {
      const errBody = await response.json();
      if (errBody && errBody.message) errMsg = errBody.message;
    } catch (_) {}
    throw new Error(errMsg);
  }

  return response.json() as Promise<T>;
}
