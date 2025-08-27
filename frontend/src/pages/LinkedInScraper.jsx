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
    keyword: '',
    pageNumber: 1,
    limit: 50
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

  // Remove duplicates from scraping results
  const removeDuplicatesFromResults = (results) => {
    if (!results || results.length === 0) return [];
    
    const seen = new Set();
    const uniqueResults = [];
    
    for (const company of results) {
      const identifier = `${company.company_name || ''}_${company.company_id || ''}_${company.linkedin_url || ''}`.toLowerCase();
      
      if (!seen.has(identifier)) {
        seen.add(identifier);
        uniqueResults.push(company);
      } else {
        console.log(`🔄 Duplicate removed: ${company.company_name}`);
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
        nome: company.company_name || 'Empresa sem nome',
        empresa: company.company_name || 'Empresa sem nome',
        telefone: company.phone || '',
        email: company.email || '',
        website: company.website || company.linkedin_url || ''
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
    if (!formData.keyword) {
      toast.error('❌ Por favor, digite uma palavra-chave');
      return;
    }

    // Clear previous results
    setResults([]);
    setCurrentRun(null);

    console.log('🚀 Iniciando LinkedIn scraping com:', formData);

    setIsRunning(true);
    
    try {
      const response = await fetch('/api/apify/run/QwLfX9hYQXhA84LY3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keyword: formData.keyword,
          page_number: parseInt(formData.pageNumber),
          limit: parseInt(formData.limit)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('🚀 LinkedIn scraping iniciado!');
        setCurrentRun({
          id: data.runId,
          status: 'RUNNING',
          startedAt: new Date(),
          keyword: formData.keyword
        });
        
        pollResults(data.runId);
      } else {
        toast.error('Erro ao iniciar scraper: ' + data.message);
        setIsRunning(false);
      }
    } catch (error) {
      console.error('❌ Erro completo:', error);
      toast.error(`❌ Erro ao conectar: ${error.message}`);
      setIsRunning(false);
    }
  };

  const pollResults = async (runId) => {
    try {
      const response = await fetch(`/api/apify/runs/${runId}`);
      const data = await response.json();
      
      if (data.success) {
        setCurrentRun(prev => ({
          ...prev,
          status: data.status,
          finishedAt: data.finishedAt
        }));
        
        if (data.status === 'RUNNING') {
          setTimeout(() => pollResults(runId), 5000);
        } else if (data.status === 'SUCCEEDED') {
          setIsRunning(false);
          
          if (data.results && data.results.length > 0) {
            const uniqueResults = removeDuplicatesFromResults(data.results);
            setResults(uniqueResults);
            
            const removedCount = data.results.length - uniqueResults.length;
            let message = removedCount > 0 
              ? `✅ Scraping concluído! ${uniqueResults.length} empresas únicas (${removedCount} duplicatas removidas)`
              : `✅ Scraping concluído! ${uniqueResults.length} empresas encontradas`;
            
            toast.success(message);
          } else {
            console.log('⚠️ Scraping concluído mas sem resultados');
            toast.warning('⚠️ Scraping concluído, mas nenhum resultado foi encontrado. Tente com termos diferentes.');
          }
        } else if (data.status === 'FAILED') {
          toast.error('❌ Scraping falhou');
          setIsRunning(false);
        } else {
          setIsRunning(false);
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
      setIsRunning(false);
      toast.error('❌ Erro ao verificar status do scraping');
    }
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
        nome: company.company_name || 'Empresa sem nome',
        empresa: company.company_name || 'Empresa sem nome',
        telefone: company.phone || '',
        email: company.email || '',
        endereco: company.address || company.location || '',
        website: company.website || company.linkedin_url || '',
        categoria: company.industry || 'LinkedIn Lead',
        fonte: 'LinkedIn Scraping',
        dados_originais: company,
        notas: `Busca LinkedIn: ${formData.keyword} | Funcionários: ${company.employees_count || 'N/A'} | Seguidores: ${company.followers_count || 'N/A'}`
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
        'Nome da Empresa': company.company_name || '',
        'ID da Empresa': company.company_id || '',
        'URL LinkedIn': company.linkedin_url || '',
        'Website': company.website || '',
        'Indústria': company.industry || '',
        'Localização': company.location || company.address || '',
        'Tamanho da Empresa': company.company_size || '',
        'Número de Funcionários': company.employees_count || '',
        'Número de Seguidores': company.followers_count || '',
        'Especialidades': company.specialties || '',
        'Descrição': company.description || '',
        'Telefone': company.phone || '',
        'Email': company.email || '',
        'Palavra-chave Pesquisada': formData.keyword,
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

      <MainGrid>
        <Card>
          <CardTitle>🎯 Palavras-Chave Sugeridas</CardTitle>
          <KeywordsGrid>
            {Object.entries(businessKeywords).map(([category, keywords]) => (
              <KeywordCategory key={category}>
                <CategoryTitle>{category}</CategoryTitle>
                <KeywordList>
                  {keywords.map(keyword => (
                    <KeywordTag
                      key={keyword}
                      onClick={() => setKeyword(keyword)}
                    >
                      {keyword}
                    </KeywordTag>
                  ))}
                </KeywordList>
              </KeywordCategory>
            ))}
          </KeywordsGrid>
        </Card>

        <Card>
          <CardTitle>⚙️ Configuração do Scraping</CardTitle>
          
          <FormGroup style={{ marginBottom: '1.5rem' }}>
            <Label>Palavra-Chave</Label>
            <Input
              type="text"
              name="keyword"
              value={formData.keyword}
              onChange={handleInputChange}
              placeholder="Ex: tech, marketing, finance..."
              required
            />
          </FormGroup>

          <FormGrid>
            <FormGroup>
              <Label>Página</Label>
              <Select
                name="pageNumber"
                value={formData.pageNumber}
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
              <Label>Limite de Empresas</Label>
              <Select
                name="limit"
                value={formData.limit}
                onChange={handleInputChange}
              >
                <option value={10}>10 empresas</option>
                <option value={25}>25 empresas</option>
                <option value={50}>50 empresas (padrão)</option>
                <option value={100}>100 empresas</option>
                <option value={200}>200 empresas</option>
              </Select>
            </FormGroup>
          </FormGrid>

          <RunButton
            onClick={runScraper}
            disabled={isRunning || !formData.keyword}
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
      </MainGrid>

      {currentRun && (
        <ResultsCard>
          <StatusBadge status={currentRun.status}>
            {currentRun.status === 'RUNNING' && '🔄 Processando...'}
            {currentRun.status === 'SUCCEEDED' && '✅ Concluído'}
            {currentRun.status === 'FAILED' && '❌ Falhou'}
            {currentRun.status}
          </StatusBadge>
          
          <div style={{ color: '#e0e0e0', marginBottom: '1rem' }}>
            <div><strong>Palavra-chave:</strong> {currentRun.keyword}</div>
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
                      {company.company_name}
                    </div>
                    <div style={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
                      {company.industry && <div>🏢 {company.industry}</div>}
                      {company.location && <div>📍 {company.location}</div>}
                      {company.linkedin_url && <div>🔗 {company.linkedin_url}</div>}
                      {company.employees_count && <div>👥 {company.employees_count} funcionários</div>}
                      {company.followers_count && <div>👥 {company.followers_count} seguidores</div>}
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

          {/* Mostrar quando todos os leads já existem na base */}
          {results.length > 0 && filteredResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#0077b5' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
              <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                Todas as {results.length} empresas já estão na sua base
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Tente com palavras-chave diferentes ou altere a página de busca
              </div>
            </div>
          )}
        </ResultsCard>
      )}
    </Container>
  );
};

export default LinkedInScraper;