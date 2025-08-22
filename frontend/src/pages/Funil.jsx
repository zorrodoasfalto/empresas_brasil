import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const Container = styled.div`
  max-width: 1600px;
  margin: 2rem auto;
  padding: 2rem;
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
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 2rem;
  min-height: 600px;
`;

const FunnelColumn = styled.div`
  background: linear-gradient(135deg, rgba(15, 15, 35, 0.9), rgba(26, 26, 46, 0.8));
  border: 2px solid ${props => props.color || '#3B82F6'};
  border-radius: 12px;
  min-width: 300px;
  max-width: 350px;
  padding: 1.5rem;
  position: relative;
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

const Funil = () => {
  const [funnelData, setFunnelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState(null);
  const [dropZoneVisible, setDropZoneVisible] = useState({});

  useEffect(() => {
    fetchFunnelData();
  }, []);

  const fetchFunnelData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/crm/funil', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
        <StatsRow>
          <StatCard>
            <StatNumber>{totalLeads}</StatNumber>
            <StatLabel>Total Leads</StatLabel>
          </StatCard>
          {funnelData.map(phase => (
            <StatCard key={phase.id}>
              <StatNumber>{phase.leads.length}</StatNumber>
              <StatLabel>{phase.nome}</StatLabel>
            </StatCard>
          ))}
        </StatsRow>
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
        marginTop: '2rem',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2 style={{ color: '#00ccff', fontSize: '1.8rem', textAlign: 'center', marginBottom: '3rem' }}>
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
          {funnelData.map((phase, index) => {
            const percentage = totalLeads > 0 ? (phase.leads.length / totalLeads * 100) : 25;
            const width = Math.max(percentage, 10); // Mínimo 10% para visibilidade
            const maxWidth = 600;
            const actualWidth = (width / 100) * maxWidth;
            
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
                    ? 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)' // Topo mais largo
                    : index === funnelData.length - 1
                    ? 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)' // Base mais estreita
                    : 'polygon(5% 0%, 95% 0%, 85% 100%, 15% 100%)' // Meio
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
                    {totalLeads > 0 ? `${(phase.leads.length / totalLeads * 100).toFixed(1)}%` : '0%'}
                  </div>
                </div>
                
                {/* Seta entre fases */}
                {index < funnelData.length - 1 && (
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
                      borderTop: `20px solid ${funnelData[index + 1]?.cor || '#00ccff'}`,
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
          marginTop: '3rem',
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
          {totalLeads > 0 && funnelData.length > 0 ? (
            <div style={{ color: '#e0e0e0' }}>
              <div style={{ fontSize: '2rem', color: '#00ccff', marginBottom: '0.5rem' }}>
                {funnelData[funnelData.length - 1] 
                  ? ((funnelData[funnelData.length - 1].leads.length / totalLeads) * 100).toFixed(1)
                  : 0}%
              </div>
              <div>De {totalLeads} leads iniciais para {funnelData[funnelData.length - 1]?.leads.length || 0} finalizados</div>
            </div>
          ) : (
            <div style={{ color: '#999' }}>
              Adicione leads para ver as métricas de conversão
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Funil;