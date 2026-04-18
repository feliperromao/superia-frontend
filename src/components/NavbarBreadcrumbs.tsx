import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation } from 'react-router-dom';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

export default function NavbarBreadcrumbs() {
  const location = useLocation();

  const getBreadcrumbName = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Home';
      case '/agents':
        return 'Agentes';
      case '/llms':
        return 'Modelos de Linguagem';
      case '/channels':
        return 'Canais';
      case '/contacts':
        return 'Contatos';
      case '/mass-sending':
        return 'Envio em massa';
      case '/teams':
        return 'Equipes';
      case '/settings':
        return 'Configurações';
      default:
        return 'Home';
    }
  };

  const currentName = getBreadcrumbName(location.pathname);

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Typography variant="body1">SuperIA</Typography>
      <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
        {currentName}
      </Typography>
    </StyledBreadcrumbs>
  );
}
