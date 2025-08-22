import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import empresaService from '../services/empresaService';

const Container = styled.div`
  max-width: 1400px;
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

const Stats = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, rgba(0, 255, 170, 0.1), rgba(0, 136, 204, 0.1));
  border: 1px solid rgba(0, 255, 170, 0.3);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  text-align: center;
`;

const StatNumber = styled.div`
  color: #00ffaa;
  font-size: 2rem;
  font-weight: bold;
`;

const StatLabel = styled.div`
  color: #e0e0e0;
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

const SearchBar = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 170, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  background: transparent;
  border: 1px solid rgba(0, 204, 255, 0.3);
  color: #e0e0e0;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  flex: 1;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #00ccff;
  }
  
  &::placeholder {
    color: rgba(224, 224, 224, 0.5);
  }
`;

const FilterSelect = styled.select`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 204, 255, 0.3);
  color: #e0e0e0;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  
  &:focus {
    outline: none;
    border-color: #00ccff;
  }
  
  option {
    background: #1a1a2e;
    color: #e0e0e0;
  }
`;

const LeadsGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const LeadCard = styled.div`
  background: linear-gradient(135deg, rgba(15, 15, 35, 0.9), rgba(26, 26, 46, 0.8));
  border: 1px solid rgba(0, 255, 170, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: rgba(0, 255, 170, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 255, 170, 0.1);
  }
`;

const LeadHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const LeadName = styled.h3`
  color: #00ccff;
  margin: 0;
  font-size: 1.3rem;
`;

const LeadCompany = styled.div`
  color: #00ffaa;
  font-size: 1.1rem;
  margin-top: 0.25rem;
`;

const FaseTag = styled.div`
  background: ${props => props.color || '#3B82F6'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const LeadInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InfoItem = styled.div`
  color: #e0e0e0;
  font-size: 0.9rem;
  
  .label {
    color: #00ccff;
    font-weight: bold;
    margin-right: 0.5rem;
  }
  
  .value {
    word-break: break-all;
  }
`;

const LeadFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 255, 170, 0.1);
  flex-wrap: wrap;
  gap: 1rem;
`;

const LeadSource = styled.div`
  background: rgba(0, 136, 204, 0.2);
  color: #00ccff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
`;

const LeadDate = styled.div`
  color: #999;
  font-size: 0.8rem;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #e0e0e0;
  padding: 4rem 2rem;
  
  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  .title {
    font-size: 1.5rem;
    color: #00ccff;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    color: #999;
  }
`;

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, sourceFilter, phaseFilter]);

  const fetchLeads = async () => {
    try {
      const token = await empresaService.ensureToken();
      
      const response = await fetch('/api/crm/leads', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setLeads(data.leads);
      } else {
        toast.error('Erro ao carregar leads');
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Erro ao conectar com servidor');
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone?.includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(lead => lead.fonte === sourceFilter);
    }

    // Phase filter
    if (phaseFilter !== 'all') {
      filtered = filtered.filter(lead => lead.fase_atual === phaseFilter);
    }

    setFilteredLeads(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueValues = (field) => {
    return [...new Set(leads.map(lead => lead[field]).filter(Boolean))];
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', color: '#00ccff', fontSize: '1.5rem' }}>
          🔄 Carregando leads...
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
        <Title>🗃️ Meus Leads</Title>
        <Stats>
          <StatCard>
            <StatNumber>{leads.length}</StatNumber>
            <StatLabel>Total de Leads</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{getUniqueValues('fonte').length}</StatNumber>
            <StatLabel>Fontes</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{getUniqueValues('fase_atual').length}</StatNumber>
            <StatLabel>Fases</StatLabel>
          </StatCard>
        </Stats>
      </Header>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="🔍 Buscar por nome, empresa, telefone ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="all">Todas as fontes</option>
          {getUniqueValues('fonte').map(fonte => (
            <option key={fonte} value={fonte}>{fonte}</option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
        >
          <option value="all">Todas as fases</option>
          {getUniqueValues('fase_atual').map(fase => (
            <option key={fase} value={fase}>{fase}</option>
          ))}
        </FilterSelect>
      </SearchBar>

      {filteredLeads.length === 0 ? (
        <EmptyState>
          <div className="icon">📋</div>
          <div className="title">
            {leads.length === 0 ? 'Nenhum lead ainda' : 'Nenhum lead encontrado'}
          </div>
          <div className="subtitle">
            {leads.length === 0 
              ? 'Salve seus primeiros leads a partir das buscas de empresas ou Google Maps'
              : 'Tente ajustar os filtros de busca'
            }
          </div>
        </EmptyState>
      ) : (
        <LeadsGrid>
          {filteredLeads.map(lead => (
            <LeadCard key={lead.id}>
              <LeadHeader>
                <div>
                  <LeadName>{lead.nome}</LeadName>
                  {lead.empresa && (
                    <LeadCompany>🏢 {lead.empresa}</LeadCompany>
                  )}
                </div>
                {lead.fase_atual && (
                  <FaseTag color={lead.fase_cor}>
                    {lead.fase_atual}
                  </FaseTag>
                )}
              </LeadHeader>

              <LeadInfo>
                {lead.telefone && (
                  <InfoItem>
                    <span className="label">📞 Telefone:</span>
                    <span className="value">{lead.telefone}</span>
                  </InfoItem>
                )}
                {lead.email && (
                  <InfoItem>
                    <span className="label">📧 Email:</span>
                    <span className="value">{lead.email}</span>
                  </InfoItem>
                )}
                {lead.endereco && (
                  <InfoItem>
                    <span className="label">📍 Endereço:</span>
                    <span className="value">{lead.endereco}</span>
                  </InfoItem>
                )}
                {lead.website && (
                  <InfoItem>
                    <span className="label">🌐 Website:</span>
                    <span className="value">{lead.website}</span>
                  </InfoItem>
                )}
                {lead.categoria && (
                  <InfoItem>
                    <span className="label">🏷️ Categoria:</span>
                    <span className="value">{lead.categoria}</span>
                  </InfoItem>
                )}
                {lead.rating && (
                  <InfoItem>
                    <span className="label">⭐ Avaliação:</span>
                    <span className="value">{lead.rating} ({lead.reviews_count} avaliações)</span>
                  </InfoItem>
                )}
              </LeadInfo>

              <LeadFooter>
                <LeadSource>📊 {lead.fonte}</LeadSource>
                <LeadDate>Adicionado em {formatDate(lead.created_at)}</LeadDate>
              </LeadFooter>
            </LeadCard>
          ))}
        </LeadsGrid>
      )}
    </Container>
  );
};

export default Leads;