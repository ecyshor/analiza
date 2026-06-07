import React from 'react';

// Mocked Auth0 Hook
export function useAuth0() {
  return {
    isAuthenticated: true,
    isLoading: false,
    user: {
      name: 'E2E User',
      email: 'test@analiza.dev',
      sub: 'e2e-test-user'
    },
    loginWithRedirect: () => {},
    logout: () => {
      window.location.href = '/login';
    },
    getAccessTokenSilently: async () => {
      // Return the dummy HS256 token signed with "super_secret_jwt_token_for_e2e_tests_which_must_be_32_chars"
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMmUtdGVzdC11c2VyIiwiZW1haWwiOiJ0ZXN0QGFuYWxpemEuZGV2IiwiaHR0cHM6Ly9hbmFsaXphLmRldi9yb2xlIjoiYW5hbGl6YSIsImh0dHBzOi8vYW5hbGl6YS5kZXYvdXNlciI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCIsImlhdCI6MTc4MDg3MTQ3OSwiZXhwIjoyMDk2NDQ3NDc5fQ.HmnoSly4jvi7C4S0XKMacmC0pA1FKwXZZB1onwFrBVc';
    },
    getIdTokenClaims: async () => {
      return {
        __raw: 'dummy_id_token',
        'metabase/jwt': 'dummy_metabase_jwt'
      };
    }
  };
}

// Mocked Auth0 Provider
export function Auth0Provider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
