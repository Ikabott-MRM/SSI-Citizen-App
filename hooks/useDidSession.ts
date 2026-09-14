import { useCallback, useEffect, useRef, useState } from 'react';
import { useDid } from '@/providers/DidProvider';
import {
  clearPersistedDidAccessToken,
  ensureDidAccessToken,
  getDidAccessToken,
  loadPersistedDidAccessToken,
  setDidSessionCredentials,
} from '@/services/didSession';

export type DidSessionState = {
  /** True once a Bearer token is available (or auth is not yet required / failed soft). */
  isAuthenticated: boolean;
  /** True while challenge→token is in flight. */
  isAuthenticating: boolean;
  /** Last auth error message (no secrets). */
  error: string | null;
  /** Force a new challenge→token exchange. */
  refreshSession: () => Promise<string | null>;
  /** Ensure a token exists before subject API calls (upload/list). */
  ensureSession: () => Promise<string | null>;
};

/**
 * After didUri + portableDid are available, silently obtain a DID access token
 * and keep credentials registered for axios 401 re-auth.
 */
export function useDidSession(): DidSessionState {
  const { didUri, portableDid } = useDid();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const prevDidRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runAuth = useCallback(
    async (force: boolean): Promise<string | null> => {
      if (!didUri || !portableDid) {
        setDidSessionCredentials(null);
        if (mountedRef.current) {
          setIsAuthenticated(false);
          setError(null);
        }
        return null;
      }

      setDidSessionCredentials({
        did: didUri,
        portableDidJson: portableDid,
      });

      if (mountedRef.current) {
        setIsAuthenticating(true);
        setError(null);
      }

      try {
        if (!force) {
          const persisted = getDidAccessToken() ?? (await loadPersistedDidAccessToken());
          if (persisted) {
            if (mountedRef.current) {
              setIsAuthenticated(true);
            }
            // Still refresh in background if we only had a persisted token
            // without known expiry — skip force here to avoid double challenge
            // on every mount when memory already has a fresh token.
            if (getDidAccessToken()) {
              return persisted;
            }
          }
        }

        const token = await ensureDidAccessToken({ force });
        if (mountedRef.current) {
          setIsAuthenticated(Boolean(token));
        }
        return token;
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'DID authentication failed';
        if (mountedRef.current) {
          setIsAuthenticated(false);
          setError(message);
        }
        return null;
      } finally {
        if (mountedRef.current) {
          setIsAuthenticating(false);
        }
      }
    },
    [didUri, portableDid],
  );

  useEffect(() => {
    if (!didUri || !portableDid) {
      prevDidRef.current = didUri;
      setDidSessionCredentials(null);
      void clearPersistedDidAccessToken();
      setIsAuthenticated(false);
      setError(null);
      return;
    }

    if (prevDidRef.current && prevDidRef.current !== didUri) {
      void clearPersistedDidAccessToken();
    }
    prevDidRef.current = didUri;
    void runAuth(false);
  }, [didUri, portableDid, runAuth]);

  const refreshSession = useCallback(() => runAuth(true), [runAuth]);
  const ensureSession = useCallback(() => runAuth(false), [runAuth]);

  return {
    isAuthenticated,
    isAuthenticating,
    error,
    refreshSession,
    ensureSession,
  };
}
