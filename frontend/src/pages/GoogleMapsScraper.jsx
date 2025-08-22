import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

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

const GoogleMapsScraper = () => {
  const [formData, setFormData] = useState({
    searchTerms: '',
    locationQuery: ''
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState(null);
  const [results, setResults] = useState([]);

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

  const runScraper = async () => {
    if (!formData.searchTerms || !formData.locationQuery) {
      if (!formData.searchTerms) {
        toast.error('❌ Por favor, selecione ou digite uma palavra-chave');
      } else if (!formData.locationQuery) {
        toast.error('❌ Por favor, selecione ou digite uma localização');
      }
      return;
    }

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