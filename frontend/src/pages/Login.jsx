import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/images/logo.png';

const Container = styled.div`
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Inter', 'Roboto', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: rgba(10, 48, 66, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  
  nav {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem;
    
    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      
      img {
        height: 48px;
        width: auto;
      }
    }
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
`;

const FormContainer = styled.div`
  background: white;
  border: 1px solid rgba(229, 231, 235, 1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 2.5rem;
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  position: relative;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #0a3042;
  font-weight: 800;
  font-size: 2rem;
  letter-spacing: -0.025em;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  color: #111827;
  font-family: inherit;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #36e961;
    box-shadow: 0 0 0 3px rgba(54, 233, 97, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #36e961, #64ee85);
  color: #0a3042;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  margin-top: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 10px 25px rgba(54, 233, 97, 0.4);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const StyledLink = styled(Link)`
  color: #36e961;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    color: #22c55e;
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.825rem;
  margin-top: 0.5rem;
  display: block;
`;

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔍 Login: useEffect detected authentication, checking user subscription status');
      
      // Check if user is free (trial or no subscription)
      if (user && (user.subscription === 'none' || user.role === 'trial' || !user.subscription)) {
        console.log('🔍 Login: Free user detected, redirecting to checkout');
        navigate('/checkout');
      } else {
        console.log('🔍 Login: Premium user, navigating to dashboard');
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    console.log('🔍 Login: Submitting login form for:', data.email);
    
    const result = await login(data.email, data.password);
    console.log('🔍 Login: Login result:', result);
    
    if (result.success) {
      console.log('🔍 Login: Login successful, checking user status...');
      
      // Se o trial expirou, redirecionar para página de assinatura
      if (result.trialExpired && result.redirectToSubscription) {
        console.log('🔍 Login: Trial expired, redirecting to subscription page');
        navigate('/subscription');
        setLoading(false);
        return;
      }
      
      // Check if user is free and redirect to checkout
      if (result.user && (result.user.subscription === 'none' || result.user.role === 'trial' || !result.user.subscription)) {
        console.log('🔍 Login: Free user detected, redirecting to checkout');
        navigate('/checkout');
        setLoading(false);
        return;
      }
      
      // Premium user goes to dashboard (useEffect will handle this case)
    }
    
    setLoading(false);
  };

  return (
    <Container>
      <Header>
        <nav>
          <div className="nav-content">
            <div className="logo">
              <img src={logo} alt="Logo" />
            </div>
          </div>
        </nav>
      </Header>
      
      <MainContent>
        <FormContainer>
          <Title>Login</Title>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Digite seu email"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Email inválido'
                  }
                })}
              />
              {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label>Senha</Label>
              <Input
                type="password"
                placeholder="Digite sua senha"
                {...register('password', {
                  required: 'Senha é obrigatória'
                })}
              />
              {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
            </FormGroup>
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Form>
          
          <LinkText>
            Não tem uma conta?{' '}
            <StyledLink to="/register">Cadastre-se</StyledLink>
          </LinkText>
        </FormContainer>
      </MainContent>
    </Container>
  );
};

export default Login;