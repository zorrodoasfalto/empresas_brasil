import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const SubscriptionContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const SubscriptionCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
  font-size: 2.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 40px;
  font-size: 1.2rem;
  line-height: 1.6;
`;

const PlanCard = styled.div`
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-5px);
  }
`;

const PlanTitle = styled.h3`
  color: #333;
  margin-bottom: 10px;
  font-size: 1.5rem;
`;

const PlanPrice = styled.div`
  color: #667eea;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
`;

const PlanFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
`;

const PlanFeature = styled.li`
  color: #666;
  margin-bottom: 10px;
  font-size: 1rem;
  
  &:before {
    content: '✓';
    color: #4CAF50;
    font-weight: bold;
    margin-right: 10px;
  }
`;

const SubscribeButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 15px 40px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
`;

const BackButton = styled.button`
  background: none;
  color: #666;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  padding: 15px 40px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  width: 100%;
  
  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
`;

const TrialExpiredMessage = styled.div`
  background: #ffe6e6;
  border: 2px solid #ff9999;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  color: #cc0000;
  font-weight: bold;
`;

function SubscriptionPage() {
  const navigate = useNavigate();

  const handleSubscribe = (plan) => {
    // Página de assinatura em branco por enquanto
    alert(`Funcionalidade de assinatura ${plan} em desenvolvimento. Em breve!`);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <SubscriptionContainer>
      <SubscriptionCard>
        <Title>🚀 Escolha seu Plano</Title>
        
        <TrialExpiredMessage>
          ⏰ Seu período de trial de 7 dias expirou. Para continuar usando o sistema, 
          escolha um dos nossos planos abaixo.
        </TrialExpiredMessage>
        
        <Subtitle>
          Continue aproveitando todos os recursos da nossa plataforma de dados empresariais
        </Subtitle>

        <PlanCard>
          <PlanTitle>Plano Básico</PlanTitle>
          <PlanPrice>R$ 49,90/mês</PlanPrice>
          <PlanFeatures>
            <PlanFeature>Acesso a 66M empresas brasileiras</PlanFeature>
            <PlanFeature>Até 10.000 consultas por mês</PlanFeature>
            <PlanFeature>Dados de sócios e representantes</PlanFeature>
            <PlanFeature>Exportação em Excel e CSV</PlanFeature>
            <PlanFeature>Suporte por email</PlanFeature>
          </PlanFeatures>
          <SubscribeButton onClick={() => handleSubscribe('Básico')}>
            Assinar Plano Básico
          </SubscribeButton>
        </PlanCard>

        <PlanCard>
          <PlanTitle>Plano Profissional</PlanTitle>
          <PlanPrice>R$ 99,90/mês</PlanPrice>
          <PlanFeatures>
            <PlanFeature>Tudo do Plano Básico</PlanFeature>
            <PlanFeature>Consultas ilimitadas</PlanFeature>
            <PlanFeature>Instagram Email Scraper</PlanFeature>
            <PlanFeature>LinkedIn Lead Generator</PlanFeature>
            <PlanFeature>CRM integrado (Leads, Kanban, Funil)</PlanFeature>
            <PlanFeature>Suporte prioritário</PlanFeature>
          </PlanFeatures>
          <SubscribeButton onClick={() => handleSubscribe('Profissional')}>
            Assinar Plano Profissional
          </SubscribeButton>
        </PlanCard>

        <BackButton onClick={handleBack}>
          ← Voltar ao Dashboard
        </BackButton>
      </SubscriptionCard>
    </SubscriptionContainer>
  );
}

export default SubscriptionPage;