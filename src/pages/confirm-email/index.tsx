import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import axios, { AxiosError } from 'axios';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { env } from '../../config/env';

const ConfirmEmailContainer = styled(Stack)(() => ({
  minHeight: '100vh',
  padding: 20,
  backgroundImage:
    'radial-gradient(circle at top, hsl(142, 85%, 95%), hsl(0, 0%, 100%) 55%)',
  backgroundRepeat: 'no-repeat',
}));

const ConfirmEmailCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  textAlign: 'center',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '520px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

type ConfirmationState = 'loading' | 'success' | 'error';

type ApiErrorResponse = {
  message?: string | string[];
};

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = React.useState<ConfirmationState>('loading');
  const [message, setMessage] = React.useState('Estamos confirmando seu email...');

  React.useEffect(() => {
    const token = searchParams.get('token');
    let redirectTimeoutId: number | undefined;

    if (!token) {
      setState('error');
      setMessage('Token de confirmacao nao encontrado.');
      return;
    }

    let isMounted = true;

    const confirmEmail = async () => {
      try {
        await axios.get(`${env.backendApiUrl}/auth/confirm-email`, {
          params: { token },
        });

        if (!isMounted) {
          return;
        }

        setState('success');
        setMessage('Email confirmado com sucesso. Voce sera redirecionado para o login.');
        redirectTimeoutId = window.setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const axiosError = error as AxiosError<ApiErrorResponse>;
        const apiMessage = axiosError.response?.data?.message;

        setState('error');
        setMessage(
          Array.isArray(apiMessage)
            ? apiMessage[0]
            : apiMessage || 'Nao foi possivel confirmar seu email.'
        );
      }
    };

    confirmEmail();

    return () => {
      isMounted = false;
      if (redirectTimeoutId) {
        window.clearTimeout(redirectTimeoutId);
      }
    };
  }, [navigate, searchParams]);

  return (
    <ConfirmEmailContainer direction="column" justifyContent="center">
      <CssBaseline />
      <Stack
        sx={{
          justifyContent: 'center',
          height: '100%',
          p: 2,
        }}
      >
        <ConfirmEmailCard variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Confirmacao de email
          </Typography>
          {state === 'loading' ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress />
            </Box>
          ) : null}
          <Alert severity={state === 'success' ? 'success' : state === 'error' ? 'error' : 'info'}>
            {message}
          </Alert>
          <Button
            variant="contained"
            component={RouterLink}
            to="/login"
          >
            Ir para login
          </Button>
          <Typography variant="body2" color="text.secondary">
            Se voce acabou de confirmar o email, tambem pode seguir para a tela de login.
          </Typography>
          <Link component={RouterLink} to="/signup" variant="body2">
            Voltar para cadastro
          </Link>
        </ConfirmEmailCard>
      </Stack>
    </ConfirmEmailContainer>
  );
}
