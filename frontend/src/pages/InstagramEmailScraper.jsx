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

const InstagramIcon = styled.div`
  font-size: 3rem;
  filter: drop-shadow(0 0 10px rgba(240, 148, 51, 0.6));
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
  color: #e6683c;
  margin-bottom: 0.75rem;
  font-size: 1rem;
`;

const KeywordList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const KeywordTag = styled.span`
  background: linear-gradient(135deg, rgba(240, 148, 51, 0.2), rgba(220, 39, 67, 0.2));
  border: 1px solid rgba(240, 148, 51, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, rgba(240, 148, 51, 0.3), rgba(220, 39, 67, 0.3));
    transform: translateY(-1px);
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #e6683c;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(240, 148, 51, 0.3);
  color: #e0e0e0;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #e6683c;
    box-shadow: 0 0 0 2px rgba(240, 148, 51, 0.2);
  }
  
  &::placeholder {
    color: rgba(224, 224, 224, 0.5);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e0e0e0;
  font-size: 0.9rem;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #e6683c;
`;

const RunButton = styled.button`
  background: linear-gradient(135deg, #f09433, #e6683c);
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
    background: linear-gradient(135deg, #e6683c, #dc2743);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(240, 148, 51, 0.3);
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
  border: 1px solid rgba(240, 148, 51, 0.3);
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
          background: linear-gradient(135deg, #f09433, #e6683c);
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
  background: linear-gradient(135deg, #f09433 0%, #e6683c 100%);
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
    background: linear-gradient(135deg, #e6683c 0%, #dc2743 100%);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(240, 148, 51, 0.3);
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

const ProgressContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(240, 148, 51, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
`;

const ProgressBarContainer = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  overflow: hidden;
  height: 20px;
  margin-bottom: 1rem;
  border: 1px solid rgba(240, 148, 51, 0.2);
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #f09433, #e6683c);
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  min-width: ${props => props.width > 15 ? 'auto' : '0'};
`;

const ProgressText = styled.div`
  color: #e6683c;
  font-weight: 500;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const InstagramEmailScraper = () => {
  const [formData, setFormData] = useState({
    keyword: ''
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState(null);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const { user } = useAuth();

  const businessKeywords = {
    'Negócios e Empreendedorismo': [
      'empreendedorismo', 'startup', 'business', 'negócios', 'marketing',
      'vendas', 'consultoria', 'coach', 'mentoria', 'networking'
    ],
    'Tecnologia e Digital': [
      'tech', 'tecnologia', 'software', 'desenvolvimento', 'programação',
      'design', 'UX/UI', 'digital marketing', 'social media', 'ecommerce'
    ],
    'Saúde e Bem-estar': [
      'saúde', 'fitness', 'nutrição', 'wellness', 'medicina',
      'psicologia', 'terapia', 'yoga', 'pilates', 'personal trainer'
    ],
    'Moda e Beleza': [
      'moda', 'fashion', 'beleza', 'makeup', 'skincare',
      'cabelo', 'estética', 'nail art', 'style', 'lookbook'
    ],
    'Alimentação e Culinária': [
      'comida', 'culinária', 'gastronomia', 'receitas', 'chef',
      'restaurante', 'food', 'cooking', 'baking', 'confeitaria'
    ],
    'Arte e Criatividade': [
      'arte', 'artista', 'fotografia', 'photography', 'criatividade',
      'ilustração', 'pintura', 'música', 'artesanato', 'handmade'
    ],
    'Esportes e Atividades': [
      'esportes', 'futebol', 'corrida', 'ciclismo', 'natação',
      'crossfit', 'academia', 'outdoor', 'aventura', 'travel'
    ],
    'Educação e Conhecimento': [
      'educação', 'cursos', 'ensino', 'professor', 'escola',
      'universidade', 'aprendizado', 'conhecimento', 'idiomas', 'livros'
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
      const leadsToCheck = resultsToFilter.map(profile => ({
        nome: profile.fullName || profile.username || 'Instagram User',
        empresa: profile.fullName || profile.username || 'Instagram User',
        telefone: '',
        email: profile.email || '',
        website: profile.externalUrl || ''
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
        
        const newLeads = resultsToFilter.filter((profile, index) => {
          const lead = leadsToCheck[index];
          const leadId = `${lead.nome}_${lead.empresa}_${lead.telefone}_${lead.email}`;
          return !existingIds.has(leadId);
        });

        const filteredCount = resultsToFilter.length - newLeads.length;
        setFilteredResults(newLeads);
        
        if (filteredCount > 0) {
          toast.info(`🔄 ${filteredCount} perfis já existentes foram filtrados - restaram ${newLeads.length} perfis novos`);
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
      toast.error('❌ Por favor, digite uma palavra-chave para buscar');
      return;
    }

    // Clear previous results
    setResults([]);
    setCurrentRun(null);
    setProgress(0);
    setProgressMessage('');

    console.log('🚀 Iniciando Instagram email scraping OTIMIZADO:', formData);

    setIsRunning(true);
    
    // Start progress bar IMMEDIATELY when user clicks
    setProgress(0);
    setProgressMessage('🔍 Iniciando conexão...');
    
    // Start progress estimation immediately (we'll get runId later)
    let runId = null;
    const progressStartTime = Date.now();
    
    // Start immediate progress animation
    const immediateProgress = () => {
      const elapsed = Date.now() - progressStartTime;
      let progressPercent = 0;
      let message = '🔍 Iniciando conexão...';
      
      if (elapsed < 2000) {
        progressPercent = (elapsed / 2000) * 10; // 0-10% in first 2 seconds
        message = '🔍 Conectando ao servidor...';
      } else if (runId) {
        // Once we have runId, start the full progress estimation
        startProgressEstimation(runId);
        return;
      } else {
        progressPercent = 10 + ((elapsed - 2000) / 8000) * 10; // 10-20% while waiting for runId (mais tempo)
        if (elapsed > 5000) {
          message = '⏳ API do Instagram está processando... (pode levar até 30s)';
        } else {
          message = '⏳ Aguardando resposta do servidor...';
        }
        progressPercent = Math.min(progressPercent, 20);
      }
      
      setProgress(Math.round(progressPercent));
      setProgressMessage(message);
      
      if (progressPercent < 20 || !runId) {
        setTimeout(immediateProgress, 500);
      }
    };
    
    // Start immediate progress
    immediateProgress();
    
    try {
      const requestBody = {
        keyword: formData.keyword
      };

      const response = await fetch('/api/instagram/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      console.log('📊 Resposta da API:', data);
      
      if (data.success && data.runId) {
        // Now we have the runId, set it and let the progress continue
        runId = data.runId;
        setCurrentRun({
          id: data.runId,
          status: 'RUNNING',
          startedAt: new Date(),
          keyword: formData.keyword
        });
        
        // Start the real progress estimation now that we have runId
        startProgressEstimation(data.runId);
        
      } else {
        toast.error('Erro ao iniciar scraping: ' + data.message);
        setIsRunning(false);
      }
    } catch (error) {
      console.error('❌ Erro completo:', error);
      toast.error(`❌ Erro ao conectar: ${error.message}`);
      setIsRunning(false);
    }
  };

  const startProgressEstimation = async (runId) => {
    const startTime = Date.now();
    const estimatedDuration = 60000; // 60 seconds estimated duration (mais realista)
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / estimatedDuration) * 100, 95);
      
      // Update progress message based on time
      let message = '🔍 Conectando ao Instagram...';
      if (elapsed > 3000) message = '📱 Analisando perfis do Instagram...';
      if (elapsed > 8000) message = '📧 Extraindo emails dos perfis...';
      if (elapsed > 15000) message = '⏳ Finalizando coleta de dados...';
      if (elapsed > 22000) message = '🔄 Processando resultados finais...';
      
      setProgress(Math.round(progressPercent));
      setProgressMessage(message);
      
      // If still running and under 95%, continue updating
      if (progressPercent < 95) {
        setTimeout(updateProgress, 500); // Update every 500ms for smooth progress
      } else {
        // After 95%, start checking for completion
        checkCompletion(runId);
      }
    };
    
    // Start the progress estimation
    updateProgress();
  };

  const checkCompletion = async (runId) => {
    try {
      const response = await fetch(`/api/instagram/progress/${runId}`);
      const data = await response.json();
      
      if (data.success && data.status === 'SUCCEEDED') {
        // Completed successfully
        toast.success(`✅ Instagram scraping concluído! ${data.total || 0} perfis com emails encontrados`);
        setCurrentRun(prev => ({
          ...prev,
          status: 'SUCCEEDED',
          finishedAt: new Date()
        }));
        
        const rawResults = data.results || [];
        console.log('Raw Instagram email data:', rawResults);
        
        setResults(rawResults);
        setIsRunning(false);
        setProgress(100);
        setProgressMessage('✅ Concluído com sucesso!');
        
      } else if (data.success && data.status === 'FAILED') {
        // Failed
        toast.error('❌ Instagram scraping falhou');
        setCurrentRun(prev => ({
          ...prev,
          status: 'FAILED',
          finishedAt: new Date()
        }));
        setIsRunning(false);
        setProgress(0);
        setProgressMessage('❌ Falhou');
        
      } else {
        // Still running, check again in 3 seconds
        setTimeout(() => checkCompletion(runId), 3000);
      }
      
    } catch (error) {
      console.error('❌ Completion check error:', error);
      // Keep trying in case of network issues
      setTimeout(() => checkCompletion(runId), 5000);
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
      const leadsToProcess = dataToSave.map(profile => ({
        nome: profile.fullName || profile.username || 'Instagram User',
        empresa: profile.fullName || profile.username || 'Instagram User',
        telefone: '',
        email: profile.email || '',
        endereco: '',
        website: profile.externalUrl || '',
        categoria: 'Instagram Email Lead',
        fonte: 'Instagram Email Scraper via Apify',
        dados_originais: profile,
        notas: `Busca Instagram: ${formData.keyword} | Username: ${profile.username} | Followers: ${profile.followersCount || 'N/A'} | Following: ${profile.followingCount || 'N/A'}`
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
      const exportData = data.map((profile, index) => ({
        'Nº': index + 1,
        'Nome Completo': profile.fullName || '',
        'Username': profile.username || '',
        'Email': profile.email || '',
        'URL Perfil': profile.url || '',
        'URL Externa': profile.externalUrl || '',
        'Biografia': profile.biography || '',
        'Seguidores': profile.followersCount || '',
        'Seguindo': profile.followingCount || '',
        'Posts': profile.postsCount || '',
        'Verificado': profile.isVerified ? 'Sim' : 'Não',
        'Privado': profile.isPrivate ? 'Sim' : 'Não',
        'Categoria Negócio': profile.businessCategoryName || '',
        'Palavra-chave Pesquisada': formData.keyword,
        'Data da Exportação': new Date().toLocaleDateString('pt-BR'),
        'Hora da Exportação': new Date().toLocaleTimeString('pt-BR')
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      const columnWidths = [
        { wch: 5 },   // Nº
        { wch: 25 },  // Nome Completo
        { wch: 20 },  // Username
        { wch: 30 },  // Email
        { wch: 40 },  // URL Perfil
        { wch: 30 },  // URL Externa
        { wch: 50 },  // Biografia
        { wch: 12 },  // Seguidores
        { wch: 12 },  // Seguindo
        { wch: 8 },   // Posts
        { wch: 12 },  // Verificado
        { wch: 10 },  // Privado
        { wch: 20 },  // Categoria
        { wch: 20 },  // Keyword
        { wch: 12 },  // Data
        { wch: 12 }   // Hora
      ];
      
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Instagram Emails');

      const fileName = `instagram-emails-${formData.keyword?.replace(/\s+/g, '-') || 'busca'}-${new Date().toISOString().split('T')[0]}.xlsx`;
      
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
        'Nº', 'Nome Completo', 'Username', 'Email', 'URL Perfil', 'URL Externa',
        'Biografia', 'Seguidores', 'Seguindo', 'Posts', 'Verificado', 'Privado',
        'Categoria Negócio', 'Palavra-chave Pesquisada', 'Data da Exportação', 'Hora da Exportação'
      ];

      const csvContent = [
        headers.join(';'),
        ...data.map((profile, index) => [
          index + 1,
          `"${(profile.fullName || '').replace(/"/g, '""')}"`,
          `"${(profile.username || '').replace(/"/g, '""')}"`,
          `"${(profile.email || '').replace(/"/g, '""')}"`,
          `"${(profile.url || '').replace(/"/g, '""')}"`,
          `"${(profile.externalUrl || '').replace(/"/g, '""')}"`,
          `"${(profile.biography || '').replace(/"/g, '""')}"`,
          profile.followersCount || '',
          profile.followingCount || '',
          profile.postsCount || '',
          profile.isVerified ? 'Sim' : 'Não',
          profile.isPrivate ? 'Sim' : 'Não',
          `"${(profile.businessCategoryName || '').replace(/"/g, '""')}"`,
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
        link.setAttribute('download', `instagram-emails-${formData.keyword?.replace(/\s+/g, '-') || 'busca'}-${new Date().toISOString().split('T')[0]}.csv`);
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
            background: 'rgba(240, 148, 51, 0.1)',
            border: '1px solid #e6683c',
            color: '#e6683c',
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
            e.target.style.background = 'rgba(240, 148, 51, 0.2)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(240, 148, 51, 0.1)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Voltar ao Dashboard
        </button>
      </div>

      <Header>
        <Title>
          <InstagramIcon>📸</InstagramIcon>
          Instagram Email Scraper
        </Title>
        <Subtitle>
          Extraia emails de perfis do Instagram usando palavras-chave específicas.
          Encontre contatos de negócios, influencers e empresas.
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
                name="keyword"
                value={formData.keyword}
                onChange={handleInputChange}
                placeholder='Ex: clínica veterinária, marketing, tecnologia...'
              />
              <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.4rem' }}>
                💡 <strong>Dica:</strong> Use termos específicos para melhores resultados.
                <br />Ex: "clínica veterinária", "restaurante", "academia"
                <br />⏱️ O scrapping do Instagram pode levar aproximadamente de 2 a 3 minutos
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
              <>📸 Iniciar Instagram Email Scraping</>
            )}
          </RunButton>
          
          {/* BARRA DE PROGRESSO EM TEMPO REAL */}
          {isRunning && (
            <ProgressContainer>
              <div style={{ color: '#e6683c', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
                📸 Instagram Email Scraping
              </div>
              
              <ProgressBarContainer>
                <ProgressBar width={progress} style={{ width: `${progress}%` }}>
                  {progress > 15 && `${progress}%`}
                </ProgressBar>
              </ProgressBarContainer>
              
              <ProgressText>
                <span className="spinner">{progress >= 100 ? '✅' : '🔄'}</span>
                {progress >= 100 ? '✅ Concluído com sucesso!' : (progressMessage || `Processando... ${progress}% concluído`)}
              </ProgressText>
              
              {progress < 30 && (
                <div style={{ fontSize: '0.8rem', color: '#999', textAlign: 'center', marginTop: '0.5rem' }}>
                  💡 Buscando perfis do Instagram...
                </div>
              )}
              {progress >= 30 && progress < 70 && (
                <div style={{ fontSize: '0.8rem', color: '#999', textAlign: 'center', marginTop: '0.5rem' }}>
                  🔍 Extraindo emails dos perfis encontrados...
                </div>
              )}
              {progress >= 70 && progress < 100 && (
                <div style={{ fontSize: '0.8rem', color: '#999', textAlign: 'center', marginTop: '0.5rem' }}>
                  ✨ Finalizando e organizando resultados...
                </div>
              )}
            </ProgressContainer>
          )}

          {/* BOTÕES PRINCIPAIS - SEMPRE VISÍVEIS */}
          <div style={{ 
            marginTop: '2rem', 
            borderTop: '1px solid rgba(240, 148, 51, 0.3)', 
            paddingTop: '1.5rem' 
          }}>
            <h3 style={{ color: '#e6683c', marginBottom: '1rem', textAlign: 'center' }}>
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
            {currentRun.status === 'RUNNING' ? '🔄 Processando...' : 
             currentRun.status === 'SUCCEEDED' ? '✅ Concluído com sucesso' : 
             currentRun.status === 'FAILED' ? '❌ Falhou' : 
             '✅ Concluído com sucesso'}
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
              <h3 style={{ color: '#e6683c', marginBottom: '1rem' }}>
                📊 {filteredResults.length} Perfis com Emails Encontrados
              </h3>
              
              <ExportButtonsContainer style={{ marginBottom: '1rem' }}>
                <ExportButton onClick={() => exportToCSV(filteredResults)}>
                  📊 Exportar CSV
                </ExportButton>
                <ExportButton onClick={() => exportToExcel(filteredResults)}>
                  📈 Exportar Excel
                </ExportButton>
                <ExportButton onClick={saveAllLeads}>
                  💾 Salvar Todos
                </ExportButton>
              </ExportButtonsContainer>
              
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                {filteredResults.map((profile, index) => (
                  <div 
                    key={index}
                    style={{
                      background: 'rgba(240,148,51,0.1)',
                      border: '1px solid rgba(240,148,51,0.2)',
                      borderRadius: '6px',
                      padding: '1rem',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                      <div style={{ color: '#e6683c', fontWeight: 'bold', flex: 1 }}>
                        {profile.fullName || profile.username}
                      </div>
                    </div>
                    <div style={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
                      {profile.username && <div>📝 {profile.username}</div>}
                      {profile.email && <div>📧 {profile.email}</div>}
                      {profile.url && (
                        <div>🔗 <a href={profile.url} target="_blank" rel="noopener noreferrer" style={{ color: '#e6683c' }}>{profile.url}</a></div>
                      )}
                      {profile.followersCount && <div>👥 {profile.followersCount} seguidores</div>}
                      {profile.biography && <div>📄 {profile.biography}</div>}
                      {profile.externalUrl && (
                        <div>🌐 <a href={profile.externalUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#e6683c' }}>{profile.externalUrl}</a></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ResultsCard>
      )}
      
      {/* Mostrar quando todos os leads já existem na base */}
      {results.length > 0 && filteredResults.length === 0 && (
        <ResultsCard>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#e6683c' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Todos os {results.length} perfis já estão na sua base
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Tente com palavras-chave diferentes
            </div>
          </div>
        </ResultsCard>
      )}
    </Container>
  );
};

export default InstagramEmailScraper;