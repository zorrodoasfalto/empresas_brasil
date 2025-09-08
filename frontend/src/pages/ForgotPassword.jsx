import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
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
  margin-bottom: 1rem;
  color: #0a3042;
  font-weight: 800;
  font-size: 1.75rem;
  letter-spacing: -0.025em;
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: 2rem;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
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

const SuccessMessage = styled.div`
  background: #d1fae5;
  border: 1px solid #34d399;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const SuccessTitle = styled.h3`
  color: #065f46;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const SuccessText = styled.p`
  color: #047857;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
`;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerMessage('');
    
    try {
      console.log('🔐 Requesting password reset for:', data.email);
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email
        }),
      });

      const result = await response.json();
      console.log('🔐 Password reset response:', result);

      if (result.success) {
        setSuccess(true);
        setServerMessage(result.message);
      } else {
        setServerMessage(result.message || 'Erro ao processar solicitação');
      }
      
    } catch (error) {
      console.error('❌ Password reset request error:', error);
      setServerMessage('Erro de conexão. Tente novamente mais tarde.');
    }
    
    setLoading(false);
  };

  if (success) {
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
            <SuccessMessage>
              <SuccessTitle>✅ Solicitação Enviada</SuccessTitle>
              <SuccessText>{serverMessage}</SuccessText>
            </SuccessMessage>
            
            <LinkText>
              Lembre-se de verificar sua caixa de spam.{' '}
              <StyledLink to="/login">Voltar para Login</StyledLink>
            </LinkText>
          </FormContainer>
        </MainContent>
      </Container>
    );
  }

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
          <Title>Esqueci minha senha</Title>
          <Subtitle>
            Digite seu email abaixo e enviaremos uma nova senha para você acessar sua conta.
          </Subtitle>
          
          {serverMessage && !success && (
            <ErrorMessage style={{ textAlign: 'center', marginBottom: '1rem' }}>
              {serverMessage}
            </ErrorMessage>
          )}
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Digite seu email cadastrado"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido'
                  }
                })}
              />
              {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
            </FormGroup>
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Nova Senha'}
            </Button>
          </Form>
          
          <LinkText>
            Lembrou da senha?{' '}
            <StyledLink to="/login">Fazer Login</StyledLink>
          </LinkText>
          
          <LinkText>
            Não tem uma conta?{' '}
            <StyledLink to="/register">Cadastre-se</StyledLink>
          </LinkText>
        </FormContainer>
      </MainContent>
    </Container>
  );
};

export default ForgotPassword;