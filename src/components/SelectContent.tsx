import * as React from 'react';
import Box from '@mui/material/Box';
import MuiAvatar from '@mui/material/Avatar';
import MuiListItemAvatar from '@mui/material/ListItemAvatar';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Select, { SelectChangeEvent, selectClasses } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import AttachMoneyRounded from '@mui/icons-material/AttachMoneyRounded';
import { useWorkspaces, Workspace } from '../workspaces';
import { brand, gray } from '../shared-theme/themePrimitives';

const Avatar = styled(MuiAvatar)(({ theme }) => ({
  width: 34,
  height: 34,
  backgroundColor: alpha(brand[400], 0.12),
  color: (theme.vars || theme).palette.primary.main,
  border: `1px solid ${alpha(brand[300], 0.2)}`,
}));

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 12,
});

export default function SelectWorkspace() {
  const {
    workspaces,
    selectedWorkspaceId,
    selectedWorkspace,
    isLoading,
    error,
    setSelectedWorkspaceId,
  } = useWorkspaces();

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedWorkspaceId(event.target.value as string);
  };

  const renderWorkspace = React.useCallback((workspace: Workspace | null, fallbackLabel: string) => (
    <>
      <ListItemAvatar>
        <Avatar alt={workspace?.name ?? fallbackLabel}>
          <AttachMoneyRounded sx={{ fontSize: '1rem' }} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={workspace?.name ?? fallbackLabel}
        secondary={workspace?.secondaryLabel ?? fallbackLabel}
        primaryTypographyProps={{
          fontSize: 14,
          fontWeight: 700,
        }}
        secondaryTypographyProps={{
          fontSize: 12,
          color: 'text.secondary',
        }}
      />
    </>
  ), []);

  const renderValue = React.useCallback(
    (selected: string) => {
      if (isLoading) {
        return renderWorkspace(null, 'Carregando workspaces...');
      }

      if (selectedWorkspace) {
        return renderWorkspace(selectedWorkspace, selectedWorkspace.name);
      }

      if (!workspaces.length) {
        return renderWorkspace(null, 'Nenhum workspace');
      }

      const workspace = workspaces.find((item) => item.id === selected) ?? null;
      return renderWorkspace(workspace, 'Selecionar workspace');
    },
    [isLoading, renderWorkspace, selectedWorkspace, workspaces],
  );

  return (
    <Box
      sx={{
        width: '100%',
        px: 1,
        py: 1.25,
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(brand[400], 0.16),
        background: `linear-gradient(180deg, ${alpha(gray[500], 0.08)} 0%, ${alpha(gray[900], 0)} 100%)`,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          px: 0.5,
          pb: 1,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontWeight: 700,
        }}
      >
        Workspace ativo
      </Typography>
      <Select
        labelId="company-select"
        id="company-simple-select"
        value={selectedWorkspaceId}
        onChange={handleChange}
        displayEmpty
        renderValue={renderValue}
        inputProps={{ 'aria-label': 'Select company' }}
        fullWidth
        disabled={isLoading || workspaces.length === 0}
        sx={{
          minHeight: 64,
          width: '100%',
          borderRadius: 3,
          borderColor: alpha(brand[400], 0.12),
          backgroundColor: alpha(gray[500], 0.06),
          '&.MuiList-root': {
            p: '8px',
          },
          [`& .${selectClasses.select}`]: {
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            px: 1.25,
            py: 1,
          },
          [`& .${selectClasses.icon}`]: {
            right: 14,
            color: 'text.secondary',
          },
          '&:hover': {
            backgroundColor: alpha(gray[500], 0.1),
            borderColor: alpha(brand[400], 0.2),
          },
        }}
      >
        <ListSubheader sx={{ pt: 0 }}>Workspaces</ListSubheader>
        {error ? (
          <MenuItem value="" disabled>
            <ListItemText
              primary="Erro ao carregar"
              secondary={error}
            />
          </MenuItem>
        ) : null}
        {!error && !isLoading && workspaces.length === 0 ? (
          <MenuItem value="" disabled>
            <ListItemText
              primary="Nenhum workspace encontrado"
              secondary="Sua conta ainda nao possui workspaces."
            />
          </MenuItem>
        ) : null}
        {workspaces.map((workspace) => (
          <MenuItem key={workspace.id} value={workspace.id}>
            {renderWorkspace(workspace, workspace.name)}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
