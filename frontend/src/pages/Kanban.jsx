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
      // Temporarily use test endpoint
      const response = await fetch('/api/crm/funil-test');
      
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

  return (
    <Container>
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

      <Header>
        <Title>📋 Kanban - Gestão de Leads</Title>
        <StatsRow>
          <StatCard>
            <StatNumber>{getTotalLeads()}</StatNumber>
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

      <FunnelContainer>
        {funnelData.map(phase => (
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
    </Container>
  );
};

export default Funil;