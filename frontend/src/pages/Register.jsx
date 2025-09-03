import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { toast } from 'react-toastify';
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
  max-width: 440px;
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

const PasswordRequirements = styled.div`
  background: rgba(54, 233, 97, 0.1);
  border: 1px solid rgba(54, 233, 97, 0.2);
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #36e961;
  
  ul {
    margin: 0;
    padding-left: 1rem;
    list-style: none;
  }
  
  li {
    margin: 0.25rem 0;
    position: relative;
    
    &::before {
      content: '▶';
      position: absolute;
      left: -0.75rem;
      color: #36e961;
    }
  }
`;

const RequirementCheck = styled.span`
  color: ${props => props.met ? '#36e961' : '#ef4444'};
  
  &::before {
    content: '${props => props.met ? '✓' : '✗'}';
    margin-right: 0.5rem;
  }
`;

const Register = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  // Password validation helpers
  const validatePassword = (value) => {
    const requirements = {
      minLength: value && value.length >= 8,
      hasUppercase: value && /[A-Z]/.test(value),
      hasLowercase: value && /[a-z]/.test(value),
      hasNumber: value && /\d/.test(value),
      hasSpecialChar: value && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
    };

    const allMet = Object.values(requirements).every(req => req);
    
    if (!allMet) {
      const missing = [];
      if (!requirements.minLength) missing.push('mínimo 8 caracteres');
      if (!requirements.hasUppercase) missing.push('letra maiúscula');
      if (!requirements.hasLowercase) missing.push('letra minúscula');
      if (!requirements.hasNumber) missing.push('número');
      if (!requirements.hasSpecialChar) missing.push('caractere especial');
      
      return `Senha deve conter: ${missing.join(', ')}`;
    }
    
    return true;
  };

  const getPasswordRequirements = (currentPassword) => {
    return {
      minLength: currentPassword && currentPassword.length >= 8,
      hasUppercase: currentPassword && /[A-Z]/.test(currentPassword),
      hasLowercase: currentPassword && /[a-z]/.test(currentPassword),
      hasNumber: currentPassword && /\d/.test(currentPassword),
      hasSpecialChar: currentPassword && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(currentPassword)
    };
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Store token and user data
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        toast.success('Conta criada com sucesso!');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Erro ao criar conta');
      }
    } catch (error) {
      toast.error('Erro de conexão. Tente novamente.');
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
        <Title>Cadastro</Title>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>Nome</Label>
            <Input
              type="text"
              {...register('firstName', {
                required: 'Nome é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Nome deve ter pelo menos 2 caracteres'
                }
              })}
              placeholder="Digite seu nome"
            />
            {errors.firstName && <ErrorMessage>{errors.firstName.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Sobrenome</Label>
            <Input
              type="text"
              {...register('lastName', {
                required: 'Sobrenome é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Sobrenome deve ter pelo menos 2 caracteres'
                }
              })}
              placeholder="Digite seu sobrenome"
            />
            {errors.lastName && <ErrorMessage>{errors.lastName.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Email inválido'
                }
              })}
              placeholder="Digite seu email"
            />
            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label>Senha</Label>
            <Input
              type="password"
              {...register('password', {
                required: 'Senha é obrigatória',
                validate: validatePassword
              })}
            />
            {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
            
            <PasswordRequirements>
              <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Requisitos da senha:</div>
              {password && (
                <ul>
                  <li>
                    <RequirementCheck met={getPasswordRequirements(password).minLength}>
                      Mínimo 8 caracteres
                    </RequirementCheck>
                  </li>
                  <li>
                    <RequirementCheck met={getPasswordRequirements(password).hasUppercase}>
                      Pelo menos 1 letra maiúscula (A-Z)
                    </RequirementCheck>
                  </li>
                  <li>
                    <RequirementCheck met={getPasswordRequirements(password).hasLowercase}>
                      Pelo menos 1 letra minúscula (a-z)
                    </RequirementCheck>
                  </li>
                  <li>
                    <RequirementCheck met={getPasswordRequirements(password).hasNumber}>
                      Pelo menos 1 número (0-9)
                    </RequirementCheck>
                  </li>
                  <li>
                    <RequirementCheck met={getPasswordRequirements(password).hasSpecialChar}>
                      Pelo menos 1 caractere especial (!@#$%^&*)
                    </RequirementCheck>
                  </li>
                </ul>
              )}
              {!password && (
                <div style={{ color: 'rgba(224, 224, 224, 0.7)' }}>
                  Digite uma senha para ver os requisitos
                </div>
              )}
            </PasswordRequirements>
          </FormGroup>

          <FormGroup>
            <Label>Confirmar Senha</Label>
            <Input
              type="password"
              {...register('confirmPassword', {
                required: 'Confirmação de senha é obrigatória',
                validate: value => value === password || 'Senhas não coincidem'
              })}
            />
            {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>}
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </Form>
        
        <LinkText>
          Já tem uma conta?{' '}
          <StyledLink to="/login">Faça login</StyledLink>
        </LinkText>
      </FormContainer>
      </MainContent>
    </Container>
  );
};

export default Register;