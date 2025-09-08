import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { 
  User, 
  Settings, 
  CreditCard, 
  Users, 
  Copy, 
  DollarSign, 
  TrendingUp,
  Eye,
  EyeOff,
  Share,
  Gift,
  ArrowLeft,
  Lock,
  Save
} from 'lucide-react';
import logo from '../assets/images/logo.png';

const Container = styled.div`
  min-height: 100vh;
  background: transparent;
  position: relative;
  display: flex;
`;

const Sidebar = styled.div`
  width: 280px;
  min-height: 100vh;
  background: 
    linear-gradient(135deg, rgba(0, 255, 170, 0.1) 0%, rgba(0, 136, 204, 0.1) 100%),
    rgba(15, 15, 35, 0.98);
  backdrop-filter: blur(10px);
  border-right: 2px solid rgba(0, 255, 170, 0.4);
  transition: all 0.3s ease;
  position: fixed !important;
  left: 0;
  top: 0;
  z-index: 1000;
`;

const LogoContainer = styled.div`
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(0, 255, 170, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.img`
  width: 120px;
  height: auto;
`;

const SidebarNav = styled.nav`
  padding: 2rem 0;
`;

const NavItem = styled.div`
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${props => props.active ? '#00ffaa' : 'rgba(255, 255, 255, 0.8)'};
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.active ? 'rgba(0, 255, 170, 0.1)' : 'transparent'};
  border-left: ${props => props.active ? '3px solid #00ffaa' : '3px solid transparent'};
  font-weight: ${props => props.active ? '600' : '400'};

  &:hover {
    color: #00ffaa;
    background: rgba(0, 255, 170, 0.05);
    transform: translateX(5px);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  background: 
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.05) 0%, transparent 50%),
    linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
`;

const PageTitle = styled.h1`
  color: #00ffaa;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SettingsCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 170, 0.5), transparent);
  }
`;

const CardTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardContent = styled.div`
  color: rgba(255, 255, 255, 0.8);
`;

const AffiliateSection = styled.div`
  grid-column: 1 / -1;
`;

const AffiliateCard = styled(SettingsCard)`
  background: linear-gradient(135deg, rgba(0, 255, 170, 0.1), rgba(0, 136, 204, 0.1));
  border: 1px solid rgba(0, 255, 170, 0.3);
`;

const AffiliateStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #00ffaa;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const AffiliateCodeContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  border: 1px solid rgba(0, 255, 170, 0.2);
`;

const CodeDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Code = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  font-weight: 600;
  color: #00ffaa;
  letter-spacing: 2px;
`;

const CopyButton = styled.button`
  background: linear-gradient(135deg, #00ffaa, #00cc88);
  color: #0f0f23;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 255, 170, 0.3);
  }
`;

const ShareButton = styled(CopyButton)`
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: white;
`;

const UrlDisplay = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.8rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  word-break: break-all;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const InfoBox = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  line-height: 1.5;
`;

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [affiliateData, setAffiliateData] = useState({
    code: null,
    totalReferrals: 0,
    totalCommissions: 0,
    monthlyCommissions: 0,
    pendingWithdrawals: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAffiliateUrl, setShowAffiliateUrl] = useState(false);

  useEffect(() => {
    // Check if should open affiliate tab based on URL parameter
    const tab = searchParams.get('tab');
    if (tab === 'affiliate') {
      setActiveTab('affiliate');
    }
    
    loadAffiliateData();
  }, [searchParams]);

  const loadAffiliateData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/affiliate-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAffiliateData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de afiliado:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAffiliateCode = () => {
    navigator.clipboard.writeText(affiliateData.code);
    toast.success('Código copiado!');
  };

  const copyAffiliateUrl = () => {
    const url = `${window.location.origin}/checkout?ref=${affiliateData.code}`;
    navigator.clipboard.writeText(url);
    toast.success('Link de afiliado copiado!');
  };

  const shareAffiliateUrl = async () => {
    const url = `${window.location.origin}/checkout?ref=${affiliateData.code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Data Atlas - Inteligência Empresarial',
          text: 'Acesse 66 milhões de empresas brasileiras com 10% de desconto!',
          url: url
        });
      } catch (error) {
        copyAffiliateUrl();
      }
    } else {
      copyAffiliateUrl();
    }
  };

  return (
    <Container>
      <Sidebar>
        <LogoContainer>
          <Logo src={logo} alt="Data Atlas" />
        </LogoContainer>
        
        <SidebarNav>
          <NavItem 
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          >
            <User />
            Perfil
          </NavItem>
          <NavItem 
            active={activeTab === 'subscription'}
            onClick={() => setActiveTab('subscription')}
          >
            <CreditCard />
            Assinatura
          </NavItem>
          <NavItem 
            active={activeTab === 'affiliate'}
            onClick={() => setActiveTab('affiliate')}
          >
            <Users />
            Sistema de Afiliados
          </NavItem>
          <NavItem onClick={() => navigate('/dashboard')}>
            <ArrowLeft />
            Voltar ao Dashboard
          </NavItem>
        </SidebarNav>
      </Sidebar>

      <MainContent>
        <Header>
          <PageTitle>
            <Settings />
            Configurações da Conta
          </PageTitle>
          <BackButton onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} />
            Dashboard
          </BackButton>
        </Header>

        {activeTab === 'profile' && (
          <SettingsGrid>
            <SettingsCard>
              <CardTitle>
                <User />
                Informações do Perfil
              </CardTitle>
              <CardContent>
                <p><strong>Nome:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>ID do Usuário:</strong> {user?.id}</p>
              </CardContent>
            </SettingsCard>

            <SettingsCard>
              <CardTitle>
                <Settings />
                Configurações Gerais
              </CardTitle>
              <CardContent>
                <p>Configurações gerais da conta em breve...</p>
              </CardContent>
            </SettingsCard>
          </SettingsGrid>
        )}

        {activeTab === 'subscription' && (
          <SettingsGrid>
            <SettingsCard>
              <CardTitle>
                <CreditCard />
                Status da Assinatura
              </CardTitle>
              <CardContent>
                <p>Informações da assinatura em breve...</p>
              </CardContent>
            </SettingsCard>
          </SettingsGrid>
        )}

        {activeTab === 'affiliate' && (
          <AffiliateSection>
            <AffiliateCard>
              <CardTitle>
                <Users />
                Sistema de Afiliados
                <Gift size={24} />
              </CardTitle>
              
              <InfoBox>
                <strong>Como funciona:</strong><br/>
                • Compartilhe seu link de afiliado e ganhe 15% de comissão recorrente<br/>
                • Seus indicados ganham 10% de desconto permanente<br/>
                • Comissões são pagas mensalmente conforme as assinaturas ativas
              </InfoBox>

              <AffiliateStats>
                <StatCard>
                  <StatValue>{affiliateData.totalReferrals}</StatValue>
                  <StatLabel>Total de Indicações</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>R$ {(affiliateData.totalCommissions / 100).toFixed(2)}</StatValue>
                  <StatLabel>Comissões Totais</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>R$ {(affiliateData.monthlyCommissions / 100).toFixed(2)}</StatValue>
                  <StatLabel>Comissões Mensais</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>R$ {(affiliateData.pendingWithdrawals / 100).toFixed(2)}</StatValue>
                  <StatLabel>Saldo Disponível</StatLabel>
                </StatCard>
              </AffiliateStats>

              {affiliateData.code && (
                <AffiliateCodeContainer>
                  <h3 style={{ color: '#00ffaa', marginBottom: '1rem' }}>Seu Código de Afiliado</h3>
                  
                  <CodeDisplay>
                    <Code>{affiliateData.code}</Code>
                    <CopyButton onClick={copyAffiliateCode}>
                      <Copy size={16} />
                      Copiar Código
                    </CopyButton>
                  </CodeDisplay>

                  <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h4 style={{ color: 'white', margin: 0 }}>Link de Indicação</h4>
                      <button 
                        onClick={() => setShowAffiliateUrl(!showAffiliateUrl)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#00ffaa', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        {showAffiliateUrl ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showAffiliateUrl ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                    
                    {showAffiliateUrl && (
                      <UrlDisplay>
                        {window.location.origin}/checkout?ref={affiliateData.code}
                      </UrlDisplay>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <CopyButton onClick={copyAffiliateUrl}>
                        <Copy size={16} />
                        Copiar Link
                      </CopyButton>
                      <ShareButton onClick={shareAffiliateUrl}>
                        <Share size={16} />
                        Compartilhar
                      </ShareButton>
                    </div>
                  </div>
                </AffiliateCodeContainer>
              )}

              {!affiliateData.code && !loading && (
                <InfoBox>
                  Seu código de afiliado será gerado automaticamente assim que você fizer sua primeira indicação.
                </InfoBox>
              )}
            </AffiliateCard>
          </AffiliateSection>
        )}
      </MainContent>
    </Container>
  );
};

export default AccountSettings;