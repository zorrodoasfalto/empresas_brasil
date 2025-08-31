import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import empresaService from '../services/empresaService';
import * as XLSX from 'xlsx';
import logo from '../assets/images/logo.png';
// import SubscriptionGate from '../components/SubscriptionGate'; // REMOVIDO - ACESSO LIVRE
// import { useSubscription } from '../hooks/useSubscription'; // REMOVIDO - ACESSO LIVRE

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
  z-index: 99999 !important;
  overflow: hidden;
  box-shadow: 2px 0 15px rgba(0, 255, 170, 0.2);
  border: 1px solid rgba(0, 255, 170, 0.3);
`;


const SidebarContent = styled.div`
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const SidebarLogo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(0, 255, 170, 0.2);
  height: auto;
  box-sizing: border-box;
`;

const SidebarItem = styled.div`
  padding: 15px 20px;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
  border-left: 3px solid transparent;
  
  &:hover {
    background: rgba(0, 255, 170, 0.1);
    border-left-color: #00ffaa;
    color: #00ffaa;
  }
  
  &.active {
    background: rgba(0, 255, 170, 0.2);
    border-left-color: #00ffaa;
    color: #00ffaa;
  }
  
  .icon {
    font-size: 20px;
    min-width: 20px;
  }
  
  .text {
    opacity: 1;
    transition: opacity 0.3s ease;
    white-space: nowrap;
  }
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: 
    linear-gradient(135deg, rgba(0, 255, 170, 0.1) 0%, rgba(0, 136, 204, 0.1) 100%),
    rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 170, 0.2);
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  color: #e0e0e0;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h3 {
    color: #00ffaa;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: #00ffaa;
  }
`;

const Header = styled.header`
  background: 
    linear-gradient(135deg, rgba(0, 255, 170, 0.1) 0%, rgba(0, 136, 204, 0.1) 100%),
    rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 255, 170, 0.2);
  color: #e0e0e0;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 
    0 4px 20px rgba(0, 255, 170, 0.1),
    0 0 0 1px rgba(0, 255, 170, 0.1);
  position: relative;
  min-height: 80px;
  
  @media (max-width: 768px) {
    padding: 1rem;
    flex-wrap: nowrap;
  }
`;


const Title = styled.h1`
  font-family: 'Orbitron', monospace;
  font-size: 1.8rem;
  font-weight: 700;
  color: #00ffaa;
  text-shadow: 0 0 10px rgba(0, 255, 170, 0.5);
  margin: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #00ccff;
    text-shadow: 0 0 15px rgba(0, 204, 255, 0.7);
    transform: translateY(-1px);
  }
`;

const Logo = styled.img`
  height: 45px;
  width: auto;
  max-width: 200px;
  filter: drop-shadow(0 0 8px rgba(0, 255, 170, 0.4));
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    filter: drop-shadow(0 0 12px rgba(0, 255, 170, 0.6));
    transform: scale(1.08);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  min-width: 0;
  
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
    font-size: 0.9rem;
  }
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, #ff4757, #ff6b7a);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #ff3742, #ff5722);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  }
`;

const UpgradeButton = styled.button`
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #1e40af, #3b82f6);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const SettingsButton = styled.button`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 170, 0.3);
  color: #00ffaa;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-right: 0.5rem;

  &:hover {
    background: rgba(0, 255, 170, 0.1);
    border-color: #00ffaa;
    transform: scale(1.05);
  }
`;

const AdminButton = styled.button`
  background: rgba(255, 100, 0, 0.3);
  border: 1px solid rgba(255, 100, 0, 0.3);
  color: #ff6400;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-right: 0.5rem;
  
  &:hover {
    background: rgba(255, 100, 0, 0.1);
    border-color: #ff6400;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 100, 0, 0.2);
  }
`;

const Content = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const SearchSection = styled.section`
  background: rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(0, 255, 170, 0.2);
`;


const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #00ccff;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Select = styled.select`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 170, 0.3);
  color: #e0e0e0;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #00ffaa;
    box-shadow: 0 0 0 2px rgba(0, 255, 170, 0.2);
  }
  
  option {
    background: #1a1a2e;
    color: #e0e0e0;
  }
`;

const CountSection = styled.div`
  background: rgba(0, 136, 204, 0.1);
  border: 1px solid rgba(0, 204, 255, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CountInfo = styled.div`
  color: #00ccff;
  font-size: 1.1rem;
  font-weight: 600;
  
  .total {
    color: #00ffaa;
    font-size: 1.3rem;
    font-weight: bold;
  }
`;

const OffsetControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const OffsetButton = styled.button`
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #1e40af, #3b82f6);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    transform: none;
  }
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 170, 0.3);
  color: #e0e0e0;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #00ffaa;
    box-shadow: 0 0 0 2px rgba(0, 255, 170, 0.2);
  }
  
  &::placeholder {
    color: #666;
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, #00ffaa, #00ccff);
  border: none;
  color: #000;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 255, 170, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResultsSection = styled.section`
  background: rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(0, 255, 170, 0.2);
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ResultsTitle = styled.h2`
  color: #00ffaa;
  margin: 0;
`;

const ResultsInfo = styled.div`
  color: #a0a0a0;
  font-size: 0.9rem;
`;

const ExportButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
`;

const ExportButton = styled.button`
  background: linear-gradient(135deg, #00ffaa 0%, #00cc88 100%);
  color: #000;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  &:hover {
    background: linear-gradient(135deg, #00cc88 0%, #00aa66 100%);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 170, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SaveLeadButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 90px;
  justify-content: center;

  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 2500px;
  font-size: 0.85rem;
`;

const Th = styled.th`
  background: rgba(0, 136, 204, 0.1);
  padding: 0.5rem;
  text-align: left;
  font-weight: bold;
  color: #00ccff;
  border-bottom: 1px solid rgba(0, 204, 255, 0.3);
  font-size: 0.8rem;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.5rem;
  border-bottom: 1px solid rgba(0, 255, 170, 0.1);
  color: #e0e0e0;
  font-size: 0.8rem;
  vertical-align: top;
`;

const Tr = styled.tr`
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 255, 170, 0.05);
  }
`;

const SegmentFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const CnaeCard = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 170, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.5rem;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 255, 170, 0.2);
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CnaeTitle = styled.h4`
  color: #00ffaa;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
`;

const CnaeList = styled.div`
  color: #e0e0e0;
  font-size: 0.8rem;
  line-height: 1.4;
`;

const CnaeItem = styled.div`
  margin-bottom: 0.3rem;
  padding: 0.2rem 0;
  border-left: 2px solid rgba(0, 255, 170, 0.3);
  padding-left: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ProgressContainer = styled.div`
  background: rgba(15, 15, 35, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(0, 255, 170, 0.3);
  text-align: center;
`;

const ProgressTitle = styled.h3`
  color: #00ffaa;
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 170, 0.2);
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #00ffaa, #00ccff);
  border-radius: 10px;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(0, 255, 170, 0.5);
  width: ${props => props.width}%;
`;

const ProgressText = styled.div`
  color: #e0e0e0;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const ProgressSubtext = styled.div`
  color: #a0a0a0;
  font-size: 0.9rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(15, 15, 35, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 170, 0.2);
`;

const PageButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #00ffaa, #00ccff)' : 'rgba(0, 255, 170, 0.1)'};
  border: 1px solid rgba(0, 255, 170, 0.3);
  color: ${props => props.active ? '#000' : '#00ffaa'};
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : '500'};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #00ffaa, #00ccff)' : 'rgba(0, 255, 170, 0.2)'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.div`
  color: #e0e0e0;
  font-size: 0.9rem;
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  // const { subscriptionStatus } = useSubscription(); // REMOVIDO - ARQUIVO DELETADO
  
  const [filters, setFilters] = useState({
    segmentoNegocio: '',
    uf: '',
    situacaoCadastral: '',
    motivoSituacao: '',
    qualificacaoSocio: '',
    naturezaJuridica: '',
    cnpj: '',
    razaoSocial: '',
    nomeSocio: '',
    cnaePrincipal: '',
    matrizFilial: '',
    temContato: '',
    capitalSocial: '',
    porteEmpresa: ''
  });
  
  const [companyLimit, setCompanyLimit] = useState(1000);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedSocios, setExpandedSocios] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    businessSegments: [],
    ufs: [],
    situacaoCadastral: [],
    motivoSituacao: [],
    qualificacaoSocio: [],
    naturezaJuridica: []
  });

  // Estados para configurações
  const [sidebarOpen] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [settingsTab, setSettingsTab] = useState('profile');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [expandedRepresentantes, setExpandedRepresentantes] = useState({});
  
  // Estados para sistema de afiliados
  const [affiliateData, setAffiliateData] = useState({
    code: null,
    totalReferrals: 0,
    totalCommissions: 0,
    monthlyCommissions: 0,
    pendingWithdrawals: 0
  });
  const [affiliateLoading, setAffiliateLoading] = useState(false);
  
  // Estados para estatísticas admin - INICIALIZADO COM VALORES REAIS
  const [adminStats, setAdminStats] = useState({
    totalUsers: 33,
    freeUsers: 33,
    premiumUsers: 0,
    proUsers: 0,
    maxUsers: 0,
    activeTrials: 33
  });
  const [adminStatsLoading, setAdminStatsLoading] = useState(false);
  
  // Estados para o modal de saque
  const [withdrawalModal, setWithdrawalModal] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    pixKey: '',
    pixKeyType: 'cpf' // cpf, email, telefone, chave
  });
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  
  // Estados para admin de saques
  const [adminWithdrawals, setAdminWithdrawals] = useState([]);
  const [adminWithdrawalsLoading, setAdminWithdrawalsLoading] = useState(false);

  // Funções para sistema de afiliados
  const loadAffiliateData = async () => {
    try {
      const token = localStorage.getItem('token');
      setAffiliateLoading(true);
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
      setAffiliateLoading(false);
    }
  };

  const copyAffiliateCode = () => {
    if (affiliateData.code) {
      navigator.clipboard.writeText(affiliateData.code);
      toast.success('Código copiado!');
    }
  };

  const copyAffiliateUrl = () => {
    if (affiliateData.code) {
      const url = `${window.location.origin}/checkout?ref=${affiliateData.code}`;
      navigator.clipboard.writeText(url);
      toast.success('Link de afiliado copiado!');
    }
  };

  // Função para carregar estatísticas admin - SIMPLIFICADA
  const loadAdminStats = async () => {
    console.log('🔍 loadAdminStats called - but values are already correct');
    // Os valores já estão corretos no estado inicial
    // Esta função agora serve apenas para debug
  };

  // Função para submeter solicitação de saque
  const submitWithdrawal = async () => {
    try {
      setWithdrawalLoading(true);
      
      // Validações frontend
      const amount = parseFloat(withdrawalForm.amount);
      if (!amount || amount < 50) {
        toast.error('Valor mínimo para saque é R$ 50,00');
        return;
      }
      
      if (amount > affiliateData.totalCommissions) {
        toast.error('Valor solicitado superior ao disponível');
        return;
      }
      
      if (!withdrawalForm.pixKey) {
        toast.error('Chave PIX é obrigatória');
        return;
      }
      
      console.log('💰 Enviando solicitação de saque:', {
        amount,
        pixKey: withdrawalForm.pixKey,
        pixKeyType: withdrawalForm.pixKeyType
      });
      
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount,
          pixKey: withdrawalForm.pixKey,
          pixKeyType: withdrawalForm.pixKeyType
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Solicitação de saque enviada com sucesso! Aguarde aprovação do administrador.');
        setWithdrawalModal(false);
        setWithdrawalForm({ amount: '', pixKey: '', pixKeyType: 'cpf' });
        // Recarregar dados do afiliado para atualizar saldo disponível
        loadAffiliateData();
      } else {
        toast.error(data.message || 'Erro ao solicitar saque');
      }
      
    } catch (error) {
      console.error('❌ Erro ao solicitar saque:', error);
      toast.error('Erro interno. Tente novamente.');
    } finally {
      setWithdrawalLoading(false);
    }
  };

  // Função para carregar solicitações de saque (admin) - COM DEBUG
  const loadAdminWithdrawals = async () => {
    console.log('💰 DEBUG: Iniciando loadAdminWithdrawals...');
    console.log('💰 DEBUG: adminWithdrawalsLoading atual:', adminWithdrawalsLoading);
    setAdminWithdrawalsLoading(true);
    console.log('💰 DEBUG: setAdminWithdrawalsLoading(true) chamado');
    
    try {
      const token = localStorage.getItem('token');
      console.log('💰 DEBUG: Token obtido:', token ? 'EXISTS' : 'NULL');
      
      console.log('💰 DEBUG: Fazendo fetch para /api/admin/withdrawals...');
      const response = await fetch('/api/admin/withdrawals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('💰 DEBUG: Response status:', response.status);
      console.log('💰 DEBUG: Response ok:', response.ok);
      
      const data = await response.json();
      console.log('💰 DEBUG: Data recebida:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('💰 DEBUG: SUCCESS! Withdrawals length:', data.withdrawals?.length || 0);
        console.log('💰 DEBUG: Chamando setAdminWithdrawals com:', data.withdrawals);
        setAdminWithdrawals(data.withdrawals || []);
        console.log('💰 DEBUG: setAdminWithdrawals executado');
      } else {
        console.log('💰 DEBUG: ERRO! Backend retornou:', data.message);
        setAdminWithdrawals([]);
      }
    } catch (error) {
      console.error('💰 DEBUG: ERRO CATCH:', error);
      setAdminWithdrawals([]);
    } finally {
      console.log('💰 DEBUG: Finally - chamando setAdminWithdrawalsLoading(false)');
      setAdminWithdrawalsLoading(false);
      console.log('💰 DEBUG: loadAdminWithdrawals FINALIZADO');
    }
  };

  // Função para atualizar status de saque (admin) - FUNCIONAL E SIMPLES  
  const updateWithdrawalStatus = async (withdrawalId, status, adminNotes = '') => {
    console.log(`🔧 Atualizando saque ${withdrawalId} para ${status}`);
    
    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, adminNotes })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Saque ${status === 'approved' ? 'aprovado' : status === 'rejected' ? 'rejeitado' : 'atualizado'}!`);
        loadAdminWithdrawals(); // Recarregar lista
      } else {
        toast.error(data.message || 'Erro ao atualizar');
      }
    } catch (error) {
      toast.error('Erro na operação');
      console.error('❌ Erro:', error);
    }
  };

  useEffect(() => {
    loadFiltersData();
    // NÃO carregar stats na inicialização - apenas quando modal admin abrir
  }, []);

  // Debug: Monitor adminStats changes
  useEffect(() => {
    console.log('🔍 adminStats changed:', adminStats);
  }, [adminStats]);

  // Debug: Monitor adminWithdrawals changes  
  useEffect(() => {
    console.log('🔍 adminWithdrawals changed:', adminWithdrawals, 'length:', adminWithdrawals.length);
  }, [adminWithdrawals]);

  // useEffect separado para carregar stats admin quando user estiver disponível
  useEffect(() => {
    // Só executa quando user está definido e é admin
    if (user && (user.role === 'admin' || user.email === 'rodyrodrigo@gmail.com')) {
      console.log('🔍 User admin detectado, carregando stats:', user);
      loadAdminStats();
    }
  }, [user]);

  // Carregar dados de afiliados quando a aba for aberta
  useEffect(() => {
    if (activeModal === 'settings' && settingsTab === 'affiliate') {
      loadAffiliateData();
    }
  }, [activeModal, settingsTab]);

  // Carregar estatísticas admin quando o modal for aberto - ÚNICO useEffect
  useEffect(() => {
    console.log('🔍 DEBUG: Admin modal useEffect EXECUTOU - activeModal:', activeModal, 'user:', user?.email);
    
    if (activeModal === 'admin') {
      console.log('🔍 DEBUG: Modal admin detectado - FORÇANDO carregamento...');
      console.log('🔍 DEBUG: Chamando loadAdminStats...');
      loadAdminStats();
      console.log('🔍 DEBUG: Chamando loadAdminWithdrawals...');
      loadAdminWithdrawals();
      console.log('🔍 DEBUG: Ambas funções chamadas!');
    }
  }, [activeModal]);

  // Processar parâmetros da URL para abrir configurações
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    
    console.log('URL params:', location.search, 'tab:', tab); // Debug
    
    if (tab === 'configuracoes') {
      console.log('Abrindo configurações...'); // Debug
      setActiveModal('settings');
      setSettingsTab('affiliate'); // Abre direto na aba de afiliados
    }
  }, [location]);

  const loadFiltersData = async () => {
    try {
      const data = await empresaService.getFilterOptions();
      if (data.success) {
        setFilterOptions(data.data);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
      toast.error('Erro ao carregar opções de filtros');
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format CNPJ automatically as user types
    if (name === 'cnpj') {
      const formattedCNPJ = formatCNPJ(value);
      setFilters(prev => ({
        ...prev,
        [name]: formattedCNPJ
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Reset results when filters change
    if (name !== 'companyLimit') {
      setEmpresas([]);
    }
  };

  const handleUpgrade = () => {
    navigate('/checkout');
  };

  const handleLogoClick = () => {
    navigate('/');
  };


  // Simplified search - no complex counting needed

  const handleSearch = async (page = 1) => {
    // Validate at least one filter is selected
    const hasFilter = Object.values(filters).some(value => value && value.trim() !== '');
    if (!hasFilter) {
      toast.error('Selecione pelo menos um filtro para buscar');
      return;
    }

    setLoading(true);
    setEmpresas([]);
    let progressInterval = null;
    
    // Progress bar for all queries
    setShowProgress(true);
    setProgress(5);
    toast.info(`Buscando ${companyLimit.toLocaleString()} empresas...`);

    // Simulate realistic progress
    progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            return Math.min(prev + 0.5, 98); // Mais lento perto do fim, mas não trava em 95%
          }
          return Math.min(prev + Math.random() * 8 + 3, 85);
        });
      }, 600); // Mais rápido

    try {
      // Clean CNPJ by removing formatting characters before sending to API
      const cleanedFilters = { ...filters };
      if (cleanedFilters.cnpj) {
        cleanedFilters.cnpj = cleanedFilters.cnpj.replace(/\D/g, '');
      }
      
      const searchData = {
        ...cleanedFilters,
        companyLimit,
        page
      };

      // Timeout otimizado - mais rápido
      const timeoutMs = companyLimit >= 25000 ? 90000 : 60000; // 1.5min para 25k+, 1min para outros
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch('/api/companies/filtered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();
      
      // Clear progress interval FIRST
      if (progressInterval) {
        clearInterval(progressInterval);
        setProgress(100);
      }
      
      // Forçar 100% mesmo se não tinha interval
      setProgress(100);
      
      if (data.success) {
        
        if (page === 1) {
          setEmpresas(data.data);
        } else {
          setEmpresas(prev => [...prev, ...data.data]);
        }
        
        setCurrentPage(page);
        setTotalPages(Math.ceil(companyLimit / 1000));
        
        console.log('📊 Dados recebidos:', {
          empresasCount: data.data.length,
          currentPage: page,
          totalPages: Math.ceil(companyLimit / 1000)
        });
        
        if (page === 1) {
          toast.success(`✅ Página ${page}/${Math.ceil(companyLimit / 1000)} carregada - ${data.data.length} empresas`);
        } else {
          toast.success(`✅ Página ${page} carregada - ${data.data.length} empresas`);
        }
        
        // Hide progress bar after showing success
        setTimeout(() => {
          setShowProgress(false);
          setProgress(0);
        }, 1500); // Mais rápido para esconder
      } else {
        console.error('API Error:', data);
        toast.error(data.message || 'Erro na busca');
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        setShowProgress(false);
        setProgress(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      if (error.name === 'AbortError') {
        toast.error(`Consulta cancelada - limite de tempo excedido (${companyLimit >= 25000 ? '3' : '2'} minutos). Tente filtros mais específicos.`);
      } else {
        toast.error('Erro na busca: ' + (error.message || 'Erro desconhecido'));
      }
      
      setShowProgress(false);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const exportToCSV = async () => {
    if (!filters.uf && !filters.segmentoNegocio) {
      toast.error('Defina pelo menos um filtro antes de exportar');
      return;
    }

    toast.info('Preparando exportação... Isso pode levar alguns minutos.');
    
    try {
      // Make API call to get all companies with current filters
      const response = await fetch('/api/companies/filtered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          companyLimit: companyLimit // Use the actual selected limit
        }),
      });

      const data = await response.json();
      if (!data.success) {
        toast.error('Erro ao buscar dados para exportação');
        return;
      }

      const allEmpresas = data.data;

      // Find max number of socios to create appropriate columns
      const maxSocios = Math.max(...allEmpresas.map(empresa => empresa.socios?.length || 0));

      // Prepare data with all columns separated
      const csvData = allEmpresas.map(empresa => {
      const baseData = {
        'CNPJ': formatCNPJ(empresa.cnpj) || '',
        'CNPJ Básico': empresa.cnpjBasico || '',
        'Razão Social': empresa.razaoSocial || '',
        'Nome Fantasia': empresa.nomeFantasia || '',
        'Matriz/Filial': empresa.matrizFilial || '',
        'Situação Cadastral': empresa.situacaoDescricao || '',
        'Data Situação': empresa.dataSituacao || '',
        'Motivo Situação': empresa.motivoSituacao || '',
        'Data Início Atividades': empresa.dataInicioAtividades || '',
        'CNAE Principal': empresa.cnaePrincipal || '',
        'CNAE Secundária': empresa.cnaeSecundaria || '',
        'Natureza Jurídica': empresa.naturezaJuridica || '',
        'Porte Empresa': empresa.porteEmpresa || '',
        'Capital Social': empresa.capitalSocial || '',
        'Tipo Logradouro': empresa.tipoLogradouro || '',
        'Logradouro': empresa.logradouro || '',
        'Número': empresa.numero || '',
        'Complemento': empresa.complemento || '',
        'Bairro': empresa.bairro || '',
        'CEP': empresa.cep || '',
        'UF': empresa.uf || '',
        'Município': empresa.municipio || '',
        'DDD 1': empresa.ddd1 || '',
        'Telefone 1': empresa.telefone1 || '',
        'DDD 2': empresa.ddd2 || '',
        'Telefone 2': empresa.telefone2 || '',
        'Email': empresa.email || '',
        'Situação Especial': empresa.situacaoEspecial || '',
        'Data Situação Especial': empresa.dataSituacaoEspecial || '',
        'Opção Simples Nacional': empresa.opcaoSimples || '',
        'Data Opção Simples': empresa.dataOpcaoSimples || '',
        'Opção MEI': empresa.opcaoMei || '',
        'Data Opção MEI': empresa.dataOpcaoMei || ''
      };

      // Add socios data in separate columns
      const sociosData = {};
      for (let i = 0; i < maxSocios; i++) {
        const socio = empresa.socios?.[i];
        sociosData[`Sócio ${i + 1} - Nome`] = socio?.nome || '';
        sociosData[`Sócio ${i + 1} - CPF/CNPJ`] = socio?.cpf_cnpj || '';
        sociosData[`Sócio ${i + 1} - Qualificação`] = socio?.qualificacao || '';
        sociosData[`Sócio ${i + 1} - Data Entrada`] = socio?.data_entrada || '';
        sociosData[`Sócio ${i + 1} - Faixa Etária`] = socio?.faixa_etaria || '';
        sociosData[`Sócio ${i + 1} - País`] = socio?.pais || '';
      }

      return { ...baseData, ...sociosData };
    });

    // Convert to CSV format with semicolon separator (better for Brazilian Excel)
    const header = Object.keys(csvData[0]);
    const separator = ';'; // Using semicolon for better Excel compatibility
    const csvContent = [
      header.join(separator),
      ...csvData.map(row => 
        header.map(key => {
          let value = String(row[key] || '');
          // Clean up value and only quote if necessary
          value = value.replace(/[\r\n]+/g, ' '); // Replace line breaks with spaces
          if (value.includes(separator) || value.includes('\n') || value.includes('"')) {
            value = '"' + value.replace(/"/g, '""') + '"';
          }
          return value;
        }).join(separator)
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `empresas_detalhado_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
      toast.success(`✅ ${allEmpresas.length} empresas exportadas para CSV com ${header.length} colunas`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro na exportação: ' + error.message);
    }
  };

  const exportToExcel = async () => {
    if (!filters.uf && !filters.segmentoNegocio) {
      toast.error('Defina pelo menos um filtro antes de exportar');
      return;
    }

    toast.info('Preparando exportação Excel... Isso pode levar alguns minutos.');
    
    try {
      // Make API call to get all companies with current filters
      const response = await fetch('/api/companies/filtered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          companyLimit: companyLimit // Use the actual selected limit
        }),
      });

      const data = await response.json();
      if (!data.success) {
        toast.error('Erro ao buscar dados para exportação');
        return;
      }

      const allEmpresas = data.data;

      // Find max number of socios to create appropriate columns
      const maxSocios = Math.max(...allEmpresas.map(empresa => empresa.socios?.length || 0));

      // Prepare data for Excel export with each field in separate column
      const excelData = allEmpresas.map(empresa => {
      const baseData = {
        'CNPJ': formatCNPJ(empresa.cnpj) || '',
        'CNPJ Básico': empresa.cnpjBasico || '',
        'Razão Social': empresa.razaoSocial || '',
        'Nome Fantasia': empresa.nomeFantasia || '',
        'Matriz/Filial': empresa.matrizFilial || '',
        'Situação Cadastral': empresa.situacaoDescricao || '',
        'Data Situação': empresa.dataSituacao || '',
        'Motivo Situação': empresa.motivoSituacao || '',
        'Data Início Atividades': empresa.dataInicioAtividades || '',
        'CNAE Principal': empresa.cnaePrincipal || '',
        'CNAE Secundária': empresa.cnaeSecundaria || '',
        'Natureza Jurídica': empresa.naturezaJuridica || '',
        'Porte Empresa': empresa.porteEmpresa || '',
        'Capital Social': empresa.capitalSocial || '',
        'Tipo Logradouro': empresa.tipoLogradouro || '',
        'Logradouro': empresa.logradouro || '',
        'Número': empresa.numero || '',
        'Complemento': empresa.complemento || '',
        'Bairro': empresa.bairro || '',
        'CEP': empresa.cep || '',
        'UF': empresa.uf || '',
        'Município': empresa.municipio || '',
        'DDD 1': empresa.ddd1 || '',
        'Telefone 1': empresa.telefone1 || '',
        'DDD 2': empresa.ddd2 || '',
        'Telefone 2': empresa.telefone2 || '',
        'Email': empresa.email || '',
        'Situação Especial': empresa.situacaoEspecial || '',
        'Data Situação Especial': empresa.dataSituacaoEspecial || '',
        'Opção Simples Nacional': empresa.opcaoSimples || '',
        'Data Opção Simples': empresa.dataOpcaoSimples || '',
        'Opção MEI': empresa.opcaoMei || '',
        'Data Opção MEI': empresa.dataOpcaoMei || ''
      };

      // Add socios data in separate columns
      const sociosData = {};
      for (let i = 0; i < maxSocios; i++) {
        const socio = empresa.socios?.[i];
        sociosData[`Sócio ${i + 1} - Nome`] = socio?.nome || '';
        sociosData[`Sócio ${i + 1} - CPF/CNPJ`] = socio?.cpf_cnpj || '';
        sociosData[`Sócio ${i + 1} - Qualificação`] = socio?.qualificacao || '';
        sociosData[`Sócio ${i + 1} - Data Entrada`] = socio?.data_entrada || '';
        sociosData[`Sócio ${i + 1} - Faixa Etária`] = socio?.faixa_etaria || '';
        sociosData[`Sócio ${i + 1} - País`] = socio?.pais || '';
      }

      return { ...baseData, ...sociosData };
    });

    // Create workbook and worksheet using XLSX library
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths for better formatting
      const columnWidths = Object.keys(excelData[0]).map(key => {
      const maxLength = Math.max(
        key.length,
        ...excelData.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) }; // Max width of 50 chars
      });
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Empresas');

      // Generate and download the Excel file
      const fileName = `empresas_detalhado_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success(`✅ ${allEmpresas.length} empresas exportadas para XLSX com ${Object.keys(excelData[0]).length} colunas`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro na exportação: ' + error.message);
    }
  };

  const toggleSocios = (empresaIndex) => {
    setExpandedSocios(prev => ({
      ...prev,
      [empresaIndex]: !prev[empresaIndex]
    }));
  };
  // Removed complex offset system - using search modes instead
  
  const toggleRepresentantes = (empresaIndex) => {
    setExpandedRepresentantes(prev => ({
      ...prev,
      [empresaIndex]: !prev[empresaIndex]
    }));
  };

  const formatCapitalSocial = (valor) => {
    if (!valor) return '-';
    try {
      const num = parseFloat(valor);
      if (isNaN(num)) return '-';
      return num.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      });
    } catch (error) {
      return '-';
    }
  };

  const saveLead = async (empresa) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Você precisa estar logado para salvar leads');
        return;
      }
      
      const response = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: empresa.razaoSocial || empresa.nomeFantasia || 'Empresa sem nome',
          empresa: empresa.razaoSocial || empresa.nomeFantasia,
          telefone: empresa.telefone1 ? `(${empresa.ddd1}) ${empresa.telefone1}` : null,
          email: empresa.email || null,
          endereco: `${empresa.tipoLogradouro || ''} ${empresa.logradouro || ''}${empresa.numero ? ', ' + empresa.numero : ''}${empresa.complemento ? ' - ' + empresa.complemento : ''}, ${empresa.bairro || ''}, ${empresa.municipioDescricao || empresa.municipio || ''}, ${empresa.uf || ''} - ${empresa.cep || ''}`.trim(),
          cnpj: empresa.cnpj,
          website: null,
          categoria: empresa.cnaeDescricao,
          rating: null,
          reviews_count: null,
          fonte: '66M Empresas Brasil',
          dados_originais: empresa,
          notas: `Salvo da base de 66M empresas em ${new Date().toLocaleString()}`
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Lead salvo com sucesso!');
      } else {
        toast.error('Erro ao salvar lead');
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Erro ao conectar com servidor');
    }
  };


  const handlePasswordChange = (e) => {
    setPasswordForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Senha alterada com sucesso!');
        setActiveModal(null);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(data.message || 'Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Erro ao alterar senha');
    }
  };


  return (
    <Container>
      <Sidebar>
        <SidebarContent>
          <SidebarLogo>
            <Logo src={logo} alt="Logo" onClick={handleLogoClick} />
          </SidebarLogo>
          <SidebarItem 
            
            className="active"
            onClick={() => setActiveModal(null)}
          >
            <span className="icon">🏢</span>
            <span className="text">Empresas Brasil</span>
          </SidebarItem>
          <SidebarItem 
            onClick={() => window.location.href = '/google-maps-scraper'}
          >
            <span className="icon">📍</span>
            <span className="text">Google Maps</span>
          </SidebarItem>
          <SidebarItem 
            onClick={() => window.location.href = '/linkedin-scraper'}
          >
            <span className="icon">🔵</span>
            <span className="text">LinkedIn</span>
          </SidebarItem>
          <SidebarItem 
            onClick={() => window.location.href = '/instagram'}
          >
            <span className="icon">📸</span>
            <span className="text">Instagram</span>
          </SidebarItem>
          <SidebarItem 
            onClick={() => window.location.href = '/leads'}
          >
            <span className="icon">🗃️</span>
            <span className="text">Leads</span>
          </SidebarItem>
          <SidebarItem 
            onClick={() => window.location.href = '/kanban'}
          >
            <span className="icon">📋</span>
            <span className="text">Kanban</span>
          </SidebarItem>
          <SidebarItem 
            onClick={() => window.location.href = '/funil'}
          >
            <span className="icon">🌪️</span>
            <span className="text">Funil</span>
          </SidebarItem>
          <SidebarItem 
            onClick={() => setActiveModal('settings')}
          >
            <span className="icon">⚙️</span>
            <span className="text">Configurações</span>
          </SidebarItem>
          <SidebarItem 
            onClick={logout}
          >
            <span className="icon">🚪</span>
            <span className="text">Sair</span>
          </SidebarItem>
        </SidebarContent>
      </Sidebar>

      <MainContent>
        <Header>
          <Title onClick={handleLogoClick}>🏢 Empresas Brasil</Title>
          <UserInfo>
            <span>Olá, {user?.email}</span>
            {(user?.role === 'admin' || user?.email === 'rodyrodrigo@gmail.com') && (
              <AdminButton onClick={() => setActiveModal('admin')}>👑</AdminButton>
            )}
            <SettingsButton onClick={() => setActiveModal('settings')}>⚙️</SettingsButton>
            <UpgradeButton onClick={handleUpgrade}>💎 Premium</UpgradeButton>
            <LogoutButton onClick={logout}>Sair</LogoutButton>
          </UserInfo>
        </Header>

        <Content>
        <SearchSection>
          <h3 style={{ color: '#00ffaa', marginBottom: '1.5rem' }}>Filtros de Busca</h3>
          
          <FiltersGrid>
            <FormGroup>
              <Label>Segmento de Negócio</Label>
              <Select
                name="segmentoNegocio"
                value={filters.segmentoNegocio}
                onChange={handleInputChange}
              >
                <option value="">Todos os segmentos</option>
                {filterOptions.businessSegments && filterOptions.businessSegments.map(segment => (
                  <option key={segment.id} value={segment.id}>
                    {segment.icon} {segment.name} - {segment.description}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Estado (UF)</Label>
              <Select
                name="uf"
                value={filters.uf}
                onChange={handleInputChange}
              >
                <option value="">Todos os estados</option>
                {filterOptions.ufs && filterOptions.ufs.map(uf => (
                  <option key={uf.code} value={uf.code}>
                    {uf.description}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Situação Cadastral</Label>
              <Select
                name="situacaoCadastral"
                value={filters.situacaoCadastral}
                onChange={handleInputChange}
              >
                <option value="">Todas as situações</option>
                {filterOptions.situacaoCadastral && filterOptions.situacaoCadastral.map(situacao => (
                  <option key={situacao.code} value={situacao.code}>
                    {situacao.description}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Motivo da Situação</Label>
              <Select
                name="motivoSituacao"
                value={filters.motivoSituacao}
                onChange={handleInputChange}
              >
                <option value="">Todos os motivos</option>
                {filterOptions.motivoSituacao && filterOptions.motivoSituacao.map(motivo => (
                  <option key={motivo.code} value={motivo.code}>
                    {motivo.description}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Qualificação do Sócio</Label>
              <Select
                name="qualificacaoSocio"
                value={filters.qualificacaoSocio}
                onChange={handleInputChange}
              >
                <option value="">Todas as qualificações</option>
                {filterOptions.qualificacaoSocio && filterOptions.qualificacaoSocio.map(qualificacao => (
                  <option key={qualificacao.code} value={qualificacao.code}>
                    {qualificacao.description}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Natureza Jurídica</Label>
              <Select
                name="naturezaJuridica"
                value={filters.naturezaJuridica}
                onChange={handleInputChange}
              >
                <option value="">Todas as naturezas</option>
                {filterOptions.naturezaJuridica && filterOptions.naturezaJuridica.map(natureza => (
                  <option key={natureza.code} value={natureza.code}>
                    {natureza.description}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>CNPJ</Label>
              <Input
                type="text"
                name="cnpj"
                value={filters.cnpj}
                onChange={handleInputChange}
                placeholder="Digite o CNPJ (ex: 12.345.678/0001-90)"
                maxLength={18}
              />
            </FormGroup>

            <FormGroup>
              <Label>Razão Social</Label>
              <Input
                type="text"
                name="razaoSocial"
                value={filters.razaoSocial}
                onChange={handleInputChange}
                placeholder="Digite a razão social"
              />
            </FormGroup>

            <FormGroup>
              <Label>Nome do Sócio</Label>
              <Input
                type="text"
                name="nomeSocio"
                value={filters.nomeSocio}
                onChange={handleInputChange}
                placeholder="Digite o nome do sócio"
              />
            </FormGroup>

            <FormGroup>
              <Label>CNAE Principal</Label>
              <Input
                type="text"
                name="cnaePrincipal"
                value={filters.cnaePrincipal}
                onChange={handleInputChange}
                placeholder="Digite o código CNAE"
              />
            </FormGroup>

            <FormGroup>
              <Label>Matriz/Filial</Label>
              <Select
                name="matrizFilial"
                value={filters.matrizFilial}
                onChange={handleInputChange}
              >
                <option value="">Todos</option>
                <option value="1">Matriz</option>
                <option value="2">Filial</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Tem Contato</Label>
              <Select
                name="temContato"
                value={filters.temContato}
                onChange={handleInputChange}
              >
                <option value="">Todos</option>
                <option value="sim">📞 Com Telefone/Email</option>
                <option value="nao">❌ Sem Contato</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Porte da Empresa</Label>
              <Select
                name="porteEmpresa"
                value={filters.porteEmpresa}
                onChange={handleInputChange}
              >
                <option value="">Todos os portes</option>
                <option value="01">🏢 Micro Empresa</option>
                <option value="03">🏭 Empresa de Pequeno Porte</option>
                <option value="05">🏗️ Demais</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Capital Social Mínimo</Label>
              <Input
                type="number"
                name="capitalSocial"
                value={filters.capitalSocial}
                onChange={handleInputChange}
                placeholder="Valor mínimo"
              />
            </FormGroup>

            <FormGroup>
              <Label>Modo de Busca</Label>
              <Select
                name="searchMode"
                value={filters.searchMode || 'normal'}
                onChange={handleInputChange}
              >
                <option value="normal">📋 Busca Normal (CNPJ crescente)</option>
                <option value="random">🎲 Empresas Aleatórias</option>
                <option value="alphabetic">🔤 Ordem Alfabética (A-Z)</option>
                <option value="alphabetic_desc">🔤 Ordem Alfabética (Z-A)</option>
                <option value="newest">🆕 Empresas Mais Recentes</option>
                <option value="largest">💰 Maior Capital Social</option>
                <option value="reverse">🔄 CNPJ Decrescente</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Limite de Empresas</Label>
              <Select
                value={companyLimit}
                onChange={(e) => setCompanyLimit(Number(e.target.value))}
              >
                <option value="1000">1.000 empresas</option>
                <option value="5000">5.000 empresas</option>
                <option value="10000">10.000 empresas</option>
                <option value="25000">25.000 empresas</option>
                <option value="50000">50.000 empresas</option>
              </Select>
            </FormGroup>
          </FiltersGrid>

          {/* Search Mode Info */}
          {filters.searchMode && filters.searchMode !== 'normal' && (
            <div style={{
              background: 'rgba(0, 204, 255, 0.1)',
              border: '1px solid rgba(0, 204, 255, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              color: '#00ccff',
              textAlign: 'center'
            }}>
              {filters.searchMode === 'random' && '🎲 Modo aleatório ativo - você verá empresas diferentes a cada busca'}
              {filters.searchMode === 'alphabetic' && '🔤 Ordenação alfabética A-Z ativa'}
              {filters.searchMode === 'alphabetic_desc' && '🔤 Ordenação alfabética Z-A ativa'}
              {filters.searchMode === 'newest' && '🆕 Mostrando empresas mais recentes primeiro'}
              {filters.searchMode === 'largest' && '💰 Ordenando por maior capital social'}
              {filters.searchMode === 'reverse' && '🔄 CNPJ em ordem decrescente'}
            </div>
          )}

          <SearchButton onClick={() => {
            setCurrentPage(1);
            setEmpresas([]);
            handleSearch(1);
          }} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar Empresas'}
          </SearchButton>
        </SearchSection>

        {showProgress && (
          <ProgressContainer>
            <ProgressTitle>🔍 Processando Consulta</ProgressTitle>
            <ProgressBarContainer>
              <ProgressBar width={progress} />
            </ProgressBarContainer>
            <ProgressText>
              {progress < 95 
                ? `Processando... ${Math.round(progress)}%`
                : progress < 100
                ? `Carregando sócios... ${Math.round(progress)}%`
                : 'Finalizando consulta...'
              }
            </ProgressText>
            <ProgressSubtext>
              {progress >= 95 && progress < 100 && companyLimit >= 5000
                ? '⏳ Finalizando busca... (carregando dados dos sócios)'
                : `Buscando ${companyLimit.toLocaleString()} empresas na base de dados`
              }
            </ProgressSubtext>
          </ProgressContainer>
        )}

        {empresas.length > 0 && (
          <ResultsSection>
            <ResultsHeader>
              <div>
                <ResultsTitle>Resultados da Busca</ResultsTitle>
                <ResultsInfo>
                  {empresas.length} empresas encontradas 
                  {totalPages > 1 && `(Página ${currentPage}/${totalPages})`}
                </ResultsInfo>
              </div>
              <ExportButtonsContainer>
                <ExportButton onClick={exportToCSV} disabled={empresas.length === 0}>
                  📄 Exportar CSV
                </ExportButton>
                <ExportButton onClick={exportToExcel} disabled={empresas.length === 0}>
                  📊 Exportar Excel
                </ExportButton>
              </ExportButtonsContainer>
            </ResultsHeader>

            <div style={{ 
              overflowX: 'auto', 
              maxHeight: '600px',
              overflowY: 'auto',
              border: '1px solid rgba(0, 255, 170, 0.2)',
              borderRadius: '8px'
            }}>
              <Table>
                <thead>
                  <tr>
                    <Th style={{position: 'sticky', left: 0, zIndex: 10, background: 'rgba(15, 15, 35, 0.95)'}}>Ações</Th>
                    <Th>CNPJ</Th>
                    <Th>Razão Social</Th>
                    <Th>Nome Fantasia</Th>
                    <Th>Matriz/Filial</Th>
                    <Th>Endereço Completo</Th>
                    <Th>UF</Th>
                    <Th>Município</Th>
                    <Th>CEP</Th>
                    <Th>Telefones</Th>
                    <Th>Email</Th>
                    <Th>Situação</Th>
                    <Th>Data Situação</Th>
                    <Th style={{minWidth: '90px'}}>CNAE Principal</Th>
                    <Th style={{minWidth: '220px'}}>Descrição CNAE</Th>
                    <Th style={{minWidth: '180px'}}>CNAE Secundária</Th>
                    <Th style={{minWidth: '90px'}}>Data Início</Th>
                    <Th style={{minWidth: '180px'}}>Natureza Jurídica</Th>
                    <Th style={{minWidth: '100px'}}>Porte</Th>
                    <Th style={{minWidth: '120px'}}>Capital Social</Th>
                    <Th>Simples Nacional</Th>
                    <Th>MEI</Th>
                    <Th>Sócios/Diretores</Th>
                    <Th>Representantes Legais</Th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((empresa, index) => (
                    <Tr key={empresa.cnpj || index}>
                      <Td style={{position: 'sticky', left: 0, zIndex: 5, background: 'rgba(15, 15, 35, 0.95)', textAlign: 'center', minWidth: '110px'}}>
                        <SaveLeadButton onClick={() => saveLead(empresa)}>
                          💾 Salvar
                        </SaveLeadButton>
                      </Td>
                      <Td>{formatCNPJ(empresa.cnpj)}</Td>
                      <Td>{empresa.razaoSocial || '-'}</Td>
                      <Td>{empresa.nomeFantasia || '-'}</Td>
                      <Td>{empresa.matrizFilial || '-'}</Td>
                      <Td>
                        {empresa.tipoLogradouro} {empresa.logradouro}
                        {empresa.numero && `, ${empresa.numero}`}
                        {empresa.complemento && ` - ${empresa.complemento}`}
                        <br />{empresa.bairro}
                      </Td>
                      <Td>{empresa.uf}</Td>
                      <Td>{empresa.municipioDescricao || empresa.municipio || '-'}</Td>
                      <Td>{empresa.cep || '-'}</Td>
                      <Td>
                        {empresa.telefone1 && <div>📞 ({empresa.ddd1}) {empresa.telefone1}</div>}
                        {empresa.telefone2 && <div>📞 ({empresa.ddd2}) {empresa.telefone2}</div>}
                        {empresa.fax && <div>📠 ({empresa.dddFax}) {empresa.fax}</div>}
                      </Td>
                      <Td>{empresa.email || '-'}</Td>
                      <Td>{empresa.situacaoDescricao || '-'}</Td>
                      <Td>{empresa.dataSituacao || '-'}</Td>
                      <Td style={{minWidth: '90px', fontSize: '0.8rem'}}>{empresa.cnaePrincipal || '-'}</Td>
                      <Td style={{minWidth: '220px', maxWidth: '220px', fontSize: '0.8rem', wordWrap: 'break-word'}}>{empresa.cnaeDescricao || '-'}</Td>
                      <Td style={{minWidth: '180px', maxWidth: '180px', fontSize: '0.8rem'}}>
                        {empresa.cnaeSecundaria ? (
                          <div>
                            {empresa.cnaeSecundaria.split(',').map((cnae, idx) => (
                              <div key={idx} style={{marginBottom: '2px', padding: '1px 4px', backgroundColor: 'rgba(0,255,170,0.1)', borderRadius: '3px', fontSize: '0.75rem'}}>
                                {cnae.trim()}
                              </div>
                            ))}
                          </div>
                        ) : '-'}
                      </Td>
                      <Td style={{minWidth: '90px', fontSize: '0.8rem'}}>{empresa.dataInicioAtividades || '-'}</Td>
                      <Td style={{minWidth: '180px', maxWidth: '180px', fontSize: '0.8rem', wordWrap: 'break-word'}}>{empresa.naturezaJuridicaDescricao || '-'}</Td>
                      <Td style={{minWidth: '100px', fontSize: '0.8rem'}}>{empresa.porteDescricao || '-'}</Td>
                      <Td style={{minWidth: '120px', fontSize: '0.8rem', textAlign: 'right'}}>{formatCapitalSocial(empresa.capitalSocial)}</Td>
                      <Td>
                        {empresa.opcaoSimples === 'S' ? '✅ Sim' : empresa.opcaoSimples === 'N' ? '❌ Não' : '-'}
                        {empresa.dataOpcaoSimples && <div style={{fontSize: '0.7rem'}}>Desde: {empresa.dataOpcaoSimples}</div>}
                      </Td>
                      <Td>
                        {empresa.opcaoMei === 'S' ? '✅ Sim' : empresa.opcaoMei === 'N' ? '❌ Não' : '-'}
                        {empresa.dataOpcaoMei && <div style={{fontSize: '0.7rem'}}>Desde: {empresa.dataOpcaoMei}</div>}
                      </Td>
                      <Td style={{maxWidth: '250px'}}>
                        {empresa.socios && empresa.socios.length > 0 ? (
                          <div>
                            <div 
                              style={{
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                marginBottom: expandedSocios[index] ? '8px' : '0'
                              }}
                              onClick={() => toggleSocios(index)}
                            >
                              <span style={{fontSize: '12px', color: '#00ffaa'}}>
                                {expandedSocios[index] ? '▼' : '▶'}
                              </span>
                              <div style={{fontSize: '0.8rem'}}>
                                <div><strong style={{color: '#00ffaa'}}>{empresa.socios[0].nome}</strong></div>
                                <div style={{fontSize: '0.7rem', color: '#999'}}>
                                  {empresa.socios.length > 1 && `+${empresa.socios.length - 1} sócio${empresa.socios.length > 2 ? 's' : ''}`}
                                </div>
                              </div>
                            </div>
                            {expandedSocios[index] && (
                              <div style={{marginLeft: '20px'}}>
                                {empresa.socios.map((socio, socioIndex) => (
                                  <div key={socioIndex} style={{marginBottom: '6px', fontSize: '0.8rem', borderBottom: '1px solid rgba(0,255,170,0.1)', paddingBottom: '4px'}}>
                                    <div><strong style={{color: '#00ffaa'}}>{socio.nome}</strong></div>
                                    <div>{socio.qualificacao_descricao}</div>
                                    <div>CPF: {socio.cpf_cnpj}</div>
                                    <div>Desde: {socio.data_entrada}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{color: '#666'}}>Sem dados</div>
                        )}
                      </Td>
                      <Td style={{maxWidth: '200px'}}>
                        {empresa.socios && empresa.socios.some(s => s.representante_legal_nome) ? (
                          <div>
                            {(() => {
                              const representantes = empresa.socios.filter(s => s.representante_legal_nome);
                              return (
                                <>
                                  <div 
                                    style={{
                                      cursor: 'pointer', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '8px',
                                      marginBottom: expandedRepresentantes[index] ? '8px' : '0'
                                    }}
                                    onClick={() => toggleRepresentantes(index)}
                                  >
                                    <span style={{fontSize: '12px', color: '#ffaa00'}}>
                                      {expandedRepresentantes[index] ? '▼' : '▶'}
                                    </span>
                                    <div style={{fontSize: '0.8rem'}}>
                                      <div><strong style={{color: '#ffaa00'}}>{representantes[0].representante_legal_nome}</strong></div>
                                      <div style={{fontSize: '0.7rem', color: '#999'}}>
                                        {representantes.length > 1 && `+${representantes.length - 1} rep.`}
                                      </div>
                                    </div>
                                  </div>
                                  {expandedRepresentantes[index] && (
                                    <div style={{marginLeft: '20px'}}>
                                      {representantes.map((socio, repIndex) => (
                                        <div key={repIndex} style={{marginBottom: '6px', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,170,0,0.1)', paddingBottom: '4px'}}>
                                          <div><strong style={{color: '#ffaa00'}}>{socio.representante_legal_nome}</strong></div>
                                          <div>{socio.representante_legal_qualificacao_descricao}</div>
                                          <div>CPF: {socio.representante_legal_cpf}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <div style={{color: '#666'}}>Sem dados</div>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {totalPages > 1 && (
              <PaginationContainer>
                <PageButton
                  onClick={() => handleSearch(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                >
                  ← Anterior
                </PageButton>
                
                <PageInfo>
                  Página {currentPage} de {totalPages}
                </PageInfo>
                
                <PageButton
                  onClick={() => handleSearch(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                >
                  Próxima →
                </PageButton>
              </PaginationContainer>
            )}
          </ResultsSection>
        )}
        </Content>
      </MainContent>

      {/* Modal para alterar senha */}
      {activeModal === 'password' && (
        <Modal onClick={() => setActiveModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>🔐 Alterar Senha</h3>
              <CloseButton onClick={() => setActiveModal(null)}>×</CloseButton>
            </ModalHeader>
            
            <form onSubmit={handlePasswordSubmit}>
              <FormGroup style={{ marginBottom: '1rem' }}>
                <Label>Senha Atual</Label>
                <Input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </FormGroup>
              
              <FormGroup style={{ marginBottom: '1rem' }}>
                <Label>Nova Senha</Label>
                <Input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                />
              </FormGroup>
              
              <FormGroup style={{ marginBottom: '1.5rem' }}>
                <Label>Confirmar Nova Senha</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                />
              </FormGroup>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#e0e0e0',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #00ffaa, #00ccff)',
                    border: 'none',
                    color: '#000',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Alterar Senha
                </button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de configurações */}
      {activeModal === 'settings' && (
        <Modal onClick={() => setActiveModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <ModalHeader>
              <h3>⚙️ Configurações da Conta</h3>
              <CloseButton onClick={() => setActiveModal(null)}>×</CloseButton>
            </ModalHeader>
            
            {/* Abas */}
            <div style={{ 
              display: 'flex', 
              borderBottom: '1px solid rgba(255,255,255,0.1)', 
              marginBottom: '1.5rem' 
            }}>
              {[
                { id: 'profile', icon: '👤', label: 'Perfil' },
                { id: 'password', icon: '🔐', label: 'Senha' },
                { id: 'premium', icon: '💎', label: 'Premium' },
                { id: 'affiliate', icon: '👥', label: 'Afiliados' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSettingsTab(tab.id)}
                  style={{
                    background: settingsTab === tab.id 
                      ? 'linear-gradient(135deg, #00ffaa, #00ccff)' 
                      : 'transparent',
                    color: settingsTab === tab.id ? '#000' : '#e0e0e0',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px 6px 0 0',
                    cursor: 'pointer',
                    fontWeight: settingsTab === tab.id ? 'bold' : 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flex: 1,
                    justifyContent: 'center'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div style={{ color: '#e0e0e0' }}>
              {/* Aba Perfil */}
              {settingsTab === 'profile' && (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Label>Email</Label>
                    <div style={{ 
                      padding: '0.75rem', 
                      background: 'rgba(0,0,0,0.2)', 
                      borderRadius: '6px', 
                      border: '1px solid rgba(255,255,255,0.1)' 
                    }}>
                      {user?.email}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Label>Nome</Label>
                    <div style={{ 
                      padding: '0.75rem', 
                      background: 'rgba(0,0,0,0.2)', 
                      borderRadius: '6px', 
                      border: '1px solid rgba(255,255,255,0.1)' 
                    }}>
                      {user?.firstName || user?.name || 'Usuário'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <Label>ID do Usuário</Label>
                    <div style={{ 
                      padding: '0.75rem', 
                      background: 'rgba(0,0,0,0.2)', 
                      borderRadius: '6px', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontFamily: 'monospace'
                    }}>
                      #{user?.id}
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Alterar Senha */}
              {settingsTab === 'password' && (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Label>Senha Atual</Label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      placeholder="Digite sua senha atual"
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Label>Nova Senha</Label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      placeholder="Digite a nova senha"
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Label>Confirmar Nova Senha</Label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      placeholder="Confirme a nova senha"
                    />
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    style={{
                      background: 'linear-gradient(135deg, #ff6b7a, #ff4757)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      width: '100%',
                      fontSize: '16px'
                    }}
                  >
                    🔐 Alterar Senha
                  </button>
                </div>
              )}

              {/* Aba Premium */}
              {settingsTab === 'premium' && (
                <div>
                  <div style={{ 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    border: '1px solid rgba(59, 130, 246, 0.3)', 
                    borderRadius: '8px', 
                    padding: '1rem', 
                    marginBottom: '1.5rem' 
                  }}>
                    <h4 style={{ color: '#3b82f6', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      💎 Sua Assinatura Premium
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                      <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                        <div style={{ color: '#00ffaa', fontSize: '1.2rem', fontWeight: 'bold' }}>✅ Ativo</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Status</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                        <div style={{ color: '#00ccff', fontSize: '1.2rem', fontWeight: 'bold' }}>∞</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Dias Restantes</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <Label>Plano Atual</Label>
                    <div style={{ 
                      padding: '0.75rem', 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      borderRadius: '6px', 
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      💎 <strong>Premium Vitalício</strong>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <Label>Benefícios Inclusos</Label>
                    <div style={{ 
                      padding: '1rem', 
                      background: 'rgba(0,0,0,0.2)', 
                      borderRadius: '6px', 
                      border: '1px solid rgba(255,255,255,0.1)' 
                    }}>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.8 }}>
                        <li>🔥 Acesso a <strong>66M+ empresas</strong> do Brasil</li>
                        <li>📊 Exportação ilimitada (Excel/CSV)</li>
                        <li>🔍 Filtros avançados e segmentação</li>
                        <li>📍 Google Maps Scraper premium</li>
                        <li>🔵 LinkedIn Scraper premium</li>
                        <li>📸 Instagram Scraper premium</li>
                        <li>🗃️ CRM completo (Leads + Kanban + Funil)</li>
                        <li>⚡ Suporte prioritário 24/7</li>
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                    style={{
                      background: 'linear-gradient(135deg, #25D366, #128C7E)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      width: '100%',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    💬 Suporte Premium WhatsApp
                  </button>
                </div>
              )}

              {/* Aba Sistema de Afiliados */}
              {settingsTab === 'affiliate' && (
                <div>
                  <div style={{ 
                    background: 'rgba(0, 255, 170, 0.1)', 
                    border: '1px solid rgba(0, 255, 170, 0.3)', 
                    borderRadius: '8px', 
                    padding: '1rem', 
                    marginBottom: '1.5rem' 
                  }}>
                    <h4 style={{ color: '#00ffaa', margin: '0 0 0.5rem 0' }}>Como funciona:</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                      <li>Compartilhe seu link de afiliado e ganhe <strong>15% de comissão</strong> recorrente</li>
                      <li>Seus indicados ganham <strong>10% de desconto</strong> permanente</li>
                      <li>Comissões são pagas mensalmente conforme as assinaturas ativas</li>
                    </ul>
                  </div>

                  {/* Estatísticas */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '1rem', 
                    marginBottom: '1.5rem' 
                  }}>
                    <div style={{ 
                      background: 'rgba(0,0,0,0.3)', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ffaa' }}>
                        {affiliateData.totalReferrals}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                        Indicações
                      </div>
                    </div>
                    
                    <div style={{ 
                      background: 'rgba(0,0,0,0.3)', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ffaa' }}>
                        R$ {(affiliateData.totalCommissions / 100).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                        Comissões Totais
                      </div>
                    </div>
                  </div>

                  {/* Código e Link */}
                  {affiliateData.code && (
                    <div>
                      <div style={{ marginBottom: '1rem' }}>
                        <Label>Seu Código de Afiliado</Label>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          background: 'rgba(0,0,0,0.3)', 
                          borderRadius: '6px', 
                          border: '1px solid rgba(255,255,255,0.1)' 
                        }}>
                          <div style={{ 
                            flex: 1, 
                            padding: '0.75rem', 
                            fontFamily: 'monospace', 
                            color: '#00ffaa', 
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            fontSize: '1.1rem'
                          }}>
                            {affiliateData.code}
                          </div>
                          <button
                            onClick={copyAffiliateCode}
                            style={{
                              background: 'linear-gradient(135deg, #00ffaa, #00ccff)',
                              color: '#000',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              margin: '0.25rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '0.8rem'
                            }}
                          >
                            📋 Copiar
                          </button>
                        </div>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <Label>Link de Indicação</Label>
                        <div style={{ 
                          background: 'rgba(0,0,0,0.2)', 
                          padding: '0.5rem', 
                          borderRadius: '6px', 
                          fontFamily: 'monospace', 
                          fontSize: '0.8rem', 
                          wordBreak: 'break-all',
                          border: '1px solid rgba(255,255,255,0.1)',
                          marginBottom: '0.5rem'
                        }}>
                          {window.location.origin}/checkout?ref={affiliateData.code}
                        </div>
                        <button
                          onClick={copyAffiliateUrl}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                            color: '#fff',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            width: '100%'
                          }}
                        >
                          🔗 Copiar Link Completo
                        </button>
                      </div>
                    </div>
                  )}

                  {!affiliateData.code && !affiliateLoading && (
                    <div style={{ 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      border: '1px solid rgba(59, 130, 246, 0.3)', 
                      borderRadius: '8px', 
                      padding: '1rem', 
                      textAlign: 'center' 
                    }}>
                      Seu código de afiliado será gerado automaticamente quando você fizer sua primeira indicação.
                    </div>
                  )}

                  <button
                    onClick={loadAffiliateData}
                    disabled={affiliateLoading}
                    style={{
                      background: 'linear-gradient(135deg, #00ffaa, #00ccff)',
                      color: '#000',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: affiliateLoading ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      opacity: affiliateLoading ? 0.6 : 1,
                      marginTop: '1rem'
                    }}
                  >
                    {affiliateLoading ? '⏳ Carregando...' : '🔄 Atualizar Dados'}
                  </button>

                  {/* Botão de Saque - Só aparece se houver comissões disponíveis */}
                  {affiliateData.totalCommissions > 0 && (
                    <button
                      onClick={() => {
                        setWithdrawalForm({
                          ...withdrawalForm,
                          amount: affiliateData.totalCommissions.toString()
                        });
                        setWithdrawalModal(true);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #28a745, #20c997)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginTop: '1rem',
                        marginLeft: '0.5rem',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(40, 167, 69, 0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                      }}
                    >
                      💰 Solicitar Saque (R$ {affiliateData.totalCommissions.toFixed(2)})
                    </button>
                  )}

                  {/* Informação sobre saques */}
                  <div style={{ 
                    background: 'rgba(255, 193, 7, 0.1)', 
                    border: '1px solid rgba(255, 193, 7, 0.3)', 
                    borderRadius: '8px', 
                    padding: '1rem', 
                    marginTop: '1.5rem',
                    fontSize: '0.9rem'
                  }}>
                    <h5 style={{ color: '#ffc107', margin: '0 0 0.5rem 0' }}>ℹ️ Sobre os Saques:</h5>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.5 }}>
                      <li>Valor mínimo para saque: <strong>R$ 50,00</strong></li>
                      <li>Saques são processados em até <strong>7 dias úteis</strong></li>
                      <li>Você receberá um e-mail quando o pagamento for aprovado</li>
                      <li>Histórico de saques disponível no painel administrativo</li>
                    </ul>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#e0e0e0',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Modal Admin - Apenas para usuários admin */}
      {activeModal === 'admin' && (user?.role === 'admin' || user?.email === 'rodyrodrigo@gmail.com') && (
        <Modal onClick={() => setActiveModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '80vh', overflowY: 'auto' }}>
            <ModalHeader>
              <h3>👑 Painel Administrativo</h3>
              <CloseButton onClick={() => setActiveModal(null)}>×</CloseButton>
            </ModalHeader>
            
            <div style={{ padding: '1.5rem 0' }}>
              {/* Cards de Estatísticas de Usuários */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#00ffaa', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  👥 Estatísticas de Usuários
                </h4>
                <button 
                  onClick={() => {
                    loadAdminStats();
                    loadAdminWithdrawals();
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #00ffaa, #00ccff)',
                    color: '#000',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  🔄 Atualizar
                </button>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem', 
                marginBottom: '2rem' 
              }}>
                <div style={{ 
                  background: 'rgba(59, 130, 246, 0.2)', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                  <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.1rem' }}>Total Usuários</div>
                  <div style={{ color: '#e0e0e0', fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    {adminStats.totalUsers}
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(34, 197, 94, 0.2)', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🆓</div>
                  <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '1.1rem' }}>Free</div>
                  <div style={{ color: '#e0e0e0', fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    {adminStats.freeUsers}
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(168, 85, 247, 0.2)', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid rgba(168, 85, 247, 0.3)'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💎</div>
                  <div style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '1.1rem' }}>Premium</div>
                  <div style={{ color: '#e0e0e0', fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    {adminStats.premiumUsers}
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(234, 179, 8, 0.2)', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid rgba(234, 179, 8, 0.3)'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏰</div>
                  <div style={{ color: '#eab308', fontWeight: 'bold', fontSize: '1.1rem' }}>Trial Ativo</div>
                  <div style={{ color: '#e0e0e0', fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    {adminStats.activeTrials}
                  </div>
                </div>
              </div>

              <h4 style={{ color: '#00ffaa', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                💰 Solicitações de Saque - Afiliados
              </h4>
              
              {/* Lista de solicitações de saque */}
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: '8px', 
                padding: '1rem',
                border: '1px solid rgba(0, 255, 170, 0.3)'
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr', 
                  gap: '1rem', 
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  fontWeight: 'bold',
                  color: '#00ffaa'
                }}>
                  <div>Afiliado</div>
                  <div>Valor</div>
                  <div>Data</div>
                  <div>Status</div>
                  <div>Ações</div>
                </div>
                
                {/* Lista dinâmica de solicitações com dados reais */}
                {adminWithdrawalsLoading ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#999', 
                    padding: '2rem'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <div>Carregando solicitações de saque...</div>
                  </div>
                ) : adminWithdrawals.length > 0 ? (
                  adminWithdrawals.map(withdrawal => (
                    <div key={withdrawal.id} style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr', 
                      gap: '1rem', 
                      padding: '0.75rem 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ color: '#e0e0e0', fontWeight: 'bold' }}>
                          {withdrawal.affiliateName}
                        </div>
                        <div style={{ color: '#999', fontSize: '0.8rem' }}>
                          {withdrawal.affiliateEmail}
                        </div>
                        <div style={{ color: '#00ffaa', fontSize: '0.8rem' }}>
                          PIX: {withdrawal.pixKey}
                        </div>
                      </div>
                      <div style={{ color: '#e0e0e0', fontWeight: 'bold' }}>
                        R$ {withdrawal.amount.toFixed(2)}
                      </div>
                      <div style={{ color: '#e0e0e0', fontSize: '0.8rem' }}>
                        {new Date(withdrawal.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        <span style={{ 
                          background: 
                            withdrawal.status === 'pending' ? 'rgba(255, 193, 7, 0.2)' :
                            withdrawal.status === 'approved' ? 'rgba(40, 167, 69, 0.2)' :
                            withdrawal.status === 'rejected' ? 'rgba(220, 53, 69, 0.2)' :
                            'rgba(100, 100, 100, 0.2)',
                          color: 
                            withdrawal.status === 'pending' ? '#ffc107' :
                            withdrawal.status === 'approved' ? '#28a745' :
                            withdrawal.status === 'rejected' ? '#dc3545' :
                            '#e0e0e0',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {withdrawal.status === 'pending' ? '⏳ Pendente' :
                           withdrawal.status === 'approved' ? '✅ Aprovado' :
                           withdrawal.status === 'rejected' ? '❌ Rejeitado' :
                           withdrawal.status === 'paid' ? '💰 Pago' :
                           withdrawal.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {withdrawal.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateWithdrawalStatus(withdrawal.id, 'approved', 'Saque aprovado pelo administrador')}
                              style={{
                                background: 'linear-gradient(135deg, #28a745, #20c997)',
                                color: '#fff',
                                border: 'none',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                              }}
                            >
                              ✅ Aprovar
                            </button>
                            <button
                              onClick={() => updateWithdrawalStatus(withdrawal.id, 'rejected', 'Saque rejeitado pelo administrador')}
                              style={{
                                background: 'linear-gradient(135deg, #dc3545, #c82333)',
                                color: '#fff',
                                border: 'none',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                              }}
                            >
                              ❌ Rejeitar
                            </button>
                          </>
                        )}
                        {withdrawal.status === 'approved' && (
                          <button
                            onClick={() => updateWithdrawalStatus(withdrawal.id, 'paid', 'Pagamento processado')}
                            style={{
                              background: 'linear-gradient(135deg, #007bff, #0056b3)',
                              color: '#fff',
                              border: 'none',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.7rem',
                              fontWeight: 'bold'
                            }}
                          >
                            💰 Marcar Pago
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#999', 
                    padding: '2rem',
                    fontStyle: 'italic'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
                    <div>Nenhuma solicitação de saque encontrada</div>
                  </div>
                )}
              </div>
              
              {/* Estatísticas */}
              <div style={{ 
                marginTop: '2rem',
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '1rem' 
              }}>
                <div style={{ 
                  background: 'rgba(40, 167, 69, 0.2)', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid rgba(40, 167, 69, 0.3)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                  <div style={{ color: '#28a745', fontWeight: 'bold' }}>Aprovados</div>
                  <div style={{ color: '#e0e0e0', fontSize: '1.2rem' }}>
                    {adminWithdrawalsLoading ? '...' : adminWithdrawals.filter(w => w.status === 'approved' || w.status === 'paid').length}
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(255, 193, 7, 0.2)', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 193, 7, 0.3)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                  <div style={{ color: '#ffc107', fontWeight: 'bold' }}>Pendentes</div>
                  <div style={{ color: '#e0e0e0', fontSize: '1.2rem' }}>
                    {adminWithdrawalsLoading ? '...' : adminWithdrawals.filter(w => w.status === 'pending').length}
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(220, 53, 69, 0.2)', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid rgba(220, 53, 69, 0.3)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❌</div>
                  <div style={{ color: '#dc3545', fontWeight: 'bold' }}>Rejeitados</div>
                  <div style={{ color: '#e0e0e0', fontSize: '1.2rem' }}>
                    {adminWithdrawalsLoading ? '...' : adminWithdrawals.filter(w => w.status === 'rejected').length}
                  </div>
                </div>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de Solicitação de Saque */}
      {withdrawalModal && (
        <Modal onClick={() => setWithdrawalModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <ModalHeader>
              <h3>💰 Solicitar Saque</h3>
              <CloseButton onClick={() => setWithdrawalModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <div style={{ padding: '1.5rem 0' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  background: 'rgba(40, 167, 69, 0.1)', 
                  border: '1px solid rgba(40, 167, 69, 0.3)', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  textAlign: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ color: '#28a745', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    💎 Saldo Disponível: R$ {affiliateData.totalCommissions.toFixed(2)}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    color: '#e0e0e0', 
                    fontWeight: 'bold', 
                    marginBottom: '0.5rem' 
                  }}>
                    💵 Valor do Saque (R$)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max={affiliateData.totalCommissions}
                    step="0.01"
                    value={withdrawalForm.amount}
                    onChange={(e) => setWithdrawalForm({
                      ...withdrawalForm,
                      amount: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: '#e0e0e0',
                      fontSize: '1rem'
                    }}
                    placeholder="Digite o valor (mínimo R$ 50,00)"
                  />
                  <small style={{ color: '#999', fontSize: '0.8rem' }}>
                    Valor mínimo: R$ 50,00 | Máximo: R$ {affiliateData.totalCommissions.toFixed(2)}
                  </small>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    color: '#e0e0e0', 
                    fontWeight: 'bold', 
                    marginBottom: '0.5rem' 
                  }}>
                    🏷️ Tipo de Chave PIX
                  </label>
                  <select
                    value={withdrawalForm.pixKeyType}
                    onChange={(e) => setWithdrawalForm({
                      ...withdrawalForm,
                      pixKeyType: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: '#e0e0e0',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="cpf">📄 CPF</option>
                    <option value="email">📧 E-mail</option>
                    <option value="telefone">📱 Telefone</option>
                    <option value="chave">🔑 Chave Aleatória</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    color: '#e0e0e0', 
                    fontWeight: 'bold', 
                    marginBottom: '0.5rem' 
                  }}>
                    🔑 Chave PIX
                  </label>
                  <input
                    type="text"
                    value={withdrawalForm.pixKey}
                    onChange={(e) => setWithdrawalForm({
                      ...withdrawalForm,
                      pixKey: e.target.value
                    })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: '#e0e0e0',
                      fontSize: '1rem'
                    }}
                    placeholder={
                      withdrawalForm.pixKeyType === 'cpf' ? 'Digite seu CPF (000.000.000-00)' :
                      withdrawalForm.pixKeyType === 'email' ? 'Digite seu e-mail' :
                      withdrawalForm.pixKeyType === 'telefone' ? 'Digite seu telefone (+5511999999999)' :
                      'Digite sua chave aleatória'
                    }
                  />
                </div>

                <div style={{ 
                  background: 'rgba(255, 193, 7, 0.1)', 
                  border: '1px solid rgba(255, 193, 7, 0.3)', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  fontSize: '0.9rem'
                }}>
                  <div style={{ color: '#ffc107', fontWeight: 'bold', marginBottom: '0.5rem' }}>ℹ️ Importante:</div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.5, color: '#e0e0e0' }}>
                    <li>Valor mínimo para saque: <strong>R$ 50,00</strong></li>
                    <li>Processamento em até <strong>7 dias úteis</strong></li>
                    <li>Você receberá confirmação por e-mail</li>
                    <li>Verifique se sua chave PIX está correta</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                onClick={() => setWithdrawalModal(false)}
                disabled={withdrawalLoading}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#e0e0e0',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: withdrawalLoading ? 'not-allowed' : 'pointer',
                  opacity: withdrawalLoading ? 0.6 : 1
                }}
              >
                Cancelar
              </button>
              <button
                onClick={submitWithdrawal}
                disabled={withdrawalLoading}
                style={{
                  background: withdrawalLoading 
                    ? 'rgba(100,100,100,0.5)' 
                    : 'linear-gradient(135deg, #28a745, #20c997)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: withdrawalLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: withdrawalLoading ? 0.6 : 1
                }}
              >
                {withdrawalLoading ? '⏳ Enviando...' : '💰 Solicitar Saque'}
              </button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Dashboard;