import * as React from 'react';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import PauseCircleRoundedIcon from '@mui/icons-material/PauseCircleRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { AGENT_STATUS } from './agent-status.enum';

type AgentCardProps = {
  data: {
    id: string;
    name: string;
    status: AGENT_STATUS;
  };
  isDeleting?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

const agentStatusMap = {
  [AGENT_STATUS.RUNNING]: {
    label: 'Em execução',
    helperText: 'Atendendo fluxos e pronto para novas tarefas.',
    color: 'success' as const,
    accent: '#22c55e',
    icon: <PlayCircleRoundedIcon fontSize="small" />,
  },
  [AGENT_STATUS.STOPPED]: {
    label: 'Parado',
    helperText: 'Necessita ação manual para voltar à operação.',
    color: 'error' as const,
    accent: '#ef4444',
    icon: <PauseCircleRoundedIcon fontSize="small" />,
  },
  [AGENT_STATUS.STARTING]: {
    label: 'Inicializando',
    helperText: 'Carregando contexto e preparando recursos.',
    color: 'warning' as const,
    accent: '#f59e0b',
    icon: <AutorenewRoundedIcon fontSize="small" />,
  },
};

export default function AgentCard({
  data,
  isDeleting = false,
  onEdit,
  onDelete,
}: AgentCardProps) {
  const status = agentStatusMap[data.status];

  return (
    <Grid size={{ xs: 12, sm: 6, xl: 6 }}>
      <Card
        variant="outlined"
        sx={(theme) => ({
          height: '100%',
          transition: 'border-color 160ms ease, box-shadow 160ms ease',
          '&:hover': {
            borderColor: alpha(status.accent, 0.34),
            boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, 0.12)}`,
          },
        })}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <Box
                sx={(theme) => ({
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                })}
              >
                <SmartToyRoundedIcon />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, letterSpacing: '-0.02em', pr: 1 }}
                  >
                    {data.name}
                  </Typography>
                  <Chip
                    icon={status.icon}
                    label={status.label}
                    color={status.color}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  ID interno: {data.id}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Status atual
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.75 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: status.accent,
                      boxShadow: `0 0 0 4px ${alpha(status.accent, 0.16)}`,
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {status.label}
                  </Typography>
                </Stack>
              </Box>
              <Box sx={{ minWidth: 0, flexBasis: '55%' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Contexto
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
                  {status.helperText}
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'background.default' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: alpha(status.accent, 0.12),
                    color: status.accent,
                  }}
                >
                  <BoltRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Atividade recente
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Última atualização há poucos instantes.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <Button
                variant="contained"
                startIcon={<EditRoundedIcon />}
                sx={{ flex: 1, minHeight: 42, borderRadius: 3 }}
                onClick={onEdit}
              >
                Editar agente
              </Button>
              <Button
                variant="text"
                startIcon={<DeleteRoundedIcon />}
                sx={{ minHeight: 42, borderRadius: 3 }}
                color="error"
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
}
