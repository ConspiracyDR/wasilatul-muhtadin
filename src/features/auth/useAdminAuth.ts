import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  checkAdminAuthorization,
  type AdminAuthorizationState,
} from '../../firebase/admin-auth';
import { observeAuthState, type AuthState } from '../../firebase/auth';

export type AdminSessionState =
  | { status: 'unconfigured'; user: null; authorization: AdminAuthorizationState }
  | { status: 'loading'; user: null; authorization: AdminAuthorizationState }
  | { status: 'signed-out'; user: null; authorization: AdminAuthorizationState }
  | { status: 'checking-admin'; user: User; authorization: AdminAuthorizationState }
  | { status: 'authorized'; user: User; authorization: AdminAuthorizationState }
  | { status: 'unauthorized'; user: User; authorization: AdminAuthorizationState };

const inactiveAuthorization: AdminAuthorizationState = {
  status: 'unauthorized',
  active: false,
};

export function useAdminSession(): AdminSessionState {
  const [authState, setAuthState] = useState<AuthState>({
    status: 'loading',
    user: null,
  });
  const [authorization, setAuthorization] =
    useState<AdminAuthorizationState>(inactiveAuthorization);

  useEffect(() => observeAuthState(setAuthState), []);

  useEffect(() => {
    if (authState.status !== 'signed-in') {
      setAuthorization(
        authState.status === 'unconfigured'
          ? { status: 'unconfigured', active: false }
          : inactiveAuthorization,
      );
      return;
    }

    let active = true;
    setAuthorization({ status: 'checking', active: false });
    checkAdminAuthorization(authState.user).then((nextAuthorization) => {
      if (active) {
        setAuthorization(nextAuthorization);
      }
    });

    return () => {
      active = false;
    };
  }, [authState]);

  if (authState.status === 'unconfigured') {
    return { status: 'unconfigured', user: null, authorization };
  }

  if (authState.status === 'loading') {
    return { status: 'loading', user: null, authorization };
  }

  if (authState.status === 'signed-out') {
    return { status: 'signed-out', user: null, authorization };
  }

  if (authorization.status === 'authorized') {
    return { status: 'authorized', user: authState.user, authorization };
  }

  if (authorization.status === 'checking') {
    return { status: 'checking-admin', user: authState.user, authorization };
  }

  return { status: 'unauthorized', user: authState.user, authorization };
}
