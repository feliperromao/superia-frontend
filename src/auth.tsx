import * as React from 'react';
import axios from 'axios';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { env } from './config/env';

const ACCESS_TOKEN_STORAGE_KEY = 'access_token';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoadingUser: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function getStoredToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

function setStoredToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

function clearStoredToken() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

function getStringValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function normalizeAuthUser(data: unknown): AuthUser | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;
  const name =
    getStringValue(record, ['name', 'fullName', 'full_name']) ||
    [getStringValue(record, ['firstName', 'first_name']), getStringValue(record, ['lastName', 'last_name'])]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    'Usuario';
  const email = getStringValue(record, ['email']);

  return {
    id: getStringValue(record, ['id', '_id', 'userId', 'user_id']) || email || name,
    name,
    email: email || 'Sem email',
    avatarUrl: getStringValue(record, ['avatarUrl', 'avatar_url', 'photoUrl', 'photo_url', 'imageUrl', 'image_url']) || null,
  };
}

async function fetchCurrentUser(token: string) {
  const response = await axios.get(`${env.backendApiUrl}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return normalizeAuthUser(response.data);
}

function AuthLoadingScreen() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body1">Validando sessao...</Typography>
    </Box>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingUser, setIsLoadingUser] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const token = getStoredToken();

      if (!token) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await fetchCurrentUser(token);

        if (isMounted) {
          setAccessToken(token);
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        clearStoredToken();

        if (isMounted) {
          setAccessToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = React.useCallback((token: string) => {
    setStoredToken(token);
    setAccessToken(token);
    setIsAuthenticated(true);
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      if (!accessToken || !isAuthenticated) {
        if (isMounted) {
          setUser(null);
          setIsLoadingUser(false);
        }
        return;
      }

      if (user) {
        if (isMounted) {
          setIsLoadingUser(false);
        }
        return;
      }

      try {
        setIsLoadingUser(true);
        const currentUser = await fetchCurrentUser(accessToken);

        if (isMounted) {
          setUser(currentUser);
        }
      } catch (error) {
        clearStoredToken();

        if (isMounted) {
          setAccessToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      }
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [accessToken, isAuthenticated, user]);

  const logout = React.useCallback(() => {
    clearStoredToken();
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsLoadingUser(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated,
        isLoading,
        isLoadingUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children ?? <Outlet />}</>;
}

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
