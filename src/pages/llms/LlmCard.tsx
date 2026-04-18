import * as React from 'react';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

type LlmCardProps = {
  data: {
    id: string;
    name: string;
    providerLabel: string;
    modelName: string;
  };
  isDeleting?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function LlmCard({
  data,
  isDeleting = false,
  onEdit,
  onDelete,
}: LlmCardProps) {
  return (
    <Grid size={{ xs: 12, md: 6, xl: 4 }}>
      <Card
        variant="outlined"
        sx={(theme) => ({
          height: '100%',
          transition: 'border-color 160ms ease, box-shadow 160ms ease',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.34),
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
                <DnsRoundedIcon />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, pr: 1 }}>
                    {data.name}
                  </Typography>
                  <Chip label={data.providerLabel} size="small" color="primary" variant="outlined" />
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  ID interno: {data.id}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'background.default' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Modelo configurado
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.75, fontWeight: 600 }}>
                {data.modelName}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box
                sx={(theme) => ({
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  color: 'success.main',
                })}
              >
                <KeyRoundedIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Chave de API configurada para este modelo.
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <Button
                variant="contained"
                startIcon={<EditRoundedIcon />}
                sx={{ flex: 1, minHeight: 42, borderRadius: 3 }}
                onClick={onEdit}
              >
                Editar modelo
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
