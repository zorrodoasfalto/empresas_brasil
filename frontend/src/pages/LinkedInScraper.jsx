import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  color: #00ffaa;
  font-family: 'Orbitron', monospace;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const LinkedInIcon = styled.div`
  font-size: 3rem;
`;

const Subtitle = styled.p`
  color: #e0e0e0;
  font-size: 1.2rem;
  opacity: 0.8;
  max-width: 800px;
  margin: 0 auto;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: 
    linear-gradient(135deg, rgba(0, 255, 170, 0.1) 0%, rgba(0, 136, 204, 0.1) 100%),
    rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 170, 0.2);
  border-radius: 12px;
  padding: 2rem;
`;

const CardTitle = styled.h3`
  color: #00ffaa;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const KeywordsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const KeywordCategory = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 255, 170, 0.2);
  border-radius: 8px;
  padding: 1rem;
`;

const CategoryTitle = styled.h4`
  color: #0077b5;
  margin-bottom: 0.75rem;
  font-size: 1rem;
`;

const KeywordList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const KeywordTag = styled.span`
  background: linear-gradient(135deg, rgba(0, 119, 181, 0.2), rgba(0, 119, 181, 0.2));
  border: 1px solid rgba(0, 119, 181, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, rgba(0, 119, 181, 0.3), rgba(0, 119, 181, 0.3));
    transform: translateY(-1px);
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #0077b5;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 119, 181, 0.3);
  color: #e0e0e0;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #0077b5;
    box-shadow: 0 0 0 2px rgba(0, 119, 181, 0.2);
  }
  
  &::placeholder {
    color: rgba(224, 224, 224, 0.5);
  }
`;

const Select = styled.select`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 119, 181, 0.3);
  color: #e0e0e0;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #0077b5;
    box-shadow: 0 0 0 2px rgba(0, 119, 181, 0.2);
  }
  
  option {
    background: #1a1a2e;
    color: #e0e0e0;
  }
`;

const RunButton = styled.button`
  background: linear-gradient(135deg, #0077b5, #005582);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: linear-gradient(135deg, #005582, #0077b5);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 119, 181, 0.3);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    transform: none;
    color: #666;
  }
`;

const ResultsCard = styled.div`
  background: rgba(15, 15, 35, 0.6);
  border: 1px solid rgba(0, 119, 181, 0.3);
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
  grid-column: 1 / -1;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  margin-bottom: 1rem;
  
  ${props => {
    switch (props.status) {
      case 'SUCCEEDED':
        return `
          background: linear-gradient(135deg, #00ffaa, #00cc88);
          color: #000;
        `;
      case 'RUNNING':
        return `
          background: linear-gradient(135deg, #0077b5, #005582);
          color: #fff;
        `;
      case 'FAILED':
        return `
          background: linear-gradient(135deg, #ff4757, #ff3742);
          color: #fff;
        `;
      default:
        return `
          background: rgba(255, 255, 255, 0.1);
          color: #e0e0e0;
        `;
    }
  }}
`;

const ExportButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const ExportButton = styled.button`
  background: linear-gradient(135deg, #0077b5 0%, #005582 100%);
  color: #fff;
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
    background: linear-gradient(135deg, #005582 0%, #003d5c 100%);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 119, 181, 0.3);
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

const LinkedInScraper = () => {
  const [formData, setFormData] = useState({
    keywords: '',
    location: '',
    industries: '',
    company_size: '',
    page: 1,
    detailed: false
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState(null);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const { user } = useAuth();

  const businessKeywords = {
    'Tecnologia': [
      'tech', 'software', 'startup', 'development', 'programming', 
      'AI', 'data science', 'machine learning', 'cybersecurity', 'cloud'
    ],
    'Marketing': [
      'marketing', 'digital marketing', 'advertising', 'branding', 'social media',
      'content marketing', 'SEO', 'growth hacking', 'performance marketing'
    ],
    'Finanças': [
      'finance', 'banking', 'investment', 'fintech', 'accounting',
      'insurance', 'consulting', 'wealth management', 'trading'
    ],
    'Saúde': [
      'healthcare', 'medical', 'pharmaceuticals', 'biotechnology', 'wellness',
      'telemedicine', 'health tech', 'clinical research', 'medical devices'
    ],
    'Educação': [
      'education', 'e-learning', 'training', 'university', 'online courses',
      'educational technology', 'corporate training', 'skill development'
    ],
    'Varejo/E-commerce': [
      'retail', 'e-commerce', 'fashion', 'consumer goods', 'marketplace',
      'online shopping', 'dropshipping', 'supply chain', 'logistics'
    ],
    'Energia': [
      'energy', 'renewable energy', 'solar', 'wind power', 'oil and gas',
      'sustainability', 'clean tech', 'utilities', 'green energy'
    ],
    'Mídia': [
      'media', 'entertainment', 'content creation', 'journalism', 'publishing',
      'video production', 'podcasting', 'streaming', 'digital media'
    ]
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const setKeyword = (keyword) => {
    setFormData(prev => ({ ...prev, keyword }));
  };

  const clearResults = () => {
    setResults([]);
    setCurrentRun(null);
    toast.info('🗑️ Resultados anteriores limpos');
  };

  // Remove duplicates from scraping results (Ghost Genius format)
  const removeDuplicatesFromResults = (results) => {
    if (!results || results.length === 0) return [];
    
    const seen = new Set();
    const uniqueResults = [];
    
    for (const company of results) {
      const identifier = `${company.full_name || ''}_${company.id || ''}_${company.url || ''}`.toLowerCase();
      
      if (!seen.has(identifier)) {
        seen.add(identifier);
        uniqueResults.push(company);
      } else {
        console.log(`🔄 Duplicate removed: ${company.full_name}`);
      }
    }
    
    const removedCount = results.length - uniqueResults.length;
    if (removedCount > 0) {
      console.log(`🔄 Removed ${removedCount} internal duplicates from LinkedIn results`);
    }
    
    return uniqueResults;
  };

  // Filter leads that already exist in user's database
  const filterExistingLeads = async (resultsToFilter) => {
    if (!resultsToFilter || resultsToFilter.length === 0) {
      setFilteredResults([]);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setFilteredResults(resultsToFilter);
      return;
    }

    try {
      const leadsToCheck = resultsToFilter.map(company => ({
        nome: company.full_name || 'Empresa sem nome',
        empresa: company.full_name || 'Empresa sem nome',
        telefone: company.phone || '',
        email: company.email || '',
        website: company.url || ''
      }));

      const response = await fetch('/api/crm/leads/check-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ leads: leadsToCheck })
      });

      const data = await response.json();
      if (data.success) {
        const existingIds = new Set(data.existingLeads);
        
        const newLeads = resultsToFilter.filter((company, index) => {
          const lead = leadsToCheck[index];
          const leadId = `${lead.nome}_${lead.empresa}_${lead.telefone}_${lead.email}`;
          return !existingIds.has(leadId);
        });

        const filteredCount = resultsToFilter.length - newLeads.length;
        setFilteredResults(newLeads);
        
        if (filteredCount > 0) {
          toast.info(`🔄 ${filteredCount} empresas já existentes foram filtradas - restaram ${newLeads.length} empresas novas`);
        }
      } else {
        setFilteredResults(resultsToFilter);
      }
    } catch (error) {
      console.error('Error filtering existing leads:', error);
      setFilteredResults(resultsToFilter);
    }
  };

  // Filter existing leads whenever results change
  useEffect(() => {
    filterExistingLeads(results);
  }, [results]);

  const runScraper = async () => {
    // Keywords are optional - will use generic term if empty
    if (!formData.keywords && !formData.location && !formData.industries && !formData.company_size) {
      toast.error('❌ Preencha pelo menos um filtro (palavra-chave, localização, indústria ou tamanho)');
      return;
    }

    // Clear previous results
    setResults([]);
    setCurrentRun(null);

    console.log('🚀 Iniciando LinkedIn scraping com Ghost Genius:', formData);

    setIsRunning(true);
    
    try {
      const response = await fetch('/api/linkedin/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keywords: formData.keywords,
          location: formData.location,
          industries: formData.industries,
          company_size: formData.company_size,
          page: parseInt(formData.page),
          detailed: formData.detailed
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('✅ LinkedIn scraping concluído!');
        setCurrentRun({
          id: 'ghost-genius-' + Date.now(),
          status: 'SUCCEEDED',
          startedAt: new Date(),
          finishedAt: new Date(),
          keywords: formData.keywords,
          location: formData.location,
          industries: formData.industries,
          company_size: formData.company_size
        });
        
        // Use raw Ghost Genius data - no transformation
        const rawResults = data.data || [];
        console.log('Raw Ghost Genius data:', rawResults);
        
        setResults(rawResults);
        setIsRunning(false);
        
      } else {
        toast.error('Erro ao buscar no LinkedIn: ' + data.message);
        setIsRunning(false);
      }
    } catch (error) {
      console.error('❌ Erro completo:', error);
      toast.error(`❌ Erro ao conectar: ${error.message}`);
      setIsRunning(false);
    }
  };

  // Polling não é mais necessário com Ghost Genius API (resposta imediata)
  // Função mantida para compatibilidade
  const pollResults = async (runId) => {
    // Ghost Genius API returns immediate results, no polling needed
    console.log('Ghost Genius API - No polling required for:', runId);
  };

  const saveAllLeads = async () => {
    let dataToSave = filteredResults;
    if (!dataToSave || dataToSave.length === 0) {
      toast.error('❌ Nenhum resultado encontrado para salvar. Execute uma busca primeiro.');
      return;
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('Você precisa estar logado para salvar leads');
      return;
    }

    try {
      const leadsToProcess = dataToSave.map(company => ({
        nome: company.full_name || 'Empresa sem nome',
        empresa: company.full_name || 'Empresa sem nome',
        telefone: company.phone || '',
        email: company.email || '',
        endereco: company.location || '',
        website: company.url || '',
        categoria: 'LinkedIn Lead',
        fonte: 'LinkedIn Ghost Genius API',
        dados_originais: company,
        notas: `Busca LinkedIn: ${formData.keywords} | Localização: ${formData.location} | ID: ${company.id} | Headline: ${company.headline || 'N/A'}`
      }));

      console.log('🔍 Leads to save:', leadsToProcess.length);
      
      let savedCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < leadsToProcess.length; i++) {
        const lead = leadsToProcess[i];
        
        try {
          const response = await fetch('/api/crm/leads', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(lead)
          });

          const data = await response.json();
          
          if (data.success) {
            savedCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Network error for lead ${i + 1}:`, error);
        }
      }
      
      // Show results
      if (savedCount > 0) {
        const message = errorCount > 0 
          ? `✅ ${savedCount} leads salvos | ❌ ${errorCount} erros`
          : `✅ ${savedCount} leads salvos com sucesso!`;
        toast.success(message);
      } else {
        toast.error('❌ Nenhum lead foi salvo. Verifique se você está logado.');
      }

    } catch (error) {
      console.error('Erro ao salvar leads:', error);
      toast.error('Erro ao salvar leads');
    }
  };

  const exportToExcel = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      toast.warning('❌ Nenhum resultado válido para exportar');
      return;
    }

    try {
      const exportData = data.map((company, index) => ({
        'Nº': index + 1,
        'Nome da Empresa': company.full_name || '',
        'ID LinkedIn': company.id || '',
        'Tipo': company.type || '',
        'URL LinkedIn': company.url || '',
        'Headline': company.headline || '',
        'Logo URL': company.profile_picture && company.profile_picture.length > 0 ? company.profile_picture[0].url : '',
        'Logo Width': company.profile_picture && company.profile_picture.length > 0 ? company.profile_picture[0].width : '',
        'Logo Height': company.profile_picture && company.profile_picture.length > 0 ? company.profile_picture[0].height : '',
        'Palavra-chave Pesquisada': formData.keywords,
        'Localização Pesquisada': formData.location,
        'Data da Exportação': new Date().toLocaleDateString('pt-BR'),
        'Hora da Exportação': new Date().toLocaleTimeString('pt-BR')
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      const columnWidths = [
        { wch: 5 },   // Nº
        { wch: 30 },  // Nome da Empresa
        { wch: 15 },  // ID da Empresa
        { wch: 40 },  // URL LinkedIn
        { wch: 30 },  // Website
        { wch: 20 },  // Indústria
        { wch: 25 },  // Localização
        { wch: 20 },  // Tamanho
        { wch: 15 },  // Funcionários
        { wch: 15 },  // Seguidores
        { wch: 30 },  // Especialidades
        { wch: 50 },  // Descrição
        { wch: 15 },  // Telefone
        { wch: 25 },  // Email
        { wch: 20 },  // Palavra-chave
        { wch: 12 },  // Data
        { wch: 12 }   // Hora
      ];
      
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'LinkedIn Results');

      const fileName = `linkedin-${formData.keyword?.replace(/\s+/g, '-') || 'busca'}-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
      toast.success(`✅ Dados exportados para ${fileName}`);

    } catch (error) {
      console.error('❌ EXPORT ERROR:', error);
      toast.error(`Erro ao exportar: ${error.message}`);
    }
  };

  const exportToCSV = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      toast.warning('❌ Nenhum resultado válido para exportar');
      return;
    }

    try {
      const headers = [
        'Nº', 'Nome da Empresa', 'ID da Empresa', 'URL LinkedIn', 'Website',
        'Indústria', 'Localização', 'Tamanho da Empresa', 'Número de Funcionários',
        'Número de Seguidores', 'Especialidades', 'Descrição', 'Telefone', 'Email',
        'Palavra-chave Pesquisada', 'Data da Exportação', 'Hora da Exportação'
      ];

      const csvContent = [
        headers.join(';'),
        ...data.map((company, index) => [
          index + 1,
          `"${(company.company_name || '').replace(/"/g, '""')}"`,
          `"${(company.company_id || '').replace(/"/g, '""')}"`,
          `"${(company.linkedin_url || '').replace(/"/g, '""')}"`,
          `"${(company.website || '').replace(/"/g, '""')}"`,
          `"${(company.industry || '').replace(/"/g, '""')}"`,
          `"${(company.location || company.address || '').replace(/"/g, '""')}"`,
          `"${(company.company_size || '').replace(/"/g, '""')}"`,
          company.employees_count || '',
          company.followers_count || '',
          `"${(company.specialties || '').replace(/"/g, '""')}"`,
          `"${(company.description || '').replace(/"/g, '""')}"`,
          `"${(company.phone || '').replace(/"/g, '""')}"`,
          `"${(company.email || '').replace(/"/g, '""')}"`,
          `"${formData.keyword}"`,
          `"${new Date().toLocaleDateString('pt-BR')}"`,
          `"${new Date().toLocaleTimeString('pt-BR')}"`
        ].join(';'))
      ].join('\n');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `linkedin-${formData.keyword?.replace(/\s+/g, '-') || 'busca'}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('✅ Arquivo CSV exportado com sucesso!');
      }
    } catch (error) {
      console.error('❌ CSV EXPORT ERROR:', error);
      toast.error(`Erro ao exportar CSV: ${error.message}`);
    }
  };

  return (
    <Container>
      {/* Botão Voltar */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => window.location.href = '/dashboard'}
          style={{
            background: 'rgba(0, 119, 181, 0.1)',
            border: '1px solid #0077b5',
            color: '#0077b5',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 119, 181, 0.2)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0, 119, 181, 0.1)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Voltar ao Dashboard
        </button>
      </div>

      <Header>
        <Title>
          <LinkedInIcon>💼</LinkedInIcon>
          LinkedIn Scraper
        </Title>
        <Subtitle>
          Extraia dados de empresas do LinkedIn usando palavras-chave específicas.
          Encontre empresas por segmento, tecnologia ou área de atuação.
        </Subtitle>
      </Header>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <Card style={{ maxWidth: '600px', width: '100%' }}>
          <CardTitle>⚙️ Configuração do Scraping</CardTitle>
          
          <FormGrid>
            <FormGroup>
              <Label>Palavra-Chave</Label>
              <Input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                placeholder="Ex: tech, marketing, finance... (deixe vazio para buscar por filtros)"
              />
            </FormGroup>

            <FormGroup>
              <Label>Localização</Label>
              <Select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              >
                <option value="">Todas as localizações</option>
                <option value="brasil">Brasil</option>
                <option value="são paulo">São Paulo, SP</option>
                <option value="rio de janeiro">Rio de Janeiro, RJ</option>
                <option value="belo horizonte">Belo Horizonte, MG</option>
                <option value="salvador">Salvador, BA</option>
                <option value="brasília">Brasília, DF</option>
                <option value="fortaleza">Fortaleza, CE</option>
                <option value="curitiba">Curitiba, PR</option>
                <option value="recife">Recife, PE</option>
                <option value="porto alegre">Porto Alegre, RS</option>
                <option value="manaus">Manaus, AM</option>
              </Select>
            </FormGroup>
          </FormGrid>

          <FormGrid>
            <FormGroup>
              <Label>Indústrias</Label>
              <Select
                name="industries"
                value={formData.industries}
                onChange={handleInputChange}
              >
                <option value="">Todas as indústrias</option>
                <option value="4">Tecnologia</option>
                <option value="6">Software</option>
                <option value="96">Marketing e Publicidade</option>
                <option value="43">Consultoria</option>
                <option value="25">E-commerce</option>
                <option value="12">Educação</option>
                <option value="14">Saúde</option>
                <option value="8">Finanças</option>
                <option value="18">Varejo</option>
                <option value="54">Imóveis</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Tamanho da Empresa</Label>
              <Select
                name="company_size"
                value={formData.company_size}
                onChange={handleInputChange}
              >
                <option value="">Todos os tamanhos</option>
                <option value="B">1-10 funcionários</option>
                <option value="C">11-50 funcionários</option>
                <option value="D">51-200 funcionários</option>
                <option value="E">201-500 funcionários</option>
                <option value="F">501-1000 funcionários</option>
                <option value="G">1001-5000 funcionários</option>
                <option value="H">5001-10,000 funcionários</option>
                <option value="I">10,001+ funcionários</option>
              </Select>
            </FormGroup>
          </FormGrid>

          <FormGrid style={{ marginTop: '1rem' }}>
            <FormGroup>
              <Label>Página</Label>
              <Select
                name="page"
                value={formData.page}
                onChange={handleInputChange}
              >
                <option value={1}>Página 1</option>
                <option value={2}>Página 2</option>
                <option value={3}>Página 3</option>
                <option value={4}>Página 4</option>
                <option value={5}>Página 5</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="detailed"
                  checked={formData.detailed}
                  onChange={(e) => setFormData(prev => ({...prev, detailed: e.target.checked}))}
                  style={{ marginRight: '0.5rem' }}
                />
                Buscar Dados Detalhados
              </Label>
              <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.3rem' }}>
                ✨ Inclui website, endereço, funcionários, especialidades, etc.
                <br />⚡ Aplica-se às primeiras 10 empresas (mais lento)
              </div>
            </FormGroup>
          </FormGrid>

          <RunButton
            onClick={runScraper}
            disabled={isRunning}
          >
            {isRunning ? (
              <>🔄 Executando Scraping...</>
            ) : (
              <>🚀 Iniciar LinkedIn Scraping</>
            )}
          </RunButton>

          {/* BOTÕES PRINCIPAIS - SEMPRE VISÍVEIS */}
          <div style={{ 
            marginTop: '2rem', 
            borderTop: '1px solid rgba(0, 119, 181, 0.3)', 
            paddingTop: '1.5rem' 
          }}>
            <h3 style={{ color: '#0077b5', marginBottom: '1rem', textAlign: 'center' }}>
              🎯 Ações Disponíveis
            </h3>
            
            <ExportButtonsContainer>
              <ExportButton onClick={saveAllLeads}>
                💾 Salvar Todos os Leads {results && results.length > 0 ? `(${results.length})` : '(0)'}
              </ExportButton>
              <ExportButton onClick={() => exportToExcel(results)}>
                📊 Exportar Excel {results && results.length > 0 ? `(${results.length})` : '(0)'}
              </ExportButton>
            </ExportButtonsContainer>
          </div>
        </Card>
      </div>

      {currentRun && (
        <ResultsCard>
          <StatusBadge status={currentRun.status}>
            {currentRun.status === 'RUNNING' && '🔄 Processando...'}
            {currentRun.status === 'SUCCEEDED' && '✅ Concluído'}
            {currentRun.status === 'FAILED' && '❌ Falhou'}
            {currentRun.status}
          </StatusBadge>
          
          <div style={{ color: '#e0e0e0', marginBottom: '1rem' }}>
            <div><strong>Palavra-chave:</strong> {currentRun.keywords}</div>
            {currentRun.location && <div><strong>Localização:</strong> {currentRun.location}</div>}
            {currentRun.industries && <div><strong>Indústrias:</strong> {currentRun.industries}</div>}
            {currentRun.company_size && <div><strong>Tamanho:</strong> {currentRun.company_size}</div>}
            <div><strong>Iniciado:</strong> {new Date(currentRun.startedAt).toLocaleString()}</div>
            {currentRun.finishedAt && (
              <div><strong>Finalizado:</strong> {new Date(currentRun.finishedAt).toLocaleString()}</div>
            )}
          </div>

          {filteredResults.length > 0 && (
            <div>
              <h3 style={{ color: '#0077b5', marginBottom: '1rem' }}>
                📊 {filteredResults.length} Empresas Encontradas
              </h3>
              
              <ExportButtonsContainer style={{ marginBottom: '1rem' }}>
                <ExportButton onClick={() => exportToCSV(filteredResults)}>
                  📊 Exportar CSV
                </ExportButton>
                <ExportButton onClick={() => exportToExcel(filteredResults)}>
                  📈 Exportar Excel
                </ExportButton>
                <ExportButton onClick={saveAllLeads} style={{ background: 'linear-gradient(135deg, #00ffaa 0%, #00cc88 100)', color: '#000' }}>
                  💾 Salvar Leads
                </ExportButton>
              </ExportButtonsContainer>
              
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                {filteredResults.slice(0, 20).map((company, index) => (
                  <div key={index} style={{
                    background: 'rgba(0,119,181,0.1)',
                    border: '1px solid rgba(0,119,181,0.2)',
                    borderRadius: '6px',
                    padding: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ color: '#0077b5', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {company.full_name}
                    </div>
                    <div style={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
                      {company.headline && <div>📝 {company.headline}</div>}
                      {company.url && (
                        <div>🔗 <a href={company.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5' }}>{company.url}</a></div>
                      )}
                      {company.id && <div>🆔 ID: {company.id}</div>}
                      {company.type && <div>🏢 Type: {company.type}</div>}
                      {company.profile_picture && company.profile_picture.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <img src={company.profile_picture[0].url} alt={company.full_name} style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredResults.length > 20 && (
                <div style={{ color: '#0077b5', textAlign: 'center', marginTop: '1rem' }}>
                  ... e mais {filteredResults.length - 20} empresas encontradas
                </div>
              )}
            </div>
          )}
        </ResultsCard>
      )}
      
      {/* Mostrar quando todos os leads já existem na base */}
      {results.length > 0 && filteredResults.length === 0 && (
        <ResultsCard>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#0077b5' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Todas as {results.length} empresas já estão na sua base
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Tente com palavras-chave diferentes ou altere a página de busca
            </div>
          </div>
        </ResultsCard>
      )}
    </Container>
  );
};

export default LinkedInScraper;