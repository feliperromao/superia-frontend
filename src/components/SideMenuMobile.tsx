import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { useNavigate } from 'react-router-dom';
import MenuButton from './MenuButton';
import MenuContent from './MenuContent';
import { useAuth } from '../auth';

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({ open, toggleDrawer }: SideMenuMobileProps) {
  const navigate = useNavigate();
  const { logout, user, isLoadingUser } = useAuth();
  const userName = user?.name || 'Usuario';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';
  const userEmail = user?.email || '';

  const handleLogout = () => {
    logout();
    toggleDrawer(false)();
    navigate('/login', { replace: true });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={userName}
              src={user?.avatarUrl ?? undefined}
              sx={{ width: 24, height: 24 }}
            >
              {userInitials}
            </Avatar>
            <Stack sx={{ minWidth: 0 }}>
              <Typography component="p" variant="h6" noWrap>
                {isLoadingUser ? 'Carregando...' : userName}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {isLoadingUser ? 'Buscando perfil...' : userEmail}
              </Typography>
            </Stack>
          </Stack>
          <MenuButton showBadge>
            <NotificationsRoundedIcon />
          </MenuButton>
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogout}
          >
            Sair
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
