import React, { createContext, useContext } from 'react';
import { useDidSession, DidSessionState } from '@/hooks/useDidSession';

const DidSessionContext = createContext<DidSessionState | undefined>(undefined);

export const useDidSessionContext = () => {
  const context = useContext(DidSessionContext);
  if (!context) {
    throw new Error(
      'useDidSessionContext must be used within a DidSessionProvider',
    );
  }
  return context;
};

/**
 * Runs silent DID proof-of-possession auth once didUri + portableDid exist.
 * Must nest inside DidProvider.
 */
export const DidSessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = useDidSession();

  return (
    <DidSessionContext.Provider value={session}>
      {children}
    </DidSessionContext.Provider>
  );
};
