import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import styled from 'styled-components';
import { 
  Database, 
  CheckCircle, 
  Sparkles, 
  ArrowLeft, 
  CreditCard,
  Shield,
  Zap,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/images/logo.png';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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

const HeaderContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  
  .nav-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
  }
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
  padding: 12px 24px;
  border: none;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    box-shadow: 0 10px 25px rgba(54, 233, 97, 0.4);
    transform: translateY(-2px);
  }
`;

const AffiliateButton = styled.button`
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
  border: 1px solid #059669;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  
  @media (max-width: 1200px) {
    padding: 6px 12px;
    font-size: 0.8rem;
    
    span {
      display: none;
    }
  }
  
  &:hover {
    background: #059669;
    color: white;
    transform: translateY(-1px);
  }
`;

const Content = styled.main`
  padding: 1.5rem 1rem;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  
  @media (min-width: 640px) {
    padding: 2rem 1.5rem;
  }
  
  @media (min-width: 1024px) {
    padding: 2.5rem 2rem;
  }
  
  @media (min-width: 1600px) {
    padding: 3rem 2rem;
  }
  
  .section-content {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const CheckoutGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const NewCheckoutLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
`;

const PlanSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  max-width: 1000px;
  margin: 0 auto 1.5rem auto;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    max-width: 500px;
  }
  
  @media (max-width: 768px) {
    gap: 0.8rem;
    max-width: 400px;
  }
`;

const SelectablePlanCard = styled.div`
  background: #ffffff;
  border: 2px solid ${props => props.selected ? '#36e961' : '#e5e7eb'};
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 1200px) {
    padding: 1rem;
    border-radius: 10px;
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
  
  &:hover {
    border-color: #36e961;
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  ${props => props.selected && `
    background: rgba(59, 130, 246, 0.1);
    box-shadow: 0 6px 25px rgba(59, 130, 246, 0.3);
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
  }
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0 0 16px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  z-index: 1;
`;

const DiscountBadge = styled.div`
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #0a0a0a;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 0.5rem;
`;

const PlanCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
  }
`;

const PlanTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #0a3042;
  margin-bottom: 0.8rem;
  margin-top: ${props => props.hasPopularBadge ? '1.5rem' : '0'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const PriceDisplay = styled.div`
  font-size: 2.2rem;
  font-weight: 800;
  color: #36e961;
  margin: 0.8rem 0;
  line-height: 1;
  text-align: center;
  
  @media (max-width: 1200px) {
    font-size: 2rem;
  }
  
  @media (max-width: 768px) {
    font-size: 2.4rem;
  }
`;

const PriceSubtext = styled.div`
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;

  li {
    color: #475569;
    padding: 0.3rem 0;
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    line-height: 1.4;
    font-size: 0.9rem;

    &::before {
      content: '✓';
      color: #36e961;
      font-weight: bold;
      font-size: 1rem;
      margin-top: 0.1rem;
    }
  }
`;

const CheckoutCard = styled.div`
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  position: relative;
  overflow: visible;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
  }
`;

const CheckoutTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0a3042;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
`;

const CheckoutButton = styled.button`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 9999px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #1e40af, #3b82f6);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const InfoText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

// Plan configuration
const PLANS = {
  pro: {
    name: 'Plano Pro',
    price: 97.00,
    credits: 50,
    features: [
      'Acesso a 66 milhões de empresas',
      'Exportação profissional Excel/CSV',
      'Dados completos + sócios',
      'Filtros avançados',
      'Suporte por email'
    ]
  },
  premium: {
    name: 'Plano Premium',
    price: 147.00,
    credits: 150,
    features: [
      'Acesso a 66 milhões de empresas',
      'Exportação profissional Excel/CSV',
      'Dados completos + sócios',
      'Todos os 20 segmentos',
      'Filtros avançados',
      'Suporte prioritário'
    ]
  },
  max: {
    name: 'Plano Max',
    price: 247.00,
    credits: 300,
    features: [
      'Acesso a 66 milhões de empresas',
      'Exportação profissional Excel/CSV',
      'Dados completos + sócios',
      'Todos os 20 segmentos',
      'Filtros avançados',
      'Suporte técnico prioritário'
    ]
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [affiliateCode, setAffiliateCode] = useState('');

  // Capture affiliate code from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      console.log('🎯 Affiliate code detected:', ref);
      setAffiliateCode(ref);
    }
  }, []);

  const handleCheckout = async () => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('💰 Sending checkout request with affiliate code:', affiliateCode);
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planType: selectedPlan,
          affiliateCode: affiliateCode || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento');
      }

      // Redirecionar para o Stripe Checkout
      window.location.href = data.url;

    } catch (error) {
      console.error('Erro no checkout:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Helper function to get discounted price
  const getDiscountedPrice = (price) => {
    return affiliateCode ? (price * 0.9).toFixed(2) : price.toFixed(2);
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <div className="nav-content">
            <Logo onClick={() => navigate('/')}>
              <img src={logo} alt="Empresas Brasil" />
            </Logo>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <AffiliateButton onClick={() => navigate('/settings?tab=affiliate')}>
                <Settings size={16} />
                <span>Configurar Afiliado</span>
              </AffiliateButton>
              <BackButton onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
                Voltar
              </BackButton>
            </div>
          </div>
        </HeaderContent>
      </Header>

      <Content>
        <NewCheckoutLayout>
          <PlanTitle style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <Sparkles size={24} />
            Escolha seu Plano
          </PlanTitle>
          
          {affiliateCode && (
            <DiscountBadge style={{ textAlign: 'center', marginBottom: '2rem' }}>
              🎉 Código de desconto ativo! 10% OFF em todos os planos
            </DiscountBadge>
          )}
          
          <PlanSelector>
            {Object.entries(PLANS).map(([planKey, plan]) => (
              <SelectablePlanCard 
                key={planKey}
                selected={selectedPlan === planKey}
                onClick={() => setSelectedPlan(planKey)}
              >
                {planKey === 'premium' && <PopularBadge>🔥 Mais Popular</PopularBadge>}
                {selectedPlan === planKey && <SelectedBadge>Selecionado</SelectedBadge>}
                
                <PlanTitle 
                  style={{ fontSize: '1.2rem', marginBottom: '1rem' }}
                  hasPopularBadge={planKey === 'premium'}
                >
                  {plan.name}
                </PlanTitle>
                
                <PriceDisplay style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  R$ {getDiscountedPrice(plan.price)}
                </PriceDisplay>
                
                {affiliateCode && (
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'line-through', textAlign: 'center' }}>
                    De R$ {plan.price.toFixed(2)}
                  </div>
                )}
                
                <PriceSubtext>por mês</PriceSubtext>
                
                <div style={{ 
                  background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', 
                  border: '2px solid #3b82f6', 
                  borderRadius: '10px', 
                  padding: '0.8rem', 
                  margin: '0.8rem 0', 
                  textAlign: 'center' 
                }}>
                  <div style={{ color: '#1e40af', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>
                    💳 {plan.credits} créditos mensais
                  </div>
                  <div style={{ color: '#16a34a', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: '600' }}>
                    🔄 Créditos se acumulam mês a mês se não utilizados!
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                    Renovados automaticamente todo mês
                  </div>
                  <div style={{ color: '#16a34a', fontSize: '0.85rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(59, 130, 246, 0.2)', fontWeight: 'bold' }}>
                    💳 Empresas Brasil: Sistema de batches inteligente
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    • <strong>Até 10.000 empresas:</strong> 1 crédito por batch de 2.500 (máx 4 créditos)<br/>
                    • <strong>25.000 empresas:</strong> 1 crédito por batch de 5.000 (5 créditos)<br/>
                    • <strong>50.000 empresas:</strong> 1 crédito por batch de 10.000 (5 créditos)
                  </div>
                  <div style={{ color: '#16a34a', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                    ✅ Sistema otimizado: Batches maiores = menos créditos proporcionalmente
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    Maps: 10 créditos | Instagram: 10 créditos | LinkedIn: 50 créditos
                  </div>
                </div>
                
                <FeatureList>
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </FeatureList>
              </SelectablePlanCard>
            ))}
          </PlanSelector>

          {error && <ErrorMessage style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{error}</ErrorMessage>}

          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <SecurityBadge style={{ justifyContent: 'center', color: '#64748b', marginBottom: '1rem' }}>
              <Shield size={16} />
              Pagamento seguro processado pelo Stripe
            </SecurityBadge>
          </div>

          <CheckoutButton 
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Processando...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                Pagar com Cartão
              </>
            )}
          </CheckoutButton>

          <InfoText style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginTop: '1rem' }}>
            • Cobrança recorrente mensal de R$ {getDiscountedPrice(PLANS[selectedPlan].price)}<br/>
            • {affiliateCode && '10% de desconto aplicado • '}
            • Primeiro mês com acesso imediato<br/>
            • Cancelamento a qualquer momento<br/>
            • Sem taxa de adesão ou multa
          </InfoText>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <SecurityBadge style={{ justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              <Zap size={16} />
              Ativação imediata após confirmação do pagamento
            </SecurityBadge>
          </div>

        </NewCheckoutLayout>
      </Content>
    </Container>
  );
};

export default Checkout;