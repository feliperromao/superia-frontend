import * as React from 'react';
import axios, { AxiosError } from 'axios';
import { env } from './config/env';
import { useAuth } from './auth';

const SELECTED_WORKSPACE_STORAGE_KEY = 'selected_workspace_id';

export type Workspace = {
  id: string;
  name: string;
  secondaryLabel: string;
};

type WorkspaceApiResponseItem = {
  _id: string;
  name: string;
};

type WorkspaceContextValue = {
  workspaces: Workspace[];
  selectedWorkspaceId: string;
  selectedWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
  setSelectedWorkspaceId: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
};

const WorkspaceContext = React.createContext<WorkspaceContextValue | undefined>(undefined);

function getStoredWorkspaceId() {
  return localStorage.getItem(SELECTED_WORKSPACE_STORAGE_KEY) ?? '';
}

function setStoredWorkspaceId(workspaceId: string) {
  localStorage.setItem(SELECTED_WORKSPACE_STORAGE_KEY, workspaceId);
}

function clearStoredWorkspaceId() {
  localStorage.removeItem(SELECTED_WORKSPACE_STORAGE_KEY);
}

function isWorkspaceApiResponseItem(item: unknown): item is WorkspaceApiResponseItem {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const candidate = item as Record<string, unknown>;

  return typeof candidate._id === 'string' && typeof candidate.name === 'string';
}

function normalizeWorkspace(item: WorkspaceApiResponseItem): Workspace {
  const name = item.name.trim() || 'Workspace';
  return {
    id: item._id,
    name,
    secondaryLabel: name,
  };
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, logout } = useAuth();
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceIdState] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const setSelectedWorkspaceId = React.useCallback((workspaceId: string) => {
    setSelectedWorkspaceIdState(workspaceId);

    if (workspaceId) {
      setStoredWorkspaceId(workspaceId);
      return;
    }

    clearStoredWorkspaceId();
  }, []);

  const refreshWorkspaces = React.useCallback(async () => {
    if (!accessToken) {
      setWorkspaces([]);
      setSelectedWorkspaceId('');
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`${env.backendApiUrl}/workspaces`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const normalizedWorkspaces = Array.isArray(response.data)
        ? response.data
            .filter(isWorkspaceApiResponseItem)
            .map(normalizeWorkspace)
        : [];

      setWorkspaces(normalizedWorkspaces);

      const storedWorkspaceId = getStoredWorkspaceId();
      const nextWorkspaceId =
        normalizedWorkspaces.find((workspace) => workspace.id === storedWorkspaceId)?.id ??
        normalizedWorkspaces[0]?.id ??
        '';

      setSelectedWorkspaceId(nextWorkspaceId);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string | string[] }>;

      if (axiosError.response?.status === 401) {
        logout();
        return;
      }

      setWorkspaces([]);
      setSelectedWorkspaceId('');
      setError('Nao foi possivel carregar os workspaces.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, logout, setSelectedWorkspaceId]);

  React.useEffect(() => {
    void refreshWorkspaces();
  }, [refreshWorkspaces]);

  const selectedWorkspace =
    workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? null;

  const value = React.useMemo(
    () => ({
      workspaces,
      selectedWorkspaceId,
      selectedWorkspace,
      isLoading,
      error,
      setSelectedWorkspaceId,
      refreshWorkspaces,
    }),
    [
      error,
      isLoading,
      refreshWorkspaces,
      selectedWorkspace,
      selectedWorkspaceId,
      setSelectedWorkspaceId,
      workspaces,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaces() {
  const context = React.useContext(WorkspaceContext);

  if (!context) {
    throw new Error('useWorkspaces must be used within WorkspaceProvider');
  }

  return context;
}
