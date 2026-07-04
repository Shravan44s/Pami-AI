import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_API_URL = 'https://pamiai.vercel.app';
const DEFAULT_API_KEY = 'pami_mcp_secret_key_2026';

export interface ApiConfig {
  apiUrl: string;
  apiKey: string;
}

export async function getApiConfig(): Promise<ApiConfig> {
  try {
    const url = await AsyncStorage.getItem('PAMI_API_URL');
    const key = await AsyncStorage.getItem('PAMI_API_KEY');
    return {
      apiUrl: url || DEFAULT_API_URL,
      apiKey: key || DEFAULT_API_KEY,
    };
  } catch {
    return {
      apiUrl: DEFAULT_API_URL,
      apiKey: DEFAULT_API_KEY,
    };
  }
}

export async function saveApiConfig(apiUrl: string, apiKey: string): Promise<void> {
  await AsyncStorage.setItem('PAMI_API_URL', apiUrl.trim().replace(/\/$/, ''));
  await AsyncStorage.setItem('PAMI_API_KEY', apiKey.trim());
}

export async function apiRequest<T = any>(
  action: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<T> {
  const config = await getApiConfig();
  const url = `${config.apiUrl}/api/mobile?action=${action}`;

  console.log(`🌐 API Request: [${method}] ${url}`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const resJson = await response.json();

  if (!response.ok || !resJson.success) {
    throw new Error(resJson.error || `Request failed with status ${response.status}`);
  }

  return resJson.data as T;
}
