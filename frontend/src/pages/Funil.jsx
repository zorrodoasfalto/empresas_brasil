import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 1600px;
  margin: 1rem auto;
  padding: 1.5rem;
  
  /* Notebook optimization: Apply 80% zoom effect APENAS para notebooks */
  @media (max-width: 1600px) and (min-width: 1200px) {
    transform: scale(0.9);
    transform-origin: top center;
  }
  
  @media (max-width: 1440px) and (min-width: 1200px) {
    transform: scale(0.85);
    transform-origin: top center;
  }
  
  @media (max-width: 1366px) and (min-width: 1200px) {
    transform: scale(0.8);
    transform-origin: top center;
  }
  
  /* Tablet and smaller notebook responsiveness */
  @media (max-width: 1199px) and (min-width: 1024px) {
    transform: scale(0.95);
    transform-origin: top center;
  }
  
  @media (max-width: 1023px) and (min-width: 769px) {
    padding: 1rem;
    max-width: 100%;
  }
  
  /* Mobile responsiveness */
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  color: #00ffaa;
  font-size: 2.5rem;
  margin: 0;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, rgba(0, 255, 170, 0.1), rgba(0, 136, 204, 0.1));
  border: 1px solid rgba(0, 255, 170, 0.3);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  text-align: center;
  min-width: 120px;
`;

const StatNumber = styled.div`
  color: #00ffaa;
  font-size: 1.8rem;
  font-weight: bold;
`;

const StatLabel = styled.div`
  color: #e0e0e0;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const FunnelContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding-bottom: 1rem;
  min-height: auto;
  flex-wrap: wrap;
  
  @media (max-width: 1200px) {
    overflow-x: auto;
    flex-wrap: nowrap;
  }
`;

const FunnelColumn = styled.div`
  background: linear-gradient(135deg, rgba(15, 15, 35, 0.9), rgba(26, 26, 46, 0.8));
  border: 2px solid ${props => props.color || '#3B82F6'};
  border-radius: 12px;
  flex: 1;
  min-width: 280px;
  max-width: 350px;
  padding: 1.5rem;
  position: relative;
  
  @media (max-width: 1200px) {
    flex: none;
    min-width: 300px;
  }
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.color || '#3B82F6'};
`;

const ColumnTitle = styled.h3`
  color: ${props => props.color || '#3B82F6'};
  margin: 0;
  font-size: 1.3rem;
`;

const LeadCount = styled.div`
  background: ${props => props.color || '#3B82F6'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
`;

const ColumnDescription = styled.div`
  color: #e0e0e0;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  opacity: 0.8;
`;

const LeadsArea = styled.div`
  min-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LeadCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.phaseColor || '#3B82F6'};
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }
  
  &.dragging {
    opacity: 0.5;
    transform: rotate(5deg);
  }
`;

const LeadName = styled.div`
  color: #00ccff;
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const LeadCompany = styled.div`
  color: #00ffaa;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const LeadInfo = styled.div`
  color: #e0e0e0;
  font-size: 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
`;

const LeadSource = styled.div`
  background: rgba(0, 136, 204, 0.2);
  color: #00ccff;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
`;

const EmptyColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #999;
  font-style: italic;
  
  .icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    opacity: 0.5;
  }
`;

const DropZone = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3px dashed #00ffaa;
  border-radius: 12px;
  background: rgba(0, 255, 170, 0.1);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  color: #00ffaa;
  font-size: 1.2rem;
  font-weight: bold;
  z-index: 10;
`;

const MenuDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuButton = styled.button`
  background: linear-gradient(135deg, rgba(0, 255, 170, 0.1), rgba(0, 136, 204, 0.1));
  border: 1px solid #00ffaa;
  color: #00ffaa;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(0, 255, 170, 0.2), rgba(0, 136, 204, 0.2));
    box-shadow: 0 5px 15px rgba(0, 255, 170, 0.3);
  }
`;

const MenuContent = styled.div`
  display: ${props => props.show ? 'block' : 'none'};
  position: absolute;
  top: 100%;
  right: 0;
  background: linear-gradient(135deg, rgba(15, 15, 35, 0.95), rgba(26, 26, 46, 0.95));
  border: 1px solid rgba(0, 255, 170, 0.3);
  border-radius: 8px;
  min-width: 200px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  backdrop-filter: blur(10px);
`;

const MenuItem = styled.div`
  padding: 0.75rem 1rem;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(0, 255, 170, 0.1);
    color: #00ffaa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Funil = () => {
  const { token } = useAuth();
  const [funnelData, setFunnelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState(null);
  const [dropZoneVisible, setDropZoneVisible] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [filtroFonte, setFiltroFonte] = useState('todos');

  useEffect(() => {
    fetchFunnelData();
  }, []);

  const fetchFunnelData = async () => {
    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/crm/funil', { headers });
      
      if (response.status === 401) {
        const data = await response.json();
        toast.error(data.message || 'Acesso não autorizado. Faça login.');
        // Optionally redirect to login
        // window.location.href = '/login';
        return;
      }

      const data = await response.json();
      if (data.success) {
        setFunnelData(data.funil);
      } else {
        toast.error('Erro ao carregar funil');
      }
    } catch (error) {
      console.error('Error fetching funnel:', error);
      toast.error('Erro ao conectar com servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedLead(null);
    setDropZoneVisible({});
  };

  const handleDragOver = (e, phaseId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropZoneVisible({ [phaseId]: true });
  };

  const handleDragLeave = (e, phaseId) => {
    setDropZoneVisible({ [phaseId]: false });
  };

  const handleDrop = async (e, newPhaseId) => {
    e.preventDefault();
    setDropZoneVisible({});
    
    if (!draggedLead || draggedLead.fase_id === newPhaseId) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/crm/leads/${draggedLead.id}/fase`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          faseId: newPhaseId,
          notas: `Movido para nova fase via funil em ${new Date().toLocaleString()}`
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Lead movido com sucesso!');
        fetchFunnelData(); // Refresh data
      } else {
        toast.error('Erro ao mover lead');
      }
    } catch (error) {
      console.error('Error moving lead:', error);
      toast.error('Erro ao conectar com servidor');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `${diffDays} dias`;
    return date.toLocaleDateString('pt-BR');
  };

  const getTotalLeads = () => {
    return funnelData.reduce((total, phase) => total + phase.leads.length, 0);
  };

  const getFilteredPhases = () => {
    if (filtroFonte === 'todos') return funnelData;
    
    return funnelData.map(phase => ({
      ...phase,
      leads: phase.leads.filter(lead => 
        filtroFonte === 'todos' || lead.fonte.toLowerCase().includes(filtroFonte.toLowerCase())
      )
    }));
  };

  const getUniqueFontes = () => {
    const fontes = new Set();
    funnelData.forEach(phase => {
      phase.leads.forEach(lead => {
        if (lead.fonte) fontes.add(lead.fonte);
      });
    });
    return Array.from(fontes);
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', color: '#00ccff', fontSize: '1.5rem' }}>
          🔄 Carregando funil...
        </div>
      </Container>
    );
  }

  const totalLeads = funnelData.reduce((total, phase) => total + phase.leads.length, 0);

  return (
    <Container>
      <Header>
        <Title>🌪️ Funil de Vendas</Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <StatsRow>
            <StatCard>
              <StatNumber>{getTotalLeads()}</StatNumber>
              <StatLabel>Total Leads</StatLabel>
            </StatCard>
            {getFilteredPhases().map(phase => (
              <StatCard key={phase.id}>
                <StatNumber>{phase.leads.length}</StatNumber>
                <StatLabel>{phase.nome}</StatLabel>
              </StatCard>
            ))}
          </StatsRow>
          
          <MenuDropdown>
            <MenuButton onClick={() => setMenuOpen(!menuOpen)}>
              🔍 Filtros {menuOpen ? '▲' : '▼'}
            </MenuButton>
            <MenuContent show={menuOpen}>
              <MenuItem onClick={() => { setFiltroFonte('todos'); setMenuOpen(false); }}>
                🌐 Todos os Leads
              </MenuItem>
              {getUniqueFontes().map(fonte => (
                <MenuItem 
                  key={fonte}
                  onClick={() => { setFiltroFonte(fonte); setMenuOpen(false); }}
                >
                  📊 {fonte}
                </MenuItem>
              ))}
              <MenuItem onClick={() => { window.location.href = '/leads'; }}>
                📋 Ver Tabela de Leads
              </MenuItem>
              <MenuItem onClick={() => { window.location.href = '/kanban'; }}>
                📋 Ver Kanban
              </MenuItem>
            </MenuContent>
          </MenuDropdown>
        </div>
      </Header>

      {/* Botão Voltar */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => window.location.href = '/dashboard'}
          style={{
            background: 'rgba(0, 204, 255, 0.1)',
            border: '1px solid #00ccff',
            color: '#00ccff',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease'
          }}
        >
          ← Voltar ao Dashboard
        </button>
      </div>

      {/* Funil Visual Gráfico REAL */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: '1.5rem',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2 style={{ color: '#00ccff', fontSize: '1.8rem', textAlign: 'center', marginBottom: '2rem' }}>
          🌪️ Funil de Conversão Visual
        </h2>
        
        {/* Funil Gráfico */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          perspective: '1000px'
        }}>
          {getFilteredPhases().map((phase, index) => {
            // Create funnel shape: largest to smallest regardless of lead count
            const totalPhases = getFilteredPhases().length;
            const maxWidth = 600;
            // Calculate decreasing width: first phase 100%, last phase 40%
            const widthPercentage = 100 - (index * (60 / (totalPhases - 1)));
            const actualWidth = (widthPercentage / 100) * maxWidth;
            
            return (
              <div key={phase.id} style={{
                position: 'relative',
                marginBottom: '0.5rem'
              }}>
                {/* Linha do Funil */}
                <div style={{
                  width: `${actualWidth}px`,
                  height: '80px',
                  background: `linear-gradient(135deg, ${phase.cor}, ${phase.cor}dd)`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: `0 8px 25px ${phase.cor}40`,
                  transform: 'perspective(500px) rotateX(10deg)',
                  clipPath: index === 0 
                    ? 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)' // Primeiro: bem largo no topo, pouco estreito embaixo
                    : index === getFilteredPhases().length - 1
                    ? 'polygon(15% 0%, 85% 0%, 80% 100%, 20% 100%)' // Último: mais estreito
                    : `polygon(${5 + (index * 5)}% 0%, ${95 - (index * 5)}% 0%, ${85 - (index * 5)}% 100%, ${15 + (index * 5)}% 100%)` // Progressivo
                }}>
                  <div style={{
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>
                      {phase.leads.length}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.95 }}>
                      {phase.nome}
                    </div>
                  </div>
                  
                  {/* Porcentagem */}
                  <div style={{
                    position: 'absolute',
                    right: '-80px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: phase.cor,
                    padding: '0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}>
                    {getFilteredPhases().reduce((total, p) => total + p.leads.length, 0) > 0 ? `${(phase.leads.length / getFilteredPhases().reduce((total, p) => total + p.leads.length, 0) * 100).toFixed(1)}%` : '0%'}
                  </div>
                </div>
                
                {/* Seta entre fases */}
                {index < getFilteredPhases().length - 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '0.5rem 0'
                  }}>
                    <div style={{
                      width: '0',
                      height: '0',
                      borderLeft: '15px solid transparent',
                      borderRight: '15px solid transparent',
                      borderTop: `20px solid ${getFilteredPhases()[index + 1]?.cor || '#00ccff'}`,
                      opacity: 0.7,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Taxa de Conversão */}
        <div style={{
          marginTop: '2rem',
          background: 'rgba(0, 136, 204, 0.1)',
          border: '1px solid rgba(0, 204, 255, 0.3)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h3 style={{ color: '#00ffaa', marginBottom: '1rem' }}>
            📈 Taxa de Conversão Geral
          </h3>
          {getFilteredPhases().length > 0 ? (
            <div style={{ color: '#e0e0e0' }}>
              <div style={{ fontSize: '2rem', color: '#00ccff', marginBottom: '0.5rem' }}>
                {getFilteredPhases()[getFilteredPhases().length - 1] 
                  ? ((getFilteredPhases()[getFilteredPhases().length - 1].leads.length / getFilteredPhases().reduce((total, p) => total + p.leads.length, 0)) * 100).toFixed(1)
                  : 0}%
              </div>
              <div>De {getFilteredPhases().reduce((total, p) => total + p.leads.length, 0)} leads para {getFilteredPhases()[getFilteredPhases().length - 1]?.leads.length || 0} finalizados</div>
            </div>
          ) : (
            <div style={{ color: '#999' }}>
              Adicione leads para ver as métricas de conversão
            </div>
          )}
        </div>
      </div>

      {/* Lista Detalhada de Leads por Fase */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ color: '#00ffaa', fontSize: '1.8rem', textAlign: 'center', marginBottom: '2rem' }}>
          📋 Leads Detalhados por Fase
        </h2>
        
        <FunnelContainer>
          {getFilteredPhases().map(phase => (
            <FunnelColumn
              key={phase.id}
              color={phase.cor}
              onDragOver={(e) => handleDragOver(e, phase.id)}
              onDragLeave={(e) => handleDragLeave(e, phase.id)}
              onDrop={(e) => handleDrop(e, phase.id)}
            >
              <DropZone show={dropZoneVisible[phase.id]}>
                📥 Soltar aqui
              </DropZone>
              
              <ColumnHeader color={phase.cor}>
                <ColumnTitle color={phase.cor}>{phase.nome}</ColumnTitle>
                <LeadCount color={phase.cor}>{phase.leads.length}</LeadCount>
              </ColumnHeader>
              
              {phase.descricao && (
                <ColumnDescription>{phase.descricao}</ColumnDescription>
              )}
              
              <LeadsArea>
                {phase.leads.length === 0 ? (
                  <EmptyColumn>
                    <div className="icon">📭</div>
                    <div>Nenhum lead nesta fase</div>
                  </EmptyColumn>
                ) : (
                  phase.leads.map(lead => (
                    <LeadCard
                      key={lead.id}
                      phaseColor={phase.cor}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead)}
                      onDragEnd={handleDragEnd}
                    >
                      <LeadName>{lead.nome}</LeadName>
                      {lead.empresa && (
                        <LeadCompany>🏢 {lead.empresa}</LeadCompany>
                      )}
                      
                      <div style={{ margin: '0.5rem 0', color: '#e0e0e0', fontSize: '0.8rem' }}>
                        {lead.telefone && <div>📞 {lead.telefone}</div>}
                        {lead.email && <div>📧 {lead.email}</div>}
                      </div>
                      
                      <LeadInfo>
                        <LeadSource>{lead.fonte}</LeadSource>
                        <div>{formatDate(lead.data_entrada)}</div>
                      </LeadInfo>
                    </LeadCard>
                  ))
                )}
              </LeadsArea>
            </FunnelColumn>
          ))}
        </FunnelContainer>
      </div>
    </Container>
  );
};

export default Funil;