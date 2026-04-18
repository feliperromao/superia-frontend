import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import axios, { AxiosError } from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import { env } from '../../config/env';

const SignupCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '520px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

const SignupContainer = styled(Stack)(() => ({
  minHeight: '100vh',
  padding: 20,
  backgroundImage:
    'radial-gradient(circle at top, hsl(195, 100%, 96%), hsl(0, 0%, 100%) 55%)',
  backgroundRepeat: 'no-repeat',
}));

type ApiErrorResponse = {
  message?: string | string[];
};

type FieldErrors = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialFieldErrors: FieldErrors = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function Signup() {
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>(initialFieldErrors);
  const [submitError, setSubmitError] = React.useState('');
  const [successEmail, setSuccessEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateForm = (formData: FormData) => {
    const nextErrors: FieldErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirm_password') ?? '');

    if (!name) {
      nextErrors.name = 'Informe seu nome.';
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = 'Informe um email valido.';
    }

    if (!password || password.length < 6) {
      nextErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirme sua senha.';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'As senhas nao coincidem.';
    }

    setFieldErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!validateForm(formData)) {
      return;
    }

    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirm_password') ?? '');

    try {
      setIsSubmitting(true);

      await axios.post(`${env.backendApiUrl}/auth/register`, {
        name,
        email,
        password,
        confirm_password: confirmPassword,
      });

      setSubmitError('');
      setSuccessEmail(email);
      setFieldErrors(initialFieldErrors);
      form.reset();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const apiMessage = axiosError.response?.data?.message;

      setSubmitError(
        Array.isArray(apiMessage)
          ? apiMessage[0]
          : apiMessage || 'Nao foi possivel concluir o cadastro. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SignupContainer direction="column" justifyContent="center">
      <CssBaseline />
      <Stack
        sx={{
          justifyContent: 'center',
          height: '100%',
          p: 2,
        }}
      >
        <SignupCard variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Criar conta em SUPER.IA
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preencha os dados abaixo para criar sua conta.
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            {submitError ? <Alert severity="error">{submitError}</Alert> : null}
            {successEmail ? (
              <Alert severity="success">
                Cadastro realizado. Enviamos um email para {successEmail}. Confirme seu email
                para acessar sua conta.
              </Alert>
            ) : null}
            <FormControl>
              <FormLabel htmlFor="name">Nome</FormLabel>
              <TextField
                autoFocus
                required
                fullWidth
                id="name"
                name="name"
                placeholder="Seu nome"
                error={Boolean(fieldErrors.name)}
                helperText={fieldErrors.name}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@email.com"
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Senha</FormLabel>
              <TextField
                required
                fullWidth
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••"
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="confirm_password">Confirmar senha</FormLabel>
              <TextField
                required
                fullWidth
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••"
                error={Boolean(fieldErrors.confirmPassword)}
                helperText={fieldErrors.confirmPassword}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Ja tem uma conta?{' '}
              <Link component={RouterLink} to="/login" variant="body2">
                Entrar
              </Link>
            </Typography>
          </Box>
        </SignupCard>
      </Stack>
    </SignupContainer>
  );
}
