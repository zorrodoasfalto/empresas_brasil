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

const GoogleIcon = styled.div`
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
  color: #00ccff;
  margin-bottom: 0.75rem;
  font-size: 1rem;
`;

const KeywordList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const KeywordTag = styled.span`
  background: linear-gradient(135deg, rgba(0, 255, 170, 0.2), rgba(0, 136, 204, 0.2));
  border: 1px solid rgba(0, 255, 170, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, rgba(0, 255, 170, 0.3), rgba(0, 136, 204, 0.3));
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
  color: #00ccff;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
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
    color: rgba(224, 224, 224, 0.5);
  }
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

const RunButton = styled.button`
  background: linear-gradient(135deg, #4285f4, #1a73e8);
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
    background: linear-gradient(135deg, #1a73e8, #4285f4);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(66, 133, 244, 0.3);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    transform: none;
    color: #666;
  }
`;

const LocationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
`;

const LocationTag = styled.div`
  background: rgba(66, 133, 244, 0.1);
  border: 1px solid rgba(66, 133, 244, 0.3);
  padding: 0.5rem;
  border-radius: 6px;
  text-align: center;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(66, 133, 244, 0.2);
    transform: translateY(-1px);
  }
`;

const ResultsCard = styled.div`
  background: rgba(15, 15, 35, 0.6);
  border: 1px solid rgba(0, 204, 255, 0.3);
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
          background: linear-gradient(135deg, #4285f4, #1a73e8);
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


const GoogleMapsScraper = () => {
  const [formData, setFormData] = useState({
    searchTerms: '',
    locationQuery: '',
    maxResults: 50
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState(null);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [debugMode, setDebugMode] = useState(false);
  const [autoSearching, setAutoSearching] = useState(false);
  const [searchAttempts, setSearchAttempts] = useState(0);
  const { user } = useAuth();

  // Remove internal duplicates from scraping results
  const removeDuplicatesFromResults = (results) => {
    if (!results || results.length === 0) return [];
    
    const seen = new Set();
    const uniqueResults = [];
    
    for (const place of results) {
      // Create unique identifier based on name, address, and phone
      const identifier = `${place.title || place.name || ''}_${place.address || ''}_${place.phone || ''}`.toLowerCase();
      
      if (!seen.has(identifier)) {
        seen.add(identifier);
        uniqueResults.push(place);
      } else {
        console.log(`🔄 Duplicate removed from scraping results: ${place.title || place.name}`);
      }
    }
    
    const removedCount = results.length - uniqueResults.length;
    if (removedCount > 0) {
      console.log(`🔄 Removed ${removedCount} internal duplicates from scraping results`);
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
      const leadsToCheck = resultsToFilter.map(place => ({
        nome: place.title || place.name || 'Empresa sem nome',
        empresa: place.title || place.name || 'Empresa sem nome', 
        telefone: place.phone || '',
        email: place.email || ''
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
        console.log('🔍 Duplicate check response:', data);
        console.log('🔍 Raw leads to check:', leadsToCheck.slice(0, 3));
        console.log('🔍 Existing lead IDs from backend:', data.existingLeads?.slice(0, 10));
        
        const existingIds = new Set(data.existingLeads);
        
        const newLeads = resultsToFilter.filter((place, index) => {
          const lead = leadsToCheck[index];
          const leadId = `${lead.nome}_${lead.empresa}_${lead.telefone}_${lead.email}`;
          const isExisting = existingIds.has(leadId);
          
          if (index < 3) {
            console.log(`🔍 Lead ${index + 1}: ${lead.nome} | ID: ${leadId} | Exists: ${isExisting}`);
          }
          
          return !isExisting;
        });

        const filteredCount = resultsToFilter.length - newLeads.length;
        setFilteredResults(newLeads);
        
        console.log(`🔍 Total leads from scraping: ${resultsToFilter.length}`);
        console.log(`🔍 Leads after filtering: ${newLeads.length}`);
        console.log(`🔍 Filtered out ${filteredCount} existing leads from database`);
        
        if (filteredCount > 0) {
          toast.info(`🔄 ${filteredCount} leads já existentes foram filtrados - restaram ${newLeads.length} leads novos`);
        }
      } else {
        console.log('🔍 Duplicate check failed, showing all results');
        setFilteredResults(resultsToFilter);
      }
    } catch (error) {
      console.error('Error filtering existing leads:', error);
      setFilteredResults(resultsToFilter);
    }
  };

  // Filter existing leads whenever results change
  React.useEffect(() => {
    if (debugMode) {
      console.log('🔧 Debug mode: showing all results without filtering');
      setFilteredResults(results);
    } else {
      filterExistingLeads(results);
    }
  }, [results, debugMode]);

  // Auto-expand search when no new leads found
  React.useEffect(() => {
    if (results.length > 0 && filteredResults.length === 0 && !debugMode && !autoSearching && searchAttempts < 3) {
      console.log(`🔄 No new leads found, expanding search (attempt ${searchAttempts + 1}/3)`);
      expandSearch();
    } else if (filteredResults.length > 0 && autoSearching) {
      // Found new leads! Stop auto searching
      console.log(`✅ Found ${filteredResults.length} new leads! Stopping auto search.`);
      setAutoSearching(false);
      toast.success(`🎯 Busca automática bem-sucedida! Encontrados ${filteredResults.length} leads novos!`);
    }
  }, [filteredResults, results, debugMode, autoSearching, searchAttempts]);

  const expandSearch = async () => {
    if (autoSearching || !formData.searchTerms || !formData.locationQuery) return;
    
    setAutoSearching(true);
    setSearchAttempts(prev => prev + 1);
    
    const strategies = [
      // Strategy 1: Increase results limit
      {
        ...formData,
        maxResults: Math.min(formData.maxResults * 2, 200)
      },
      // Strategy 2: Expand location
      {
        ...formData,
        locationQuery: expandLocationQuery(formData.locationQuery),
        maxResults: Math.min(formData.maxResults * 1.5, 150)
      },
      // Strategy 3: Add related keywords
      {
        ...formData,
        searchTerms: expandSearchTerms(formData.searchTerms),
        maxResults: Math.min(formData.maxResults * 2, 200)
      }
    ];

    const strategy = strategies[searchAttempts - 1] || strategies[0];
    setFormData(strategy);
    
    toast.info(`🔄 Buscando mais leads... Estratégia ${searchAttempts}: ${getStrategyDescription(searchAttempts)}`);
    
    // Wait a moment then run new search
    setTimeout(() => {
      runScraper();
    }, 1000);
  };

  const expandLocationQuery = (location) => {
    const expansions = {
      'São Paulo, SP': 'Grande São Paulo, SP',
      'Rio de Janeiro, RJ': 'Grande Rio de Janeiro, RJ', 
      'Belo Horizonte, MG': 'Região Metropolitana de Belo Horizonte, MG'
    };
    
    return expansions[location] || `${location.split(',')[0]}, Brasil`;
  };

  const expandSearchTerms = (terms) => {
    const variations = {
      'restaurantes': 'restaurantes OR lanchonetes OR food',
      'padarias': 'padarias OR confeitarias OR panificadoras',
      'farmácias': 'farmácias OR drogarias',
      'supermercados': 'supermercados OR mercados OR mercadinhos'
    };
    
    return variations[terms.toLowerCase()] || `${terms} OR empresas`;
  };

  const getStrategyDescription = (attempt) => {
    switch(attempt) {
      case 1: return 'Aumentando limite de resultados';
      case 2: return 'Expandindo área geográfica';
      case 3: return 'Variando termos de busca';
      default: return 'Otimizando busca';
    }
  };

  const resetAutoSearch = () => {
    setAutoSearching(false);
    setSearchAttempts(0);
  };


  const businessKeywords = {
    'Alimentação': [
      'restaurantes', 'lanchonetes', 'pizzarias', 'hamburguerias', 'cafeterias', 
      'padarias', 'confeitarias', 'sorveterias', 'açaí', 'food truck'
    ],
    'Saúde': [
      'dentistas', 'médicos', 'clínicas', 'laboratórios', 'farmácias', 
      'fisioterapeutas', 'psicólogos', 'veterinários', 'hospitais'
    ],
    'Beleza': [
      'salões de beleza', 'barbearias', 'manicures', 'estética', 'spa',
      'clínicas estéticas', 'massagem', 'depilação'
    ],
    'Fitness': [
      'academias', 'personal trainer', 'crossfit', 'pilates', 'yoga',
      'artes marciais', 'natação', 'funcional'
    ],
    'Varejo': [
      'lojas de roupas', 'calçados', 'eletrônicos', 'móveis', 'decoração',
      'livrarias', 'papelarias', 'pet shop', 'farmácias'
    ],
    'Serviços': [
      'advogados', 'contadores', 'consultórios', 'oficinas', 'auto center',
      'lavanderias', 'chaveiros', 'serralheiros', 'eletricistas'
    ],
    'Educação': [
      'escolas', 'cursos', 'universidades', 'idiomas', 'reforço escolar',
      'creches', 'pré-escola', 'ensino técnico'
    ],
    'Entretenimento': [
      'cinemas', 'bares', 'baladas', 'karaokê', 'boliche', 'escape room',
      'parques', 'teatros', 'museus'
    ]
  };

  const popularLocations = [
    'São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Salvador, BA',
    'Brasília, DF', 'Fortaleza, CE', 'Curitiba, PR', 'Recife, PE',
    'Porto Alegre, RS', 'Manaus, AM', 'Belém, PA', 'Goiânia, GO',
    'Campinas, SP', 'São Luís, MA', 'São Gonçalo, RJ', 'Maceió, AL',
    'Duque de Caxias, RJ', 'Natal, RN', 'Teresina, PI', 'Campo Grande, MS'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const setKeyword = (keyword) => {
    setFormData(prev => ({ ...prev, searchTerms: keyword }));
  };

  const setLocation = (location) => {
    setFormData(prev => ({ ...prev, locationQuery: location }));
  };

  const clearResults = () => {
    setResults([]);
    setCurrentRun(null);
    toast.info('🗑️ Resultados anteriores limpos');
  };

  // Função temporária para adicionar dados de teste
  const addTestResults = () => {
    console.log('🔍 addTestResults called - current results:', results.length);
    const testData = [
      {
        title: 'Restaurante Dom Luigi',
        name: 'Dom Luigi Restaurante',
        address: 'Rua Augusta, 123 - São Paulo, SP',
        phone: '(11) 3456-7890',
        website: 'https://domluigi.com.br',
        email: 'contato@domluigi.com.br',
        rating: 4.5,
        reviewsCount: 245,
        categoryName: 'Restaurante Italiano',
        openingHours: '18:00-23:00',
        location: { lat: -23.5505, lng: -46.6333 }
      },
      {
        title: 'Padaria Central',
        name: 'Padaria Central Ltda',
        address: 'Av. Paulista, 456 - São Paulo, SP',
        phone: '(11) 2345-6789',
        website: 'https://padariacentral.com.br',
        email: 'vendas@padariacentral.com.br',
        rating: 4.2,
        reviewsCount: 180,
        categoryName: 'Padaria',
        openingHours: '06:00-20:00',
        location: { lat: -23.5515, lng: -46.6343 }
      }
    ];
    
    setResults(testData);
    setFormData({ searchTerms: 'restaurantes', locationQuery: 'São Paulo, SP' });
    console.log('🔍 Test data set - new results length:', testData.length);
    toast.success('🧪 Dados de teste adicionados! Agora teste os botões.');
  };

  const runScraper = async () => {
    if (!formData.searchTerms || !formData.locationQuery) {
      if (!formData.searchTerms) {
        toast.error('❌ Por favor, selecione ou digite uma palavra-chave');
      } else if (!formData.locationQuery) {
        toast.error('❌ Por favor, selecione ou digite uma localização');
      }
      return;
    }

    // Reset auto search when manually starting new search
    if (!autoSearching) {
      resetAutoSearch();
    }

    // Limpar resultados anteriores automaticamente antes de nova busca
    setResults([]);
    setCurrentRun(null);

    console.log('🚀 Iniciando scraping com:', {
      searchTerms: formData.searchTerms,
      locationQuery: formData.locationQuery
    });

    setIsRunning(true);
    
    try {
      const response = await fetch('/api/apify/run/nwua9Gu5YrADL7ZDj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locationQuery: formData.locationQuery,
          searchStringsArray: [formData.searchTerms],
          maxCrawledPlacesPerSearch: parseInt(formData.maxResults),
          language: "pt-BR"
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('🚀 Google Maps scraping iniciado!');
        setCurrentRun({
          id: data.runId,
          status: 'RUNNING',
          startedAt: new Date(),
          searchTerms: formData.searchTerms,
          locationQuery: formData.locationQuery
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
        } else if (data.status === 'SUCCEEDED' && data.results) {
          const uniqueResults = removeDuplicatesFromResults(data.results);
          setResults(uniqueResults);
          
          const removedCount = data.results.length - uniqueResults.length;
          let message = removedCount > 0 
            ? `✅ Scraping concluído! ${uniqueResults.length} empresas únicas (${removedCount} duplicatas removidas)`
            : `✅ Scraping concluído! ${uniqueResults.length} empresas encontradas`;
          
          if (autoSearching) {
            message += ` (Busca automática ${searchAttempts}/3)`;
          }
          
          toast.success(message);
          setIsRunning(false);
          
          // If auto-searching and found results, we'll let the useEffect handle filtering and potential expansion
          if (!autoSearching) {
            setAutoSearching(false);
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
      setTimeout(() => pollResults(runId), 10000);
    }
  };

  const saveAllLeads = async () => {
    console.log('🔍 saveAllLeads called');
    console.log('🔍 Results length:', results?.length);
    
    // Use filtered results (only new leads)
    let dataToSave = filteredResults;
    if (!dataToSave || dataToSave.length === 0) {
      toast.error('❌ Nenhum resultado encontrado para salvar. Execute uma busca primeiro.');
      return;
    }

    const token = localStorage.getItem('token');
    console.log('🔍 Token exists:', !!token);
    console.log('🔍 Token first 20 chars:', token?.substring(0, 20) + '...');
    
    if (!token) {
      toast.error('Você precisa estar logado para salvar leads');
      return;
    }

    try {
      const leadsToProcess = dataToSave.map(place => ({
        nome: place.title || place.name || 'Empresa sem nome',
        empresa: place.title || place.name || 'Empresa sem nome',
        telefone: place.phone || '',
        email: place.email || '',
        endereco: place.address || '',
        website: place.website || '',
        categoria: place.categoryName || 'Google Maps Lead',
        rating: place.rating || null,
        reviews_count: place.reviewsCount || 0,
        fonte: 'Google Maps Scraping',
        dados_originais: place,
        notas: `Busca: ${formData.searchTerms} em ${formData.locationQuery}`
      }));

      console.log('🔍 Leads to save:', leadsToProcess.length);
      const leadsToSave = leadsToProcess;
      console.log('🔍 First lead data:', JSON.stringify(leadsToSave[0], null, 2));
      
      let savedCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < leadsToSave.length; i++) {
        const lead = leadsToSave[i];
        console.log(`🔍 Saving lead ${i + 1}/${leadsToSave.length}:`, lead.nome);
        
        try {
          const response = await fetch('/api/crm/leads', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(lead)
          });

          console.log(`🔍 Response status for ${lead.nome}:`, response.status);
          
          const data = await response.json();
          console.log(`🔍 Response data for ${lead.nome}:`, data);
          
          if (data.success) {
            savedCount++;
            console.log(`✅ Lead ${i + 1} saved successfully`);
          } else {
            errorCount++;
            console.error(`❌ Failed to save lead ${i + 1}:`, data.message || 'Erro desconhecido');
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Network error for lead ${i + 1}:`, error);
        }
      }
      
      console.log('🔍 Final results:', { savedCount, errorCount, total: leadsToSave.length });
      
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

  const exportToExcel = () => {
    console.log('🔍 exportToExcel called - results:', results?.length);
    toast.info('🔍 Botão Excel clicado! Iniciando exportação...');
    if (!results || results.length === 0) {
      toast.warning('Nenhum resultado para exportar');
      return;
    }

    try {
      const dataToExport = data || filteredResults || results || [];
      const exportData = dataToExport.map((place, index) => ({
        'Nº': index + 1,
        'Nome/Empresa': place.title || place.name || '',
        'Endereço': place.address || '',
        'Telefone': place.phone || '',
        'Website': place.website || '',
        'Email': place.email || '',
        'Avaliação': place.rating || '',
        'Número de Avaliações': place.reviewsCount || 0,
        'Categoria': place.categoryName || '',
        'Horário de Funcionamento': place.openingHours || '',
        'Coordenadas Lat': place.location?.lat || '',
        'Coordenadas Lng': place.location?.lng || '',
        'Busca Realizada': formData.searchTerms,
        'Localização Pesquisada': formData.locationQuery,
        'Data da Exportação': new Date().toLocaleDateString('pt-BR'),
        'Hora da Exportação': new Date().toLocaleTimeString('pt-BR')
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      const columnWidths = [
        { wch: 5 },   // Nº
        { wch: 25 },  // Nome/Empresa
        { wch: 30 },  // Endereço
        { wch: 15 },  // Telefone
        { wch: 25 },  // Website
        { wch: 20 },  // Email
        { wch: 10 },  // Avaliação
        { wch: 15 },  // Número de Avaliações
        { wch: 20 },  // Categoria
        { wch: 20 },  // Horário
        { wch: 12 },  // Lat
        { wch: 12 },  // Lng
        { wch: 20 },  // Busca
        { wch: 20 },  // Localização
        { wch: 12 },  // Data
        { wch: 12 }   // Hora
      ];
      
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Google Maps Results');

      const fileName = `google-maps-${formData.searchTerms?.replace(/\s+/g, '-') || 'busca'}-${formData.locationQuery?.replace(/\s+/g, '-') || 'localizacao'}-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
      toast.success(`✅ Dados exportados para ${fileName}`);

    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar dados para Excel');
    }
  };

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
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 204, 255, 0.2)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0, 204, 255, 0.1)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Voltar ao Dashboard
        </button>
      </div>

      <Header>
        <Title>
          <GoogleIcon>📍</GoogleIcon>
          Google Maps Scraper
        </Title>
        <Subtitle>
          Extraia dados completos de empresas do Google Maps. 
          Escolha palavras-chave e localizações para encontrar leads qualificados.
        </Subtitle>
      </Header>


      <Card>
        <CardTitle>⚙️ Configuração do Scraping</CardTitle>
        
        <FormGrid>
          <FormGroup>
            <Label>Palavra-Chave</Label>
            <Input
              type="text"
              name="searchTerms"
              value={formData.searchTerms}
              onChange={handleInputChange}
              placeholder="Ex: restaurantes, dentistas, academias..."
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Localização</Label>
            <Input
              type="text"
              name="locationQuery"
              value={formData.locationQuery}
              onChange={handleInputChange}
              placeholder="Ex: São Paulo, SP ou Rio de Janeiro, RJ"
              required
            />
          </FormGroup>
        </FormGrid>

        <FormGroup style={{ marginTop: '1rem' }}>
          <Label>Quantidade de Empresas</Label>
          <Select
            name="maxResults"
            value={formData.maxResults}
            onChange={handleInputChange}
          >
            <option value={10}>10 empresas</option>
            <option value={25}>25 empresas</option>
            <option value={50}>50 empresas (padrão)</option>
            <option value={100}>100 empresas</option>
            <option value={200}>200 empresas</option>
            <option value={500}>500 empresas</option>
          </Select>
        </FormGroup>

        <RunButton
          onClick={runScraper}
          disabled={isRunning || !formData.searchTerms || !formData.locationQuery}
        >
          {isRunning ? (
            <>🔄 Executando Scraping...</>
          ) : (
            <>🚀 Iniciar Google Maps Scraping</>
          )}
        </RunButton>

        {/* BOTÕES PRINCIPAIS - SEMPRE VISÍVEIS */}
        <div style={{ 
          marginTop: '2rem', 
          borderTop: '1px solid rgba(0, 255, 170, 0.3)', 
          paddingTop: '1.5rem' 
        }}>
          <h3 style={{ color: '#00ffaa', marginBottom: '1rem', textAlign: 'center' }}>
            🎯 Ações Disponíveis
          </h3>
          
          <ExportButtonsContainer>
            <ExportButton onClick={saveAllLeads}>
              💾 Salvar Todos os Leads {results && results.length > 0 ? `(${results.length})` : '(0)'}
            </ExportButton>
            <ExportButton onClick={exportToExcel}>
              📊 Exportar Excel {results && results.length > 0 ? `(${results.length})` : '(0)'}
            </ExportButton>
          </ExportButtonsContainer>
        </div>
      </Card>

      {currentRun && (
        <ResultsCard>
          <StatusBadge status={currentRun.status}>
            {currentRun.status === 'RUNNING' && '🔄 Processando...'}
            {currentRun.status === 'SUCCEEDED' && '✅ Concluído'}
            {currentRun.status === 'FAILED' && '❌ Falhou'}
            {currentRun.status}
          </StatusBadge>
          
          <div style={{ color: '#e0e0e0', marginBottom: '1rem' }}>
            <div><strong>Busca:</strong> {currentRun.searchTerms} em {currentRun.locationQuery}</div>
            <div><strong>Iniciado:</strong> {new Date(currentRun.startedAt).toLocaleString()}</div>
            {currentRun.finishedAt && (
              <div><strong>Finalizado:</strong> {new Date(currentRun.finishedAt).toLocaleString()}</div>
            )}
          </div>



          {filteredResults.length > 0 && (
            <div>
              <h3 style={{ color: '#00ffaa', marginBottom: '1rem' }}>
                📊 {debugMode ? `${filteredResults.length} Leads (Modo Debug)` : `${filteredResults.length} Leads Novos Encontrados`}
                {autoSearching && (
                  <span style={{ color: '#ff8800', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem', fontWeight: 'bold' }}>
                    🔄 Busca automática ativa - procurando mais leads... ({searchAttempts}/3)
                  </span>
                )}
                {!debugMode && !autoSearching && (
                  <span style={{ color: '#00ccff', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem', opacity: 0.8 }}>
                    Leads que já existem na sua base foram automaticamente filtrados
                  </span>
                )}
              </h3>
              
              <ExportButtonsContainer style={{ marginBottom: '1rem' }}>
                <ExportButton onClick={() => exportToCSV(filteredResults)}>
                  📊 Exportar CSV
                </ExportButton>
                <ExportButton onClick={() => exportToExcel(filteredResults)}>
                  📈 Exportar Excel
                </ExportButton>
                <ExportButton onClick={saveAllLeads} style={{ background: 'linear-gradient(135deg, #00ffaa 0%, #00cc88 100%)' }}>
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
                {filteredResults.slice(0, 20).map((place, index) => (
                  <div key={index} style={{
                    background: 'rgba(0,255,170,0.1)',
                    border: '1px solid rgba(0,255,170,0.2)',
                    borderRadius: '6px',
                    padding: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ color: '#00ffaa', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {place.title || place.name}
                    </div>
                    <div style={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
                      {place.address && <div>📍 {place.address}</div>}
                      {place.phone && <div>📞 {place.phone}</div>}
                      {place.website && <div>🌐 {place.website}</div>}
                      {place.rating && <div>⭐ {place.rating} ({place.reviewsCount} avaliações)</div>}
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredResults.length > 20 && (
                <div style={{ color: '#00ccff', textAlign: 'center', marginTop: '1rem' }}>
                  ... e mais {filteredResults.length - 20} novos leads encontrados
                </div>
              )}
            </div>
          )}
          
          {/* Mostrar quando todos os leads já existem na base */}
          {results.length > 0 && filteredResults.length === 0 && !debugMode && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#00ccff' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
              <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                {autoSearching 
                  ? `Expandindo busca automaticamente... (${searchAttempts}/3)`
                  : `Todos os ${results.length} leads já estão na sua base`
                }
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                {autoSearching
                  ? 'O sistema está automaticamente procurando por mais leads novos'
                  : searchAttempts >= 3
                  ? 'Busca automática finalizada. Tente termos ou localização diferentes.'
                  : 'O sistema tentará automaticamente encontrar mais leads expandindo a busca'
                }
              </div>
              {!autoSearching && searchAttempts < 3 && (
                <ExportButton 
                  onClick={() => setDebugMode(true)}
                  style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)', color: '#fff', margin: '0 auto', display: 'block' }}
                >
                  🔧 Ver Todos os Leads (Debug)
                </ExportButton>
              )}
            </div>
          )}

          {/* Debug mode indicator */}
          {debugMode && results.length > 0 && (
            <div style={{ 
              background: 'rgba(255, 107, 107, 0.1)', 
              border: '1px solid #ff6b6b', 
              borderRadius: '8px', 
              padding: '1rem', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ color: '#ff6b6b', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                🔧 MODO DEBUG ATIVADO
              </div>
              <div style={{ color: '#e0e0e0', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Mostrando TODOS os leads sem filtrar duplicados
              </div>
              <ExportButton 
                onClick={() => setDebugMode(false)}
                style={{ background: 'linear-gradient(135deg, #00ffaa 0%, #00cc88 100%)', color: '#000' }}
              >
                ✅ Voltar ao Modo Normal
              </ExportButton>
            </div>
          )}
          
        </ResultsCard>
      )}
    </Container>
  );
};

export default GoogleMapsScraper;