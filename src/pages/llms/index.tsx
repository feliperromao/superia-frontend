import * as React from 'react';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import axios, { AxiosError } from 'axios';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
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
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
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
import LlmCard from './LlmCard';
import {
  getModelOptionsByProvider,
  getProviderLabel,
  LLM_PROVIDER_CATALOG,
} from './llm-catalog';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

type Llm = {
  id: string;
  name: string;
  provider: string;
  model_name: string;
  api_key: string;
};

type LlmFormState = {
  name: string;
  provider: string;
  model_name: string;
  api_key: string;
};

type ApiErrorResponse = {
  message?: string | string[];
};

type LlmDialogMode = 'create' | 'edit';

const initialFormState: LlmFormState = {
  name: '',
  provider: LLM_PROVIDER_CATALOG[0]?.value ?? '',
  model_name: LLM_PROVIDER_CATALOG[0]?.models[0]?.value ?? '',
  api_key: '',
};

function getProviderOptions(currentProvider?: string) {
  if (!currentProvider) {
    return LLM_PROVIDER_CATALOG;
  }

  const hasCurrentProvider = LLM_PROVIDER_CATALOG.some(
    (provider) => provider.value === currentProvider,
  );

  if (hasCurrentProvider) {
    return LLM_PROVIDER_CATALOG;
  }

  return [
    {
      value: currentProvider,
      label: `${currentProvider} (atual)`,
      models: [],
    },
    ...LLM_PROVIDER_CATALOG,
  ];
}

function getFormModelOptions(provider: string, currentModelName?: string) {
  const providerModels = getModelOptionsByProvider(provider);

  if (!currentModelName) {
    return providerModels;
  }

  const hasCurrentModel = providerModels.some((model) => model.value === currentModelName);

  if (hasCurrentModel) {
    return providerModels;
  }

  return [
    { value: currentModelName, label: `${currentModelName} (atual)` },
    ...providerModels,
  ];
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

function normalizeLlm(item: unknown): Llm | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as Record<string, unknown>;
  const id = getStringValue(record, ['_id', 'id', 'llm_id']);
  const name = getStringValue(record, ['name']);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    provider: getStringValue(record, ['provider']) || 'OPENAI',
    model_name: getStringValue(record, ['model_name', 'modelName']) || name,
    api_key: getStringValue(record, ['api_key', 'apiKey']),
  };
}

function mapLlmToFormState(llm: Llm): LlmFormState {
  return {
    name: llm.name,
    provider: llm.provider,
    model_name: llm.model_name,
    api_key: llm.api_key,
  };
}

function LlmCreateDialog({
  open,
  mode,
  formData,
  submitError,
  isSubmitting,
  onClose,
  onSubmit,
  onTextChange,
}: {
  open: boolean;
  mode: LlmDialogMode;
  formData: LlmFormState;
  submitError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onTextChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
  const providerOptions = getProviderOptions(formData.provider);
  const modelOptions = getFormModelOptions(formData.provider, formData.model_name);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        component: 'form',
        onSubmit,
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
            {mode === 'edit' ? 'Editar LLM' : 'Cadastrar novo LLM'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {mode === 'edit'
              ? 'Atualize provider, modelo e credencial deste LLM.'
              : 'Crie uma nova configuração para uso pelos agentes do workspace.'}
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
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="name">Nome</FormLabel>
              <TextField
                id="name"
                name="name"
                value={formData.name}
                onChange={onTextChange}
                placeholder="Gemini fast 2"
                required
                fullWidth
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="provider">Provider</FormLabel>
              <TextField
                id="provider"
                name="provider"
                select
                value={formData.provider}
                onChange={onTextChange}
                required
                fullWidth
              >
                {providerOptions.map((provider) => (
                  <MenuItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="model_name">Modelo</FormLabel>
              <TextField
                id="model_name"
                name="model_name"
                select
                value={formData.model_name}
                onChange={onTextChange}
                required
                fullWidth
              >
                {modelOptions.map((model) => (
                  <MenuItem key={model.value} value={model.value}>
                    {model.label}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <FormLabel htmlFor="api_key">API Key</FormLabel>
              <TextField
                id="api_key"
                name="api_key"
                type="password"
                value={formData.api_key}
                onChange={onTextChange}
                placeholder="any_api_key"
                required
                fullWidth
              />
            </FormControl>
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
          {mode === 'edit' ? 'Salvar alterações' : 'Cadastrar LLM'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Llms(props: { disableCustomTheme?: boolean }) {
  const { accessToken, logout } = useAuth();
  const { selectedWorkspaceId, selectedWorkspace, isLoading: isLoadingWorkspace } = useWorkspaces();
  const [llms, setLlms] = React.useState<Llm[]>([]);
  const [isLoadingLlms, setIsLoadingLlms] = React.useState(false);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<LlmDialogMode>('create');
  const [editingLlmId, setEditingLlmId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<LlmFormState>(initialFormState);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deletingLlmId, setDeletingLlmId] = React.useState<string | null>(null);

  const resetFormState = React.useCallback(() => {
    setFormData({
      ...initialFormState,
      provider: LLM_PROVIDER_CATALOG[0]?.value ?? '',
      model_name: LLM_PROVIDER_CATALOG[0]?.models[0]?.value ?? '',
    });
  }, []);

  const fetchLlms = React.useCallback(async () => {
    if (!accessToken || !selectedWorkspaceId) {
      setLlms([]);
      setPageError(null);
      setIsLoadingLlms(false);
      return;
    }

    try {
      setIsLoadingLlms(true);
      setPageError(null);

      const response = await axios.get(`${env.backendApiUrl}/llms/${selectedWorkspaceId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const normalizedLlms = Array.isArray(response.data)
        ? response.data
            .map((item) => normalizeLlm(item))
            .filter((item): item is Llm => item !== null)
        : [];

      setLlms(normalizedLlms);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      if (axiosError.response?.status === 401) {
        logout();
        return;
      }

      setLlms([]);
      setPageError(getApiErrorMessage(error, 'Nao foi possivel carregar os Modelos.'));
    } finally {
      setIsLoadingLlms(false);
    }
  }, [accessToken, logout, selectedWorkspaceId]);

  React.useEffect(() => {
    void fetchLlms();
  }, [fetchLlms]);

  React.useEffect(() => {
    if (!isDialogOpen) {
      resetFormState();
      setDialogMode('create');
      setEditingLlmId(null);
      setSubmitError(null);
    }
  }, [isDialogOpen, resetFormState]);

  const providerModels = React.useMemo(
    () => getFormModelOptions(formData.provider, formData.model_name),
    [formData.model_name, formData.provider],
  );

  React.useEffect(() => {
    if (providerModels.length === 0) {
      return;
    }

    const hasCurrentModel = providerModels.some((model) => model.value === formData.model_name);

    if (!hasCurrentModel) {
      setFormData((current) => ({
        ...current,
        model_name: providerModels[0].value,
      }));
    }
  }, [formData.model_name, providerModels]);

  const providerCount = new Set(llms.map((llm) => llm.provider)).size;
  const primaryProvider = llms.reduce<Record<string, number>>((acc, llm) => {
    acc[llm.provider] = (acc[llm.provider] ?? 0) + 1;
    return acc;
  }, {});
  const topProviderEntry = Object.entries(primaryProvider).sort((a, b) => b[1] - a[1])[0];
  const topProviderLabel = topProviderEntry ? getProviderLabel(topProviderEntry[0]) : '--';

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setEditingLlmId(null);
    setSubmitError(null);
    setFeedbackMessage(null);
    resetFormState();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (llm: Llm) => {
    setDialogMode('edit');
    setEditingLlmId(llm.id);
    setSubmitError(null);
    setFeedbackMessage(null);
    setFormData(mapLlmToFormState(llm));
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    setFormData((current) => {
      if (name === 'provider') {
        const nextModels = getModelOptionsByProvider(value);

        return {
          ...current,
          provider: value,
          model_name: nextModels[0]?.value ?? '',
        };
      }

      return {
        ...current,
        [name]: value,
      };
    });
  };

  const handleCreateOrUpdateLlm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessToken || !selectedWorkspaceId) {
      setSubmitError('Selecione um workspace valido antes de salvar o LLM.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      provider: formData.provider.trim(),
      model_name: formData.model_name.trim(),
      api_key: formData.api_key.trim(),
    };

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (dialogMode === 'edit' && editingLlmId) {
        await axios.put(`${env.backendApiUrl}/llms/${selectedWorkspaceId}/${editingLlmId}`, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setFeedbackMessage('LLM atualizado com sucesso.');
      } else {
        await axios.post(`${env.backendApiUrl}/llms/${selectedWorkspaceId}`, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setFeedbackMessage('LLM criado com sucesso.');
      }

      await fetchLlms();
      handleCloseDialog();
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
            ? 'Nao foi possivel atualizar o LLM.'
            : 'Nao foi possivel criar o LLM.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLlm = async (llmId: string) => {
    if (!accessToken || !selectedWorkspaceId) {
      setPageError('Selecione um workspace valido antes de excluir o LLM.');
      return;
    }

    try {
      setDeletingLlmId(llmId);
      setFeedbackMessage(null);
      setPageError(null);

      await axios.delete(`${env.backendApiUrl}/llms/${selectedWorkspaceId}/${llmId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setFeedbackMessage('LLM removido com sucesso.');
      await fetchLlms();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      if (axiosError.response?.status === 401) {
        logout();
        return;
      }

      setPageError(getApiErrorMessage(error, 'Nao foi possivel excluir o LLM.'));
    } finally {
      setDeletingLlmId(null);
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
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Stack spacing={1.5}>
                          <LayersRoundedIcon color="primary" />
                          <Typography variant="subtitle2">Modelos cadastrados</Typography>
                          <Typography variant="h4">{llms.length}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Modelos prontos para uso neste workspace.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Stack spacing={1.5}>
                          <HubRoundedIcon color="primary" />
                          <Typography variant="subtitle2">Providers ativos</Typography>
                          <Typography variant="h4">{providerCount}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Quantidade de provedores diferentes em uso.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Stack spacing={1.5}>
                          <KeyRoundedIcon color="primary" />
                          <Typography variant="subtitle2">Credenciais</Typography>
                          <Typography variant="h4">{llms.length}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Todas as entradas possuem chave de API associada.
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <AutoAwesomeRoundedIcon />
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                          Central de modelos
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', mb: 1 }}>
                          Crie e mantenha os LLMs usados pelos agentes.
                        </Typography>
                        <Typography variant="h4" sx={{ mb: 2 }}>
                          {topProviderLabel}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AddRoundedIcon />}
                          onClick={handleOpenCreateDialog}
                        >
                          Novo LLM
                        </Button>
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
                              Listagem de Modelos
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                              Edite provider, modelo e credencial sem sair da operação do workspace.
                            </Typography>
                          </Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                          >
                            {isLoadingLlms ? <CircularProgress size={20} /> : null}
                            <Chip
                              label={`${providerCount} providers`}
                              color="primary"
                              variant="outlined"
                            />
                          </Stack>
                        </Stack>
                        {feedbackMessage ? (
                          <Alert severity="success" sx={{ mb: 2 }}>
                            {feedbackMessage}
                          </Alert>
                        ) : null}
                        {pageError ? (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            {pageError}
                          </Alert>
                        ) : null}
                        {!selectedWorkspaceId && !isLoadingWorkspace ? (
                          <Alert severity="info">Selecione um workspace para visualizar os LLMs.</Alert>
                        ) : null}
                        {selectedWorkspaceId && !isLoadingLlms && llms.length === 0 && !pageError ? (
                          <Alert severity="info">Nenhum LLM encontrado para este workspace.</Alert>
                        ) : null}
                        <Grid container spacing={2}>
                          {llms.map((llm) => (
                            <LlmCard
                              key={llm.id}
                              data={{
                                id: llm.id,
                                name: llm.name,
                                providerLabel: getProviderLabel(llm.provider),
                                modelName: llm.model_name,
                              }}
                              isDeleting={deletingLlmId === llm.id}
                              onEdit={() => handleOpenEditDialog(llm)}
                              onDelete={() => void handleDeleteLlm(llm.id)}
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
                            Catálogo local
                          </Typography>
                          <Stack spacing={1.5} sx={{ mt: 2 }}>
                            <Box>
                              <Typography variant="body2">Arquivo de manutenção</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                `src/pages/llms/llm-catalog.ts`
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2">Providers disponíveis</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {LLM_PROVIDER_CATALOG.length} opções prontas para editar.
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2">Modelo por provider</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                A lista do campo modelo muda automaticamente conforme o provider.
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
                              {selectedWorkspace?.name ?? '--'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', pt: 1 }}>
                              Provider mais usado
                            </Typography>
                            <Typography variant="body1">{topProviderLabel}</Typography>
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
      <LlmCreateDialog
        open={isDialogOpen}
        mode={dialogMode}
        formData={formData}
        submitError={submitError}
        isSubmitting={isSubmitting}
        onClose={handleCloseDialog}
        onSubmit={(event) => {
          void handleCreateOrUpdateLlm(event);
        }}
        onTextChange={handleTextChange}
      />
    </AppTheme>
  );
}
