import axios from 'axios';
import { errorCodes } from '@/i18n/errorCodes';
import { isAxiosError } from 'axios';
import Toast from 'react-native-root-toast';
import { getPublicEnv } from '@/utils/publicEnv';
import i18n from '@/app/i18n';
import type { InternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders } from 'axios';
import {
  ensureDidAccessToken,
  isDidAuthEndpoint,
  isDidSubjectRoute,
} from '@/services/didSession';

// Default API endpoint (HTTPS) for all builds.
// Keep env override available for local dev / staging switches.
const DEFAULT_PUBLIC_API_BASE_URL = 'https://api.ssi-api.xyz';

function normalizeBaseUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  // Remove trailing slashes so baseURL + "/path" doesn't become "//path"
  return url.replace(/\/+$/, '');
}

function resolveRequestUrl(baseURL: string | undefined, url: string | undefined): string {
  const u = url ?? '';
  const b = baseURL ?? '';
  // If axios passes an absolute url in config.url, prefer it as-is.
  try {
    return new URL(u).toString();
  } catch {
    // ignore
  }
  // Otherwise, try to resolve relative url against baseURL.
  try {
    if (b) return new URL(u, b).toString();
  } catch {
    // ignore
  }
  return `${b}${u}`;
}

interface ErrorResponse {
  message: string;
}

const instance = axios.create({
  baseURL:
    normalizeBaseUrl(getPublicEnv('EXPO_PUBLIC_API_BASE_URL')) ??
    DEFAULT_PUBLIC_API_BASE_URL,
});

const apiKey = getPublicEnv('EXPO_PUBLIC_API_KEY');
if (apiKey) {
  // Backend expects x-api-key (see docs/Identity-API-Endpoints-Architecture.md)
  instance.defaults.headers.common['x-api-key'] = apiKey;
  // Keep backward compatibility for any legacy middleware.
  instance.defaults.headers.common['api_key'] = apiKey;
} else {
  // eslint-disable-next-line no-console
  console.warn('[API] EXPO_PUBLIC_API_KEY is not configured.');
}

type DidRetryConfig = InternalAxiosRequestConfig & { _didRetry?: boolean };

function setAuthorizationHeader(
  config: InternalAxiosRequestConfig,
  token: string,
): void {
  const value = `Bearer ${token}`;
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }
  const headers = config.headers as AxiosHeaders & {
    set?: (k: string, v: string) => void;
    Authorization?: string;
  };
  if (typeof headers.set === 'function') {
    headers.set('Authorization', value);
  } else {
    headers.Authorization = value;
  }
}

instance.interceptors.request.use(async (config: DidRetryConfig) => {
  // Avoid logging secrets like api_key; log only the request target.
  const baseURL = config.baseURL ?? instance.defaults.baseURL ?? '';
  const url = config.url ?? '';
  const method = (config.method ?? 'get').toUpperCase();
  const resolvedUrl = resolveRequestUrl(baseURL, url);
  // In release builds, this helps debug network issues via logcat (ReactNativeJS).
  // eslint-disable-next-line no-console
  console.log(`[API] ${method} ${resolvedUrl}`);

  const skipAuth = isDidAuthEndpoint(resolvedUrl) || isDidAuthEndpoint(url);
  const subject = isDidSubjectRoute(url) || isDidSubjectRoute(resolvedUrl);

  if (!skipAuth) {
    try {
      const token = await ensureDidAccessToken();
      if (token) {
        setAuthorizationHeader(config, token);
      } else if (subject) {
        // Don't hit DidJwtAuthGuard without a Bearer (Passport: "No auth token").
        return Promise.reject(
          new Error('DID access token unavailable. Recreate or restore your DID.'),
        );
      }
    } catch (err) {
      if (subject) {
        return Promise.reject(err);
      }
      // Non-subject routes proceed; guarded routes will 401.
    }
  }
  return config;
});

instance.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    if (isAxiosError(error) && error.response?.status === 401 && error.config) {
      const cfg = error.config as DidRetryConfig;
      const resolved = resolveRequestUrl(cfg.baseURL ?? instance.defaults.baseURL, cfg.url);
      const subject =
        isDidSubjectRoute(cfg.url) || isDidSubjectRoute(resolved);
      if (
        subject &&
        !cfg._didRetry &&
        !isDidAuthEndpoint(cfg.url) &&
        !isDidAuthEndpoint(resolved)
      ) {
        cfg._didRetry = true;
        try {
          const token = await ensureDidAccessToken({ force: true });
          if (token) {
            setAuthorizationHeader(cfg, token);
            return instance.request(cfg);
          }
        } catch {
          // fall through to toast
        }
      }
    }

    const lang = i18n.language === 'es' ? 'es' : 'en';
    let errorMessage = i18n.t('An unexpected error occurred.');
    let status: number | undefined;
    let code: string | undefined;
    let method: string | undefined;
    let url: string | undefined;

    if (isAxiosError(error)) {
      const err: ErrorResponse | undefined = error.response?.data;
      status = error.response?.status;
      code = error.code;

      const baseURL = error.config?.baseURL ?? instance.defaults.baseURL ?? '';
      url = resolveRequestUrl(baseURL, error.config?.url);
      method = (error.config?.method ?? 'get').toUpperCase();

      const errorMessageFromStatus = status
        ? errorCodes[status]?.[lang]
        : undefined;

      if (errorMessageFromStatus) {
        errorMessage = errorMessageFromStatus;
      } else if (err && err.message) {
        errorMessage = i18n.t('Request failed with server message', {
          message: err.message,
        });
      } else if (typeof error.message === 'string' && error.message.trim()) {
        // Common case: "Network Error", "timeout of ... exceeded", etc.
        errorMessage = error.message;
      }
    }

    // eslint-disable-next-line no-console
    console.error(
      `[API] ERROR${status ? ` ${status}` : ''}${code ? ` (${code})` : ''}${
        method && url ? ` ${method} ${url}` : ''
      }`,
      errorMessage,
    );

    const prefix = i18n.t('API error label');
    Toast.show(
      `${prefix}${status ? ` (${status})` : ''}${code ? ` (${code})` : ''}: ${errorMessage}`,
      {
      duration: Toast.durations.LONG,
      position: Toast.positions.BOTTOM,
      },
    );

    return Promise.reject(error);
  },
);

export default instance;
