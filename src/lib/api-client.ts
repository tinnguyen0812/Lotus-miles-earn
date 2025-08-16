import { stringify } from 'querystring';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method: HttpMethod;
  path: string;
  body?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export async function callApi<T>(options: RequestOptions): Promise<T> {
  const { method, path, body, params, headers } = options;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined in environment variables.');
  }

  const url = params ? `${baseUrl}${path}?${stringify(params)}` : `${baseUrl}${path}`;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An error occurred during the API call.');
  }

  return response.json();
}