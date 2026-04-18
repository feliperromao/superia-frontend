import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import {
  WhatsApp,
  Speed,
  SettingsRounded,
  AccountBoxOutlined,
  FormatAlignLeft,
  Groups3,
  Assistant,
} from '@mui/icons-material';
import { brand, gray } from '../shared-theme/themePrimitives';

const mainListItems = [
  { text: 'Dashboard', icon: <Speed />, path: '/', hint: 'Visao geral' },
  { text: 'Agentes', icon: <Assistant />, path: '/agents', hint: 'Operacao ativa' },
  { text: 'Canais', icon: <WhatsApp />, path: '/channels', hint: 'Conversas' },
  { text: 'Contatos', icon: <AccountBoxOutlined />, path: '/contacts', hint: 'Base ativa' },
  { text: 'Equipes', icon: <Groups3 />, path: '/teams', hint: 'Permissoes' },
  { text: 'Envio em massa', icon: <FormatAlignLeft />, path: '/mass-sending', hint: 'Campanhas' },
];

const secondaryListItems = [
  { text: 'Configurações', icon: <SettingsRounded />, path: '/settings' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="caption"
      sx={{
        px: 1.5,
        pb: 1,
        color: 'text.secondary',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        fontWeight: 700,
      }}
    >
      {children}
    </Typography>
  );
}

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const renderNavList = React.useCallback(
    (
      items: Array<{
        text: string;
        icon: React.ReactNode;
        path: string;
        hint?: string;
        badge?: string;
      }>,
    ) => (
      <List dense disablePadding sx={{ display: 'grid', gap: 0.75 }}>
        {items.map((item) => {
          const isSelected = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 52,
                  px: 1.25,
                  borderRadius: 3,
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: isSelected ? alpha(brand[300], 0.4) : 'transparent',
                  backgroundColor: isSelected ? alpha(brand[700], 0.32) : 'transparent',
                  boxShadow: isSelected
                    ? `inset 0 1px 0 ${alpha(brand[200], 0.12)}, 0 0 0 1px ${alpha(brand[500], 0.12)}`
                    : 'none',
                  transition: 'all 160ms ease',
                  '&:hover': {
                    borderColor: isSelected ? alpha(brand[300], 0.48) : alpha(brand[400], 0.18),
                    backgroundColor: isSelected
                      ? alpha(brand[700], 0.42)
                      : alpha(gray[500], 0.08),
                  },
                  '&.Mui-selected': {
                    backgroundColor: alpha(brand[700], 0.32),
                    '&:hover': {
                      backgroundColor: alpha(brand[700], 0.42),
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    '& svg': {
                      fontSize: '1.1rem',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: 2,
                      display: 'grid',
                      placeItems: 'center',
                      backgroundColor: isSelected
                        ? alpha(brand[300], 0.18)
                        : alpha(gray[500], 0.08),
                      border: '1px solid',
                      borderColor: isSelected
                        ? alpha(brand[200], 0.18)
                        : alpha(gray[500], 0.12),
                    }}
                  >
                    {item.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  secondary={item.hint}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? 'primary.contrastText' : 'text.secondary',
                  }}
                  secondaryTypographyProps={{
                    fontSize: 11,
                    sx: {
                      mt: 0.25,
                      color: isSelected ? alpha(brand[50], 0.72) : 'text.disabled',
                    },
                  }}
                />
                {item.badge ? (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 999,
                      backgroundColor: isSelected
                        ? alpha(brand[300], 0.24)
                        : alpha(gray[500], 0.12),
                      color: isSelected ? 'primary.contrastText' : 'text.secondary',
                      '& .MuiChip-label': {
                        px: 1,
                      },
                    }}
                  />
                ) : null}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    ),
    [location.pathname, navigate],
  );

  return (
    <Stack sx={{ flexGrow: 1, px: 1.5, py: 2, justifyContent: 'space-between' }}>
      <Stack spacing={2}>
        <Box>
          <SectionLabel>Principal</SectionLabel>
          {renderNavList(mainListItems)}
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Divider sx={{ borderColor: alpha(gray[500], 0.14) }} />
        <Box>
          <SectionLabel>Sistema</SectionLabel>
          {renderNavList(secondaryListItems)}
        </Box>
      </Stack>
    </Stack>
  );
}
