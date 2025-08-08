import { stringify } from 'querystring';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method: HttpMethod;
  path: string;
  body?: any;
  params?: Record<string, any>;
}

export async function callApi<T>(options: RequestOptions): Promise<T> {
  const { method, path, body, params } = options;

  const url = params ? `${path}?${stringify(params)}` : path;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
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