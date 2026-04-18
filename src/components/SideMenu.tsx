import * as React from 'react';
import { alpha, styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu';
import { brand, gray } from '../shared-theme/themePrimitives';
import { useAuth } from '../auth';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function SideMenu() {
  const { user, isLoadingUser } = useAuth();
  const userName = user?.name || 'Usuario';
  const userEmail = user?.email || '';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.default',
          borderRight: '1px solid',
          borderColor: alpha(gray[500], 0.18),
          backgroundImage: `linear-gradient(180deg, ${alpha(brand[400], 0.08)} 0%, transparent 28%)`,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          px: 1.5,
          pt: 1.5,
          pb: 1,
          flexDirection: 'column',
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            px: 1,
            py: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              backgroundColor: alpha(brand[400], 0.16),
              border: '1px solid',
              borderColor: alpha(brand[300], 0.18),
            }}
          >
            <BoltRoundedIcon sx={{ fontSize: '1rem' }} />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              SuperIA Ops
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Centro de operacao
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ borderColor: alpha(gray[500], 0.14) }} />
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 1.5,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: alpha(gray[500], 0.14),
          backgroundColor: alpha(gray[500], 0.05),
        }}
      >
        <Avatar
          sizes="small"
          alt={userName}
          src={user?.avatarUrl ?? undefined}
          sx={{
            width: 40,
            height: 40,
            border: '1px solid',
            borderColor: alpha(brand[300], 0.18),
          }}
        >
          {userInitials}
        </Avatar>
        <Box sx={{ mr: 'auto' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: '16px' }}>
            {isLoadingUser ? 'Carregando...' : userName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {isLoadingUser ? 'Buscando perfil...' : userEmail}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
