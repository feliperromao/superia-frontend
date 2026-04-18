import * as React from 'react';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import axios, { AxiosError } from 'axios';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import PauseCircleRoundedIcon from '@mui/icons-material/PauseCircleRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import AppNavbar from '../../components/AppNavbar';
import Header from '../../components/Header';
import SideMenu from '../../components/SideMenu';
import { useAuth } from '../../auth';
import { env } from '../../config/env';
import AppTheme from '../../shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../../theme/customizations';
import { useWorkspaces } from '../../workspaces';
import AgentCard from './AgentCard';
import { AGENT_STATUS } from './agent-status.enum';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

type Agent = {
  _id: string;
  workspace_id: string;
  llm_id: string;
  name: string;
  business_name: string;
  business_description: string;
  system_prompt: string;
  can_transfer_to_human: boolean;
  can_send_emojis: boolean;
  learning: boolean;
  add_history_to_context: boolean;
  temperature: number;
  status: AGENT_STATUS;
  __v: number;
};

type AgentFormState = {
  workspace_id: string;
  llm_id: string;
  name: string;
  business_name: string;
  business_description: string;
  system_prompt: string;
  can_transfer_to_human: boolean;
  can_send_emojis: boolean;
  learning: boolean;
  add_history_to_context: boolean;
  temperature: string;
};

type ApiErrorResponse = {
  message?: string | string[];
};

type AgentDialogMode = 'create' | 'edit';

type OverviewCard = {
  title: string;
  value: string;
  interval: string;
  trend: 'up' | 'down' | 'neutral';
  data: number[];
};

type LlmOption = {
  id: string;
  name: string;
  provider: string;
  modelName: string;
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 112,
  resize: 'vertical',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  backgroundColor: 'transparent',
  color: 'inherit',
  font: 'inherit',
  padding: '16.5px 14px',
  boxSizing: 'border-box',
};

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.28} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

function AgentsOverviewCard({ title, value, interval, trend, data }: OverviewCard) {
  const trendMap = {
    up: { chipColor: 'success' as const, chartColor: '#22c55e', label: '+12%' },
    down: { chipColor: 'error' as const, chartColor: '#ef4444', label: '-8%' },
    neutral: { chipColor: 'default' as const, chartColor: '#94a3b8', label: '+3%' },
  };

  const currentTrend = trendMap[trend];

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {title}
        </Typography>
        <Stack spacing={1}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">{value}</Typography>
            <Chip size="small" color={currentTrend.chipColor} label={currentTrend.label} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {interval}
          </Typography>
          <Box sx={{ width: '100%', height: 54 }}>
            <SparkLineChart
              data={data}
              area
              showHighlight
              showTooltip
              color={currentTrend.chartColor}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#agents-area-${title})`,
                },
              }}
            >
              <AreaGradient color={currentTrend.chartColor} id={`agents-area-${title}`} />
            </SparkLineChart>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function AgentsHighlightedCard({
  totalAgents,
  onCreateAgent,
}: {
  totalAgents: number;
  onCreateAgent: () => void;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <AutoAwesomeRoundedIcon />
        <Typography component="h2" variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Central de operação
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 1 }}>
          Organize criação, status e contexto dos agentes com a mesma leitura rápida do dashboard.
        </Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {totalAgents}
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={onCreateAgent}
        >
          Novo agente
        </Button>
      </CardContent>
    </Card>
  );
}

function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const apiMessage = axiosError.response?.data?.message;

  if (Array.isArray(apiMessage)) {
    return apiMessage[0] ?? fallbackMessage;
  }

  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    return apiMessage;
  }

  return fallbackMessage;
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

function getBooleanValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'boolean') {
      return value;
    }
  }

  return false;
}

function getNumberValue(record: Record<string, unknown>, keys: string[], fallback = 0.4) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsedValue = Number(value);

      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return fallback;
}

function normalizeAgentStatus(status: string) {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === AGENT_STATUS.RUNNING) {
    return AGENT_STATUS.RUNNING;
  }

  if (normalizedStatus === AGENT_STATUS.STOPPED) {
    return AGENT_STATUS.STOPPED;
  }

  return AGENT_STATUS.STARTING;
}

function normalizeAgent(item: unknown, fallbackWorkspaceId: string): Agent | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as Record<string, unknown>;
  const id = getStringValue(record, ['_id', 'id', 'agent_id']);
  const name = getStringValue(record, ['name']);

  if (!id || !name) {
    return null;
  }

  return {
    _id: id,
    workspace_id:
      getStringValue(record, ['workspace_id', 'workspaceId', 'workspace']) || fallbackWorkspaceId,
    llm_id: getStringValue(record, ['llm_id', 'llmId', 'model_id', 'modelId']),
    name,
    business_name: getStringValue(record, ['business_name', 'businessName']),
    business_description: getStringValue(record, ['business_description', 'businessDescription']),
    system_prompt: getStringValue(record, ['system_prompt', 'systemPrompt']),
    can_transfer_to_human: getBooleanValue(record, [
      'can_transfer_to_human',
      'canTransferToHuman',
    ]),
    can_send_emojis: getBooleanValue(record, ['can_send_emojis', 'canSendEmojis']),
    learning: getBooleanValue(record, ['learning']),
    add_history_to_context: getBooleanValue(record, [
      'add_history_to_context',
      'addHistoryToContext',
    ]),
    temperature: getNumberValue(record, ['temperature']),
    status: normalizeAgentStatus(getStringValue(record, ['status']) || AGENT_STATUS.STARTING),
    __v: typeof record.__v === 'number' ? record.__v : 0,
  };
}

function normalizeLlm(item: unknown): LlmOption | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as Record<string, unknown>;
  const id = getStringValue(record, ['_id', 'id']);
  const name = getStringValue(record, ['name']);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    provider: getStringValue(record, ['provider']) || 'Provider',
    modelName: getStringValue(record, ['model_name', 'modelName']) || name,
  };
}

function mapAgentToFormState(agent: Agent): AgentFormState {
  return {
    workspace_id: agent.workspace_id,
    llm_id: agent.llm_id,
    name: agent.name,
    business_name: agent.business_name,
    business_description: agent.business_description,
    system_prompt: agent.system_prompt,
    can_transfer_to_human: agent.can_transfer_to_human,
    can_send_emojis: agent.can_send_emojis,
    learning: agent.learning,
    add_history_to_context: agent.add_history_to_context,
    temperature: String(agent.temperature),
  };
}

function AgentCreateDialog({
  open,
  mode,
  formData,
  llmOptions,
  isLoadingLlms,
  submitError,
  isSubmitting,
  onClose,
  onSubmit,
  onTextChange,
  onSwitchChange,
}: {
  open: boolean;
  mode: AgentDialogMode;
  formData: AgentFormState;
  llmOptions: LlmOption[];
  isLoadingLlms: boolean;
  submitError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onTextChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onSwitchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        component: 'form',
        onSubmit: onSubmit,
        sx: (theme) => ({
          borderRadius: 5,
          backgroundImage: 'none',
          border: '1px solid',
          borderColor: alpha(theme.palette.common.white, 0.1),
          boxShadow: `0 32px 90px ${alpha(theme.palette.common.black, 0.35)}`,
        }),
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack spacing={0.75}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {mode === 'edit' ? 'Editar agente' : 'Criar novo agente'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {mode === 'edit'
              ? 'Atualize os dados principais do agente selecionado.'
              : 'Preencha os dados principais do agente para gerar um objeto no formato esperado.'}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: 'divider' }}>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {submitError ? (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error">{submitError}</Alert>
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="name">Nome do agente</FormLabel>
              <TextField
                id="name"
                name="name"
                value={formData.name}
                onChange={onTextChange}
                placeholder="My First Agent"
                required
                fullWidth
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="workspace_id">Workspace ID</FormLabel>
              <TextField
                id="workspace_id"
                name="workspace_id"
                value={formData.workspace_id}
                onChange={onTextChange}
                required
                fullWidth
                disabled
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="llm_id">Modelo de Linguagem</FormLabel>
              <TextField
                id="llm_id"
                name="llm_id"
                select
                value={formData.llm_id}
                onChange={onTextChange}
                required
                fullWidth
                disabled={isLoadingLlms || llmOptions.length === 0}
                helperText={
                  isLoadingLlms
                    ? 'Carregando modelos...'
                    : llmOptions.length === 0
                      ? 'Nenhum modelo encontrado para este workspace.'
                      : undefined
                }
              >
                {llmOptions.length === 0 ? (
                  <MenuItem value="" disabled>
                    Nenhum modelo disponível
                  </MenuItem>
                ) : null}
                {llmOptions.map((llm) => (
                  <MenuItem key={llm.id} value={llm.id}>
                    {`${llm.name} • ${llm.provider} • ${llm.modelName}`}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="business_name">Nome do negocio</FormLabel>
              <TextField
                id="business_name"
                name="business_name"
                value={formData.business_name}
                onChange={onTextChange}
                placeholder="Sas Seguros"
                required
                fullWidth
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="temperature">Temperatura</FormLabel>
              <TextField
                id="temperature"
                name="temperature"
                type="number"
                value={formData.temperature}
                onChange={onTextChange}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                required
                fullWidth
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="business_description">Descricao do negocio</FormLabel>
              <TextareaAutosize
                id="business_description"
                name="business_description"
                value={formData.business_description}
                onChange={onTextChange}
                minRows={1}
                placeholder="Empresa de seguro de vida"
                required
                style={textareaStyle}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="system_prompt">System prompt</FormLabel>
              <TextareaAutosize
                id="system_prompt"
                name="system_prompt"
                value={formData.system_prompt}
                onChange={onTextChange}
                minRows={1}
                placeholder="Voce e um vendedor de seguros..."
                required
                style={textareaStyle}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={(theme) => ({
                p: 2,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: alpha(theme.palette.background.default, 0.1),
              })}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Comportamentos do agente
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.can_transfer_to_human}
                        onChange={onSwitchChange}
                        name="can_transfer_to_human"
                      />
                    }
                    label="Pode transferir para humano"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.can_send_emojis}
                        onChange={onSwitchChange}
                        name="can_send_emojis"
                      />
                    }
                    label="Pode enviar emojis"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.learning}
                        onChange={onSwitchChange}
                        name="learning"
                      />
                    }
                    label="Aprendizado habilitado"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.add_history_to_context}
                        onChange={onSwitchChange}
                        name="add_history_to_context"
                      />
                    }
                    label="Adicionar historico ao contexto"
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <AddRoundedIcon />}
          disabled={isSubmitting}
        >
          {mode === 'edit' ? 'Salvar alterações' : 'Criar agente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const initialFormState: AgentFormState = {
  workspace_id: '',
  llm_id: '',
  name: '',
  business_name: '',
  business_description: '',
  system_prompt: '',
  can_transfer_to_human: false,
  can_send_emojis: false,
  learning: false,
  add_history_to_context: false,
  temperature: '0.4',
};

export default function Agents(props: { disableCustomTheme?: boolean }) {
  const { accessToken, logout } = useAuth();
  const { selectedWorkspaceId, selectedWorkspace, isLoading: isLoadingWorkspace } = useWorkspaces();
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [llmOptions, setLlmOptions] = React.useState<LlmOption[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<AgentDialogMode>('create');
  const [editingAgentId, setEditingAgentId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<AgentFormState>(initialFormState);
  const [isLoadingAgents, setIsLoadingAgents] = React.useState(false);
  const [isLoadingLlms, setIsLoadingLlms] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);
  const [deletingAgentId, setDeletingAgentId] = React.useState<string | null>(null);

  const resetFormState = React.useCallback(() => {
    setFormData({
      ...initialFormState,
      workspace_id: selectedWorkspaceId,
      llm_id: llmOptions[0]?.id ?? '',
    });
  }, [llmOptions, selectedWorkspaceId]);

  const fetchAgents = React.useCallback(async () => {
    if (!accessToken || !selectedWorkspaceId) {
      setAgents([]);
      setPageError(null);
      setIsLoadingAgents(false);
      return;
    }

    try {
      setIsLoadingAgents(true);
      setPageError(null);

      const response = await axios.get(
        `${env.backendApiUrl}/agents/${selectedWorkspaceId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const normalizedAgents = Array.isArray(response.data)
        ? response.data
            .map((item) => normalizeAgent(item, selectedWorkspaceId))
            .filter((item): item is Agent => item !== null)
        : [];

      setAgents(normalizedAgents);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      if (axiosError.response?.status === 401) {
        logout();
        return;
      }

      setAgents([]);
      setPageError(getApiErrorMessage(error, 'Nao foi possivel carregar os agentes.'));
    } finally {
      setIsLoadingAgents(false);
    }
  }, [accessToken, logout, selectedWorkspaceId]);

  const fetchLlms = React.useCallback(async () => {
    if (!accessToken || !selectedWorkspaceId) {
      setLlmOptions([]);
      setIsLoadingLlms(false);
      return;
    }

    try {
      setIsLoadingLlms(true);

      const response = await axios.get(`${env.backendApiUrl}/llms/${selectedWorkspaceId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const normalizedLlms = Array.isArray(response.data)
        ? response.data
            .map((item) => normalizeLlm(item))
            .filter((item): item is LlmOption => item !== null)
        : [];

      setLlmOptions(normalizedLlms);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      if (axiosError.response?.status === 401) {
        logout();
        return;
      }

      setLlmOptions([]);
      setPageError(getApiErrorMessage(error, 'Nao foi possivel carregar os modelos de linguagem.'));
    } finally {
      setIsLoadingLlms(false);
    }
  }, [accessToken, logout, selectedWorkspaceId]);

  React.useEffect(() => {
    if (!isCreateDialogOpen) {
      resetFormState();
      setSubmitError(null);
      setEditingAgentId(null);
      setDialogMode('create');
    }
  }, [isCreateDialogOpen, resetFormState]);

  React.useEffect(() => {
    void fetchAgents();
  }, [fetchAgents]);

  React.useEffect(() => {
    void fetchLlms();
  }, [fetchLlms]);

  React.useEffect(() => {
    if (
      dialogMode === 'create' &&
      isCreateDialogOpen &&
      !formData.llm_id &&
      llmOptions.length > 0
    ) {
      setFormData((current) => ({
        ...current,
        llm_id: llmOptions[0].id,
      }));
    }
  }, [dialogMode, formData.llm_id, isCreateDialogOpen, llmOptions]);

  const runningAgents = agents.filter((agent) => agent.status === AGENT_STATUS.RUNNING).length;
  const startingAgents = agents.filter((agent) => agent.status === AGENT_STATUS.STARTING).length;
  const stoppedAgents = agents.filter((agent) => agent.status === AGENT_STATUS.STOPPED).length;
  const agentsWithHumanHandoff = agents.filter((agent) => agent.can_transfer_to_human).length;
  const agentsWithHistory = agents.filter((agent) => agent.add_history_to_context).length;

  const overviewCards: OverviewCard[] = [
    {
      title: 'Agentes ativos',
      value: `${runningAgents}`,
      interval: 'Respondendo neste momento',
      trend: 'up',
      data: [4, 5, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11],
    },
    {
      title: 'Inicializando',
      value: `${startingAgents}`,
      interval: 'Preparando contexto e integrações',
      trend: 'neutral',
      data: [3, 4, 3, 4, 5, 4, 4, 5, 4, 3, 4, 4],
    },
    {
      title: 'Parados',
      value: `${stoppedAgents}`,
      interval: 'Aguardando revisão ou retorno',
      trend: 'down',
      data: [8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 3],
    },
  ];

  const statusRows = [
    {
      icon: <PlayCircleRoundedIcon fontSize="small" />,
      label: 'Rodando',
      value: runningAgents,
      color: 'success.main',
    },
    {
      icon: <AutorenewRoundedIcon fontSize="small" />,
      label: 'Inicializando',
      value: startingAgents,
      color: 'warning.main',
    },
    {
      icon: <PauseCircleRoundedIcon fontSize="small" />,
      label: 'Parados',
      value: stoppedAgents,
      color: 'error.main',
    },
  ];

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setEditingAgentId(null);
    setSubmitError(null);
    setFeedbackMessage(null);
    resetFormState();
    setIsCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (agent: Agent) => {
    setDialogMode('edit');
    setEditingAgentId(agent._id);
    setSubmitError(null);
    setFeedbackMessage(null);
    setFormData(mapAgentToFormState(agent));
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: checked,
    }));
  };

  const handleCreateOrUpdateAgent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessToken || !selectedWorkspaceId) {
      setSubmitError('Selecione um workspace valido antes de salvar o agente.');
      return;
    }

    const payload = {
      workspace_id: formData.workspace_id.trim(),
      llm_id: formData.llm_id.trim(),
      name: formData.name.trim(),
      business_name: formData.business_name.trim(),
      business_description: formData.business_description.trim(),
      system_prompt: formData.system_prompt.trim(),
      can_transfer_to_human: formData.can_transfer_to_human,
      can_send_emojis: formData.can_send_emojis,
      learning: formData.learning,
      add_history_to_context: formData.add_history_to_context,
      temperature: Number(formData.temperature),
    };

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (dialogMode === 'edit' && editingAgentId) {
        await axios.put(
          `${env.backendApiUrl}/agents/${selectedWorkspaceId}/${editingAgentId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        setFeedbackMessage('Agente atualizado com sucesso.');
      } else {
        await axios.post(`${env.backendApiUrl}/agents/${selectedWorkspaceId}`, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setFeedbackMessage('Agente criado com sucesso.');
      }

      await fetchAgents();
      handleCloseCreateDialog();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      if (axiosError.response?.status === 401) {
        logout();
        return;
      }

      setSubmitError(
        getApiErrorMessage(
          error,
          dialogMode === 'edit'
            ? 'Nao foi possivel atualizar o agente.'
            : 'Nao foi possivel criar o agente.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!accessToken || !selectedWorkspaceId) {
      setPageError('Selecione um workspace valido antes de excluir o agente.');
      return;
    }

    try {
      setDeletingAgentId(agentId);
      setFeedbackMessage(null);
      setPageError(null);

      await axios.delete(`${env.backendApiUrl}/agents/${selectedWorkspaceId}/${agentId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setFeedbackMessage('Agente removido com sucesso.');
      await fetchAgents();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      if (axiosError.response?.status === 401) {
        logout();
        return;
      }

      setPageError(getApiErrorMessage(error, 'Nao foi possivel excluir o agente.'));
    } finally {
      setDeletingAgentId(null);
    }
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            <Stack spacing={3} sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
              <Box sx={{ width: '100%' }}>
                <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                  Overview
                </Typography>
                <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
                  {overviewCards.map((card) => (
                    <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                      <AgentsOverviewCard {...card} />
                    </Grid>
                  ))}
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <AgentsHighlightedCard
                      totalAgents={agents.length}
                      onCreateAgent={handleOpenCreateDialog}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Card variant="outlined" sx={{ width: '100%' }}>
                      <CardContent>
                        <Stack
                          direction={{ xs: 'column', md: 'row' }}
                          spacing={2}
                          sx={{ justifyContent: 'space-between', mb: 3 }}
                        >
                          <Box>
                            <Typography component="h2" variant="subtitle2" gutterBottom>
                              Operação dos agentes
                            </Typography>
                            <Typography variant="h4" sx={{ mb: 0.5 }}>
                              {runningAgents}/{agents.length}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Agentes com operação ativa em relação ao total monitorado.
                            </Typography>
                          </Box>
                          <Chip
                            icon={<SmartToyRoundedIcon />}
                            label={`${agentsWithHumanHandoff} com transferência humana`}
                            variant="outlined"
                          />
                        </Stack>
                        {feedbackMessage ? (
                          <Alert severity="success" sx={{ mb: 2 }}>
                            {feedbackMessage}
                          </Alert>
                        ) : null}
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'background.default' }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Histórico em contexto
                              </Typography>
                              <Typography variant="h5" sx={{ mt: 0.5 }}>
                                {agentsWithHistory}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'background.default' }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Sem emojis
                              </Typography>
                              <Typography variant="h5" sx={{ mt: 0.5 }}>
                                {agents.filter((agent) => !agent.can_send_emojis).length}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'background.default' }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Em aprendizado
                              </Typography>
                              <Typography variant="h5" sx={{ mt: 0.5 }}>
                                {agents.filter((agent) => agent.learning).length}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined" sx={{ width: '100%' }}>
                      <CardContent>
                        <Typography component="h2" variant="subtitle2" gutterBottom>
                          Distribuição de status
                        </Typography>
                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                          {statusRows.map((item) => (
                            <Stack
                              key={item.label}
                              direction="row"
                              spacing={1.5}
                              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                            >
                              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                                <Box sx={{ color: item.color, display: 'flex' }}>{item.icon}</Box>
                                <Typography variant="body2">{item.label}</Typography>
                              </Stack>
                              <Chip label={item.value} size="small" variant="outlined" />
                            </Stack>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                  Details
                </Typography>
                <Grid container spacing={2} columns={12}>
                  <Grid size={{ xs: 12, lg: 9 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1}
                          sx={{
                            justifyContent: 'space-between',
                            alignItems: { sm: 'center' },
                            mb: 2.5,
                          }}
                        >
                          <Box>
                            <Typography component="h3" variant="subtitle2">
                              Listagem de agentes
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                              Cards com status, contexto e acesso rápido para manutenção.
                            </Typography>
                          </Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                          >
                            {isLoadingAgents ? <CircularProgress size={20} /> : null}
                            <Chip
                              label={`${runningAgents} ativos agora`}
                              color="success"
                              variant="outlined"
                            />
                          </Stack>
                        </Stack>
                        {pageError ? (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            {pageError}
                          </Alert>
                        ) : null}
                        {!selectedWorkspaceId && !isLoadingWorkspace ? (
                          <Alert severity="info">Selecione um workspace para visualizar os agentes.</Alert>
                        ) : null}
                        {selectedWorkspaceId && !isLoadingAgents && agents.length === 0 && !pageError ? (
                          <Alert severity="info">Nenhum agente encontrado para este workspace.</Alert>
                        ) : null}
                        <Grid container spacing={2}>
                          {agents.map((agent) => (
                            <AgentCard
                              key={agent._id}
                              data={{
                                id: agent._id,
                                name: agent.name,
                                status: agent.status,
                              }}
                              isDeleting={deletingAgentId === agent._id}
                              onEdit={() => handleOpenEditDialog(agent)}
                              onDelete={() => void handleDeleteAgent(agent._id)}
                            />
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, lg: 3 }}>
                    <Stack gap={2}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography component="h3" variant="subtitle2" gutterBottom>
                            Próximas ações
                          </Typography>
                          <Stack spacing={1.5} sx={{ mt: 2 }}>
                            <Box>
                              <Typography variant="body2">Revisar agentes parados</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {stoppedAgents} aguardando reativação ou ajuste fino.
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2">Validar prompts em startup</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {startingAgents} carregando contexto inicial agora.
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2">Padronizar histórico</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {agents.length - agentsWithHistory} ainda sem contexto persistente.
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography component="h3" variant="subtitle2" gutterBottom>
                            Resumo rápido
                          </Typography>
                          <Stack spacing={1.25} sx={{ mt: 2 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Workspace principal
                            </Typography>
                            <Typography variant="body1">
                              {selectedWorkspace?.name ?? agents[0]?.workspace_id ?? '--'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', pt: 1 }}>
                              Modelo base
                            </Typography>
                            <Typography variant="body1">
                              {llmOptions.find((llm) => llm.id === agents[0]?.llm_id)?.name ??
                                agents[0]?.llm_id ??
                                '--'}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Box>
      <AgentCreateDialog
        open={isCreateDialogOpen}
        mode={dialogMode}
        formData={formData}
        llmOptions={llmOptions}
        isLoadingLlms={isLoadingLlms}
        submitError={submitError}
        isSubmitting={isSubmitting}
        onClose={handleCloseCreateDialog}
        onSubmit={(event) => {
          void handleCreateOrUpdateAgent(event);
        }}
        onTextChange={handleTextChange}
        onSwitchChange={handleSwitchChange}
      />
    </AppTheme>
  );
}
