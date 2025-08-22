import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(15, 15, 35, 0.9), rgba(26, 26, 46, 0.9));
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 170, 0.3);
`;

const Title = styled.h1`
  color: #00ffaa;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: #00ccff;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(0, 255, 170, 0.3);
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 1.1rem;
  
  &:focus {
    outline: none;
    border-color: #00ffaa;
    box-shadow: 0 0 0 3px rgba(0, 255, 170, 0.2);
  }
  
  &::placeholder {
    color: rgba(224, 224, 224, 0.5);
  }
`;

const RunButton = styled.button`
  width: 100%;
  padding: 1.2rem 2rem;
  background: linear-gradient(135deg, #00ffaa, #00ccff);
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover:not(:disabled) {
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

const StatusCard = styled.div`
  background: rgba(0, 136, 204, 0.1);
  border: 1px solid rgba(0, 204, 255, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
  color: #e0e0e0;
`;

const GoogleMapsSimple = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState([]);

  const runScraper = async () => {
    if (!keyword.trim() || !location.trim()) {
      toast.error('❌ Preencha palavra-chave e localização');
      return;
    }

    setIsRunning(true);
    setStatus('🚀 Iniciando scraper...');

    try {
      const response = await fetch('/api/apify/run/nwua9Gu5YrADL7ZDj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          includeWebResults: false,
          language: "pt-BR",
          locationQuery: location.trim(),
          maxCrawledPlacesPerSearch: parseInt(maxResults),
          maxImages: 0,
          maximumLeadsEnrichmentRecords: 0,
          scrapeContacts: false,
          scrapeDirectories: false,
          scrapeImageAuthors: false,
          scrapePlaceDetailPage: false,
          scrapeReviewsPersonalData: true,
          scrapeTableReservationProvider: false,
          searchStringsArray: [keyword.trim()],
          skipClosedPlaces: false
        })
      });

      const responseText = await response.text();
      console.log('Response:', responseText);

      if (!response.ok) {
        setStatus(`❌ Erro ${response.status}: ${responseText}`);
        toast.error(`❌ Erro ${response.status}`);
        setIsRunning(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setStatus(`❌ Resposta inválida do servidor: ${responseText.substring(0, 100)}...`);
        toast.error('❌ Erro: resposta não é JSON válido');
        setIsRunning(false);
        return;
      }

      if (data.success) {
        setStatus(`✅ Scraper iniciado! ID: ${data.runId}`);
        toast.success('🚀 Scraper iniciado com sucesso!');
        
        // Monitor results
        pollResults(data.runId);
      } else {
        setStatus(`❌ Erro: ${data.message}`);
        toast.error(`❌ ${data.message}`);
        setIsRunning(false);
      }
    } catch (error) {
      setStatus(`❌ Erro de conexão: ${error.message}`);
      toast.error(`❌ Erro: ${error.message}`);
      setIsRunning(false);
    }
  };

  const pollResults = async (runId) => {
    try {
      const response = await fetch(`/api/apify/runs/${runId}`);
      const data = await response.json();
      
      if (data.success) {
        if (data.status === 'RUNNING') {
          setStatus(`🔄 Executando... Status: ${data.status}`);
          setTimeout(() => pollResults(runId), 5000);
        } else if (data.status === 'SUCCEEDED') {
          const count = data.results?.length || 0;
          setStatus(`✅ Concluído! Encontradas ${count} empresas`);
          setResults(data.results || []);
          toast.success(`✅ Scraping concluído! ${count} resultados`);
          setIsRunning(false);
        } else if (data.status === 'FAILED') {
          setStatus(`❌ Scraping falhou: ${data.status}`);
          toast.error('❌ Scraping falhou');
          setIsRunning(false);
        }
      }
    } catch (error) {
      setTimeout(() => pollResults(runId), 10000);
    }
  };

  return (
    <Container>
      <Title>🗺️ Google Maps Scraper</Title>
      
      <FormGroup>
        <Label>Palavra-chave (ex: restaurantes, dentistas, academias)</Label>
        <Input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Digite o tipo de negócio..."
          disabled={isRunning}
        />
      </FormGroup>

      <FormGroup>
        <Label>Localização (ex: São Paulo, SP ou Rio de Janeiro, RJ)</Label>
        <Input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Digite a cidade..."
          disabled={isRunning}
        />
      </FormGroup>

      <FormGroup>
        <Label>📊 Quantidade de empresas para buscar</Label>
        <Input
          type="number"
          value={maxResults}
          onChange={(e) => setMaxResults(e.target.value)}
          placeholder="Digite um número entre 1 e 200..."
          min="1"
          max="200"
          disabled={isRunning}
        />
      </FormGroup>

      <RunButton 
        onClick={runScraper} 
        disabled={isRunning || !keyword.trim() || !location.trim()}
      >
        {isRunning ? '🔄 Executando...' : '🚀 Iniciar Scraping'}
      </RunButton>

      {status && (
        <StatusCard>
          <strong>Status:</strong> {status}
        </StatusCard>
      )}

      {results.length > 0 && (
        <div style={{
          background: 'rgba(0, 136, 204, 0.1)',
          border: '1px solid rgba(0, 204, 255, 0.3)',
          borderRadius: '8px',
          padding: '1.5rem',
          marginTop: '2rem'
        }}>
          <h3 style={{ color: '#00ffaa', marginBottom: '1rem' }}>
            📊 {results.length} Empresas Encontradas
          </h3>
          
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid rgba(0, 255, 170, 0.2)',
            borderRadius: '6px'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: '#e0e0e0'
            }}>
              <thead>
                <tr style={{ background: 'rgba(0, 255, 170, 0.1)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid rgba(0, 255, 170, 0.2)' }}>Nome</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid rgba(0, 255, 170, 0.2)' }}>Endereço</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid rgba(0, 255, 170, 0.2)' }}>Telefone</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid rgba(0, 255, 170, 0.2)' }}>Avaliação</th>
                </tr>
              </thead>
              <tbody>
                {results.map((place, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(0, 255, 170, 0.1)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div>
                        <strong style={{ color: '#00ccff' }}>
                          {place.title || place.name || 'Nome não disponível'}
                        </strong>
                        {place.category && (
                          <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
                            {place.category}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                      {place.address || place.location || 'Endereço não disponível'}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                      {place.phone || place.phoneNumber || 'Telefone não disponível'}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                      {place.rating ? (
                        <span style={{ color: '#00ffaa' }}>
                          ⭐ {place.rating} ({place.reviewsCount || 0} avaliações)
                        </span>
                      ) : (
                        'Sem avaliação'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.75rem', 
            background: 'rgba(0, 255, 170, 0.1)', 
            borderRadius: '6px',
            textAlign: 'center',
            color: '#00ccff'
          }}>
            💡 <strong>{results.length}</strong> empresas encontradas de <strong>{keyword}</strong> em <strong>{location}</strong>
          </div>
        </div>
      )}
    </Container>
  );
};

export default GoogleMapsSimple;