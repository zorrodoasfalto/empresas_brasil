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

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #00ffaa 0%, #0088cc 100%);
  color: #0a0a19;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 180px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    box-shadow: 
      0 0 25px rgba(0, 255, 170, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

const GoogleMapsScraper = () => {
  const [formData, setFormData] = useState({
    searchTerms: '',
    locationQuery: ''
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState(null);
  const [results, setResults] = useState([]);
  const { user } = useAuth();

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
          includeWebResults: false,
          language: "pt-BR",
          locationQuery: formData.locationQuery,
          maxCrawledPlacesPerSearch: 50,
          maxImages: 0,
          maximumLeadsEnrichmentRecords: 0,
          scrapeContacts: false,
          scrapeDirectories: false,
          scrapeImageAuthors: false,
          scrapePlaceDetailPage: false,
          scrapeReviewsPersonalData: true,
          scrapeTableReservationProvider: false,
          searchStringsArray: [formData.searchTerms],
          skipClosedPlaces: false
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
          setResults(data.results);
          toast.success(`✅ Scraping concluído! ${data.results.length} empresas encontradas`);
          setIsRunning(false);
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
    console.log('🔍 saveAllLeads called - results:', results?.length, 'user:', !!user);
    
    if (!results || results.length === 0) {
      toast.warning('Nenhum resultado para salvar');
      return;
    }

    if (!user || !user.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const leadsToSave = results.map(place => ({
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

      let savedCount = 0;
      let errorCount = 0;

      console.log('🔍 About to save leads:', leadsToSave.length, 'leads');
      console.log('🔍 First lead sample:', leadsToSave[0]);

      for (const lead of leadsToSave) {
        try {
          const token = localStorage.getItem('token');
          console.log('🔍 Token exists:', !!token);
          console.log('🔍 Saving lead:', lead.nome);
          console.log('🔍 Lead data:', JSON.stringify(lead, null, 2));
          
          const response = await fetch('/api/crm/leads-save-test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(lead)
          });

          console.log('🔍 Response status:', response.status);
          console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
          
          let result;
          try {
            result = await response.json();
          } catch (parseError) {
            console.error('🔍 Failed to parse JSON response:', parseError);
            const text = await response.text();
            console.error('🔍 Raw response:', text);
            result = { error: 'Failed to parse response', raw: text };
          }
          
          console.log('🔍 Save response:', response.status, result);

          if (response.ok) {
            savedCount++;
          } else {
            errorCount++;
            console.error('🔍 Save failed:', result);
          }
        } catch (error) {
          errorCount++;
          console.error('🔍 Network error:', error);
          console.error('🔍 Error details:', error.message, error.stack);
        }
      }

      console.log('🔍 Final counts:', { savedCount, errorCount, total: leadsToSave.length });
      
      if (savedCount > 0) {
        toast.success(`✅ ${savedCount} leads salvos com sucesso!`);
      }
      if (errorCount > 0) {
        toast.error(`❌ ${errorCount} leads falharam ao salvar. Verifique o console (F12) para mais detalhes.`);
      }
      if (savedCount === 0 && errorCount === 0) {
        toast.warning('⚠️ Nenhum lead foi processado');
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
      const exportData = results.map((place, index) => ({
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

      <MainGrid>
        <Card>
          <CardTitle>🔍 Palavras-Chave por Categoria</CardTitle>
          <KeywordsGrid>
            {Object.entries(businessKeywords).map(([category, keywords]) => (
              <KeywordCategory key={category}>
                <CategoryTitle>{category}</CategoryTitle>
                <KeywordList>
                  {keywords.map((keyword) => (
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
          <CardTitle>📍 Principais Cidades</CardTitle>
          <LocationsGrid>
            {popularLocations.map((location) => (
              <LocationTag
                key={location}
                onClick={() => setLocation(location)}
              >
                {location}
              </LocationTag>
            ))}
          </LocationsGrid>
        </Card>
      </MainGrid>

      <Card>
        <CardTitle>⚙️ Configuração do Scraping</CardTitle>
        
        <FormGrid>
          <FormGroup>
            <Label>Palavra-Chave Selecionada</Label>
            <Input
              type="text"
              name="searchTerms"
              value={formData.searchTerms}
              onChange={handleInputChange}
              placeholder="Clique em uma palavra-chave acima ou digite"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Localização Selecionada</Label>
            <Input
              type="text"
              name="locationQuery"
              value={formData.locationQuery}
              onChange={handleInputChange}
              placeholder="Clique em uma cidade acima ou digite"
              required
            />
          </FormGroup>
        </FormGrid>

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
        
        <RunButton
          onClick={addTestResults}
          style={{background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)', marginTop: '0.5rem'}}
        >
          🧪 Adicionar Dados de Teste (Debug)
        </RunButton>
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

          {results.length > 0 && (
            <div>
              <h3 style={{ color: '#00ffaa', marginBottom: '1rem' }}>
                📊 {results.length} Empresas Encontradas
              </h3>
              
              <ActionButtonsContainer>
                <ActionButton onClick={saveAllLeads}>
                  💾 Salvar Todos os Leads
                </ActionButton>
                <ActionButton 
                  onClick={exportToExcel}
                  style={{background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', border: '2px solid #ff0000'}}
                >
                  📊 Exportar para Excel
                </ActionButton>
                <ActionButton onClick={clearResults} style={{background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'}}>
                  🗑️ Limpar Resultados
                </ActionButton>
              </ActionButtonsContainer>
              
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                {results.slice(0, 20).map((place, index) => (
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
              
              {results.length > 20 && (
                <div style={{ color: '#00ccff', textAlign: 'center', marginTop: '1rem' }}>
                  ... e mais {results.length - 20} empresas encontradas
                </div>
              )}
            </div>
          )}
        </ResultsCard>
      )}
    </Container>
  );
};

export default GoogleMapsScraper;