import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
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
`;

const Subtitle = styled.p`
  color: #e0e0e0;
  font-size: 1.2rem;
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto;
`;

const FormCard = styled.div`
  background: 
    linear-gradient(135deg, rgba(0, 255, 170, 0.1) 0%, rgba(0, 136, 204, 0.1) 100%),
    rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 170, 0.2);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const FormTitle = styled.h3`
  color: #00ffaa;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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

const TextArea = styled.textarea`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 170, 0.3);
  color: #e0e0e0;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #00ffaa;
    box-shadow: 0 0 0 2px rgba(0, 255, 170, 0.2);
  }
  
  &::placeholder {
    color: rgba(224, 224, 224, 0.5);
  }
`;

const RunButton = styled.button`
  background: linear-gradient(135deg, #00ffaa, #00ccff);
  border: none;
  color: #000;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 255, 170, 0.3);
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
  border: 1px solid rgba(0, 204, 255, 0.3);
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
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
          background: linear-gradient(135deg, #00ccff, #0088cc);
          color: #000;
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

const ResultItem = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 255, 170, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const ResultTitle = styled.h4`
  color: #00ffaa;
  margin-bottom: 0.5rem;
`;

const ResultInfo = styled.div`
  color: #e0e0e0;
  font-size: 0.9rem;
  
  .field {
    margin-bottom: 0.25rem;
  }
  
  .label {
    color: #00ccff;
    font-weight: bold;
  }
`;

const ExampleQueries = styled.div`
  background: rgba(0, 136, 204, 0.1);
  border: 1px solid rgba(0, 204, 255, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const ExampleTitle = styled.h4`
  color: #00ccff;
  margin-bottom: 0.5rem;
`;

const ExampleList = styled.ul`
  color: #e0e0e0;
  margin: 0;
  padding-left: 1.5rem;
  
  li {
    margin-bottom: 0.25rem;
    cursor: pointer;
    
    &:hover {
      color: #00ffaa;
    }
  }
`;

const GooglePlacesScraper = () => {
  const [formData, setFormData] = useState({
    searchQuery: '',
    location: '',
    maxResults: 50,
    language: 'pt-BR',
    includeClosed: false,
    includePhotos: true,
    includeReviews: false
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState(null);
  const [results, setResults] = useState([]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const setExampleQuery = (query, location) => {
    setFormData(prev => ({
      ...prev,
      searchQuery: query,
      location: location
    }));
  };

  const runScraper = async () => {
    if (!formData.searchQuery || !formData.location) {
      toast.error('Por favor, preencha a busca e localização');
      return;
    }

    setIsRunning(true);
    
    try {
      const response = await fetch('/api/apify/run/compass~crawler-google-places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchQuery: formData.searchQuery,
          locationQuery: formData.location,
          maxResults: parseInt(formData.maxResults),
          language: formData.language,
          includeClosed: formData.includeClosed,
          includeImages: formData.includePhotos,
          includeReviews: formData.includeReviews
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Scraper iniciado com sucesso!');
        setCurrentRun({
          id: data.runId,
          status: 'RUNNING',
          startedAt: new Date()
        });
        
        // Start polling for results
        pollResults(data.runId);
      } else {
        toast.error('Erro ao iniciar scraper');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao conectar com o servidor');
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
          toast.success('Scraping concluído com sucesso!');
          setIsRunning(false);
        } else if (data.status === 'FAILED') {
          toast.error('Scraping falhou');
          setIsRunning(false);
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
      setTimeout(() => pollResults(runId), 10000); // Retry in 10s
    }
  };

  return (
    <Container>
      <Header>
        <Title>🗺️ Google Places Scraper</Title>
        <Subtitle>
          Extraia dados detalhados de empresas do Google Places/Maps. 
          Perfeito para pesquisa de mercado e geração de leads.
        </Subtitle>
      </Header>

      <FormCard>
        <FormTitle>Configuração da Busca</FormTitle>
        
        <ExampleQueries>
          <ExampleTitle>💡 Exemplos de buscas:</ExampleTitle>
          <ExampleList>
            <li onClick={() => setExampleQuery('restaurantes', 'São Paulo, SP')}>
              Restaurantes em São Paulo, SP
            </li>
            <li onClick={() => setExampleQuery('dentistas', 'Rio de Janeiro, RJ')}>
              Dentistas no Rio de Janeiro, RJ
            </li>
            <li onClick={() => setExampleQuery('academias', 'Belo Horizonte, MG')}>
              Academias em Belo Horizonte, MG
            </li>
            <li onClick={() => setExampleQuery('pet shop', 'Curitiba, PR')}>
              Pet shops em Curitiba, PR
            </li>
          </ExampleList>
        </ExampleQueries>

        <FormGrid>
          <FormGroup>
            <Label>Termo de Busca *</Label>
            <Input
              type="text"
              name="searchQuery"
              value={formData.searchQuery}
              onChange={handleInputChange}
              placeholder="Ex: restaurantes, dentistas, academias"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Localização *</Label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Ex: São Paulo, SP ou Rua Augusta, São Paulo"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Máximo de Resultados</Label>
            <Select
              name="maxResults"
              value={formData.maxResults}
              onChange={handleInputChange}
            >
              <option value={20}>20 resultados</option>
              <option value={50}>50 resultados</option>
              <option value={100}>100 resultados</option>
              <option value={200}>200 resultados</option>
              <option value={500}>500 resultados</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Idioma</Label>
            <Select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </Select>
          </FormGroup>
        </FormGrid>

        <FormGrid>
          <FormGroup>
            <Label>
              <input
                type="checkbox"
                name="includeClosed"
                checked={formData.includeClosed}
                onChange={handleInputChange}
                style={{ marginRight: '0.5rem' }}
              />
              Incluir estabelecimentos fechados
            </Label>
          </FormGroup>

          <FormGroup>
            <Label>
              <input
                type="checkbox"
                name="includePhotos"
                checked={formData.includePhotos}
                onChange={handleInputChange}
                style={{ marginRight: '0.5rem' }}
              />
              Incluir fotos dos estabelecimentos
            </Label>
          </FormGroup>

          <FormGroup>
            <Label>
              <input
                type="checkbox"
                name="includeReviews"
                checked={formData.includeReviews}
                onChange={handleInputChange}
                style={{ marginRight: '0.5rem' }}
              />
              Incluir avaliações (mais lento)
            </Label>
          </FormGroup>
        </FormGrid>

        <RunButton
          onClick={runScraper}
          disabled={isRunning || !formData.searchQuery || !formData.location}
        >
          {isRunning ? '🔄 Executando Scraping...' : '🚀 Iniciar Scraping'}
        </RunButton>
      </FormCard>

      {currentRun && (
        <ResultsCard>
          <StatusBadge status={currentRun.status}>
            {currentRun.status === 'RUNNING' && '🔄 Executando...'}
            {currentRun.status === 'SUCCEEDED' && '✅ Concluído'}
            {currentRun.status === 'FAILED' && '❌ Falhou'}
            {currentRun.status}
          </StatusBadge>
          
          <div style={{ color: '#e0e0e0', marginBottom: '1rem' }}>
            <div>Iniciado: {new Date(currentRun.startedAt).toLocaleString()}</div>
            {currentRun.finishedAt && (
              <div>Finalizado: {new Date(currentRun.finishedAt).toLocaleString()}</div>
            )}
          </div>

          {results.length > 0 && (
            <div>
              <h3 style={{ color: '#00ffaa', marginBottom: '1rem' }}>
                📊 Resultados Encontrados ({results.length})
              </h3>
              
              {results.slice(0, 10).map((place, index) => (
                <ResultItem key={index}>
                  <ResultTitle>{place.title || place.name}</ResultTitle>
                  <ResultInfo>
                    {place.address && (
                      <div className="field">
                        <span className="label">📍 Endereço:</span> {place.address}
                      </div>
                    )}
                    {place.phone && (
                      <div className="field">
                        <span className="label">📞 Telefone:</span> {place.phone}
                      </div>
                    )}
                    {place.website && (
                      <div className="field">
                        <span className="label">🌐 Website:</span> {place.website}
                      </div>
                    )}
                    {place.rating && (
                      <div className="field">
                        <span className="label">⭐ Avaliação:</span> {place.rating} ({place.reviewsCount} avaliações)
                      </div>
                    )}
                    {place.category && (
                      <div className="field">
                        <span className="label">🏷️ Categoria:</span> {place.category}
                      </div>
                    )}
                  </ResultInfo>
                </ResultItem>
              ))}
              
              {results.length > 10 && (
                <div style={{ color: '#00ccff', textAlign: 'center', marginTop: '1rem' }}>
                  ... e mais {results.length - 10} resultados
                </div>
              )}
            </div>
          )}
        </ResultsCard>
      )}
    </Container>
  );
};

export default GooglePlacesScraper;