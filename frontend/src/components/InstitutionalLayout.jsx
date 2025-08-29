import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import logo from '../assets/images/logo.png';

const Container = styled.div`
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Inter', 'Roboto', system-ui, sans-serif;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(10, 48, 66, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderContent = styled.nav`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  
  img {
    height: 48px;
    width: auto;
  }
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #36e961, #64ee85);
  color: #0a3042;
  padding: 8px 16px;
  border: none;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(54, 233, 97, 0.4);
    transform: translateY(-2px);
  }
`;

const Content = styled.main`
  max-width: 1280px;
  margin: 0 auto;
  padding: 4rem 1rem;
  
  @media (min-width: 640px) {
    padding: 4rem 1.5rem;
  }
  
  @media (min-width: 1024px) {
    padding: 4rem 2rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #0a3042;
  margin-bottom: 2rem;
  line-height: 1.2;
  
  @media (min-width: 640px) {
    font-size: 3rem;
  }
  
  @media (min-width: 1024px) {
    font-size: 3.75rem;
  }
`;

const ContentCard = styled.div`
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  h2 {
    color: #0a3042;
    font-size: 1.875rem;
    font-weight: bold;
    margin: 2rem 0 1rem 0;
    
    &:first-child {
      margin-top: 0;
    }
  }

  h3 {
    color: #36e961;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1.5rem 0 1rem 0;
  }

  p {
    color: #6b7280;
    line-height: 1.7;
    margin-bottom: 1rem;
    font-size: 1.125rem;
  }

  ul {
    margin: 1rem 0 1rem 1.5rem;
    
    li {
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 0.75rem;
      font-size: 1.125rem;
    }
  }

  strong {
    color: #0a3042;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    padding: 2rem;
    
    h2 {
      font-size: 1.5rem;
    }
    
    h3 {
      font-size: 1.25rem;
    }
    
    p, li {
      font-size: 1rem;
    }
  }
`;

const InstitutionalLayout = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo onClick={() => navigate('/')}>
            <img src={logo} alt="Data Atlas" />
          </Logo>
          <BackButton onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
            Voltar
          </BackButton>
        </HeaderContent>
      </Header>

      <Content>
        <Title>{title}</Title>
        <ContentCard>
          {children}
        </ContentCard>
      </Content>
    </Container>
  );
};

export default InstitutionalLayout;