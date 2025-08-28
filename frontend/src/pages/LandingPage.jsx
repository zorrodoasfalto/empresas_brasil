import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/logo.png';

// Subcomponentes internos
const Section = ({ children, className = "", id = "" }) => (
  <section id={id} className={`py-16 px-4 sm:px-6 lg:px-8 ${className}`}>
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </section>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const Stat = ({ number, label, suffix = "" }) => (
  <div className="text-center">
    <div className="text-4xl sm:text-5xl font-bold text-[#0a3042] mb-2">
      {number}<span className="text-[#36e961]">{suffix}</span>
    </div>
    <div className="text-gray-600 font-medium">{label}</div>
  </div>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        className="flex justify-between items-center w-full text-left py-4 focus:outline-none focus:ring-2 focus:ring-[#36e961] rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-[#0a3042]">{question}</span>
        <span className={`ml-6 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="mt-2 text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

// Ícones SVG inline
const DatabaseIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 4.5 4 8 4s8-2 8-4V7M4 7c0 2 4.5 4 8 4s8-2 8-4M4 7c0-2 4.5-4 8-4s8 2 8 4m0 5c0 2-4.5 4-8 4s-8-2-8-4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <path strokeWidth={2} d="m17.5 6.5h.01" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeWidth={2} d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" strokeWidth={2} />
    <circle cx="4" cy="4" r="2" strokeWidth={2} />
  </svg>
);

const MapIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Meta tags simulation (would need React Helmet in real implementation)
  useEffect(() => {
    document.title = "Data Atlas — Inteligência Empresarial (66M+)";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = "Acesso instantâneo a 66+ milhões de empresas, prospecção multicanal (Instagram, LinkedIn, Google Maps) e CRM integrado. Teste grátis por 30 dias.";
    }
  }, []);

  const scrollToTrial = () => {
    document.getElementById('trial')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartTrial = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img src={logo} alt="Data Atlas" className="h-8 w-auto" />
              <span className="ml-3 text-xl font-bold text-[#0a3042]">Data Atlas</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#beneficios" className="text-gray-600 hover:text-[#0a3042] transition-colors">Benefícios</a>
              <a href="#ferramentas" className="text-gray-600 hover:text-[#0a3042] transition-colors">Ferramentas</a>
              <a href="#crm" className="text-gray-600 hover:text-[#0a3042] transition-colors">CRM</a>
              <a href="#casos" className="text-gray-600 hover:text-[#0a3042] transition-colors">Casos</a>
              <a href="#trial" className="text-gray-600 hover:text-[#0a3042] transition-colors">Trial</a>
              <a href="#faq" className="text-gray-600 hover:text-[#0a3042] transition-colors">FAQ</a>
              <button
                onClick={handleStartTrial}
                className="bg-gradient-to-r from-[#11506e] to-[#36e961] text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 font-medium"
                aria-label="Iniciar teste gratuito de 30 dias"
              >
                Teste Grátis
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-[#0a3042] focus:outline-none focus:ring-2 focus:ring-[#36e961] rounded"
                aria-label="Abrir menu de navegação"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
                <a href="#beneficios" className="block px-3 py-2 text-gray-600 hover:text-[#0a3042]">Benefícios</a>
                <a href="#ferramentas" className="block px-3 py-2 text-gray-600 hover:text-[#0a3042]">Ferramentas</a>
                <a href="#crm" className="block px-3 py-2 text-gray-600 hover:text-[#0a3042]">CRM</a>
                <a href="#casos" className="block px-3 py-2 text-gray-600 hover:text-[#0a3042]">Casos</a>
                <a href="#trial" className="block px-3 py-2 text-gray-600 hover:text-[#0a3042]">Trial</a>
                <a href="#faq" className="block px-3 py-2 text-gray-600 hover:text-[#0a3042]">FAQ</a>
                <button
                  onClick={handleStartTrial}
                  className="w-full text-left px-3 py-2 bg-gradient-to-r from-[#11506e] to-[#36e961] text-white rounded-lg font-medium"
                >
                  Teste Grátis
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <Section className="bg-gradient-to-br from-gray-50 to-white pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0a3042] mb-6">
                <span className="text-[#36e961]">66 milhões</span> de empresas,{" "}
                <span className="block">um clique de distância.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Dados oficiais + prospecção multicanal + CRM integrado para acelerar suas vendas.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleStartTrial}
                  className="bg-gradient-to-r from-[#11506e] to-[#36e961] text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  aria-label="Iniciar teste gratuito de 30 dias"
                >
                  Teste grátis por 30 dias
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="border-2 border-[#11506e] text-[#11506e] px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#11506e] hover:text-white transition-all duration-300"
                >
                  Ver demonstração
                </button>
              </div>

              {/* Prova social micro */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircleIcon />
                  <span className="ml-2">99%+ uptime</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon />
                  <span className="ml-2">Performance testada</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon />
                  <span className="ml-2">Zero bugs</span>
                </div>
              </div>
            </div>

            {/* Visual abstrato */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#64ee85] to-[#36e961] rounded-2xl opacity-20 transform rotate-6"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-4 h-4 bg-[#36e961] rounded-full"></div>
                      <div className="text-2xl font-bold text-[#0a3042]">66.000.000+</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gradient-to-r from-[#11506e] to-[#36e961] rounded w-3/4"></div>
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#36e961] bg-opacity-20 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <DatabaseIcon />
                        </div>
                        <div className="text-xs font-medium">Empresas</div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#64ee85] bg-opacity-20 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <SearchIcon />
                        </div>
                        <div className="text-xs font-medium">Prospecção</div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#92f3a9] bg-opacity-20 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <TrendingUpIcon />
                        </div>
                        <div className="text-xs font-medium">CRM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Prova Social - Stats */}
        <Section className="bg-[#0a3042] text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat number="66M" suffix="+" label="Empresas Brasileiras" />
            <Stat number="27" label="Estados + DF" />
            <Stat number="20" label="Segmentos Mapeados" />
            <Stat number="99" suffix="%" label="Uptime Garantido" />
          </div>
        </Section>

        {/* Por que o Data Atlas */}
        <Section id="beneficios">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0a3042] mb-4">
              Por que o Data Atlas?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma completa de inteligência empresarial brasileira que oferece acesso instantâneo a dados de <strong>66+ milhões</strong> de empresas, ferramentas de prospecção multicanal e <strong>CRM integrado</strong> para impulsionar vendas e marketing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#11506e] to-[#36e961] rounded-2xl mx-auto mb-6 flex items-center justify-center text-white">
                <DatabaseIcon />
              </div>
              <h3 className="text-xl font-semibold text-[#0a3042] mb-4">Base massiva, insights reais</h3>
              <ul className="text-gray-600 space-y-2 text-left">
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2"><strong>66.000.000+</strong> empresas brasileiras</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2">Cobertura nacional: <strong>27 estados + DF</strong></span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2"><strong>20</strong> segmentos mapeados</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2"><strong>Dados de sócios</strong>: 3+ por empresa</span>
                </li>
              </ul>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#11506e] to-[#64ee85] rounded-2xl mx-auto mb-6 flex items-center justify-center text-white">
                <SearchIcon />
              </div>
              <h3 className="text-xl font-semibold text-[#0a3042] mb-4">Prospecção multicanal</h3>
              <ul className="text-gray-600 space-y-2 text-left">
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2">Instagram Email Scraper</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2">LinkedIn Company Scraper</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2">Google Maps Business</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2">Busca Empresarial Inteligente</span>
                </li>
              </ul>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#11506e] to-[#92f3a9] rounded-2xl mx-auto mb-6 flex items-center justify-center text-white">
                <TrendingUpIcon />
              </div>
              <h3 className="text-xl font-semibold text-[#0a3042] mb-4">CRM que destrava conversão</h3>
              <ul className="text-gray-600 space-y-2 text-left">
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2"><strong>Pipeline Kanban</strong>: visual e drag & drop</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2"><strong>Gestão de Leads</strong>: histórico completo</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2">Fases customizáveis</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2">Acompanhamento por etapa</span>
                </li>
              </ul>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#36e961] to-[#92f3a9] rounded-2xl mx-auto mb-6 flex items-center justify-center text-white">
                <DownloadIcon />
              </div>
              <h3 className="text-xl font-semibold text-[#0a3042] mb-4">Exportação sem atrito</h3>
              <ul className="text-gray-600 space-y-2 text-left">
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2">Exportação nativa <strong>Excel (.xlsx)</strong> e <strong>CSV</strong></span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2"><strong>32+ campos</strong> por empresa</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2">Dados de sócios inclusos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon />
                  <span className="ml-2">Performance: <strong>50k em 2,5min</strong></span>
                </li>
              </ul>
            </Card>
          </div>
        </Section>

        {/* Ferramentas de Prospecção */}
        <Section id="ferramentas" className="bg-gray-50">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0a3042] mb-4">
              Ferramentas de Prospecção
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa para encontrar e qualificar seus prospects
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card className="hover:scale-105 transition-transform duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#11506e] to-[#36e961] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <SearchIcon />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#0a3042] mb-3">Busca Empresarial Inteligente</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Filtros avançados por segmento, localização, porte</li>
                    <li>• Performance: <strong>50.000 empresas em ~2,5 minutos</strong></li>
                    <li>• Exportação nativa <strong>Excel (.xlsx)</strong> e <strong>CSV</strong></li>
                    <li>• <strong>32+ campos</strong> por empresa exportados</li>
                    <li>• Dados de sócios detalhados inclusos</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="hover:scale-105 transition-transform duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#11506e] to-[#64ee85] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <InstagramIcon />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#0a3042] mb-3">Instagram Email Scraper</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Extração de emails de perfis públicos</li>
                    <li>• <strong>20 páginas</strong> processadas por busca</li>
                    <li>• ~<strong>22 resultados</strong> em <strong>2–3 minutos</strong></li>
                    <li>• Filtros: Gmail, Yahoo, Outlook</li>
                    <li>• Casos: influencers, clínicas, academias, restaurantes</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="hover:scale-105 transition-transform duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#11506e] to-[#92f3a9] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <LinkedInIcon />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#0a3042] mb-3">LinkedIn Company Scraper</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Busca empresas no LinkedIn com dados detalhados</li>
                    <li>• <strong>50 empresas</strong> por busca com informações completas</li>
                    <li>• Dados: funcionários, setor, localização, website</li>
                    <li>• <strong>API Ghost Genius</strong> integrada</li>
                    <li>• Processamento em tempo real com barra de progresso</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="hover:scale-105 transition-transform duration-300">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#36e961] to-[#92f3a9] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <MapIcon />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#0a3042] mb-3">Google Maps Business Scraper</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Extração local de nome, endereço, telefone, avaliações</li>
                    <li>• Integração com <strong>Google Places API</strong></li>
                    <li>• Ideal para prospecção <strong>local/territorial</strong></li>
                    <li>• Dados de estabelecimentos comerciais</li>
                    <li>• Informações de contato direto</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        {/* CRM Integrado */}
        <Section id="crm">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0a3042] mb-6">
                CRM Integrado
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Da prospecção ao fechamento, tudo em uma plataforma.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#36e961] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <CheckCircleIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0a3042] mb-2">Pipeline Kanban</h3>
                    <p className="text-gray-600">Visual, drag & drop, fases customizáveis</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#64ee85] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <CheckCircleIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0a3042] mb-2">Gestão de Leads</h3>
                    <p className="text-gray-600">Histórico completo, segmentação por fonte, status e próximas ações</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#92f3a9] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <CheckCircleIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0a3042] mb-2">Acompanhamento de conversão</h3>
                    <p className="text-gray-600">Métricas por etapa e performance do pipeline</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-semibold text-[#0a3042]">Pipeline de Vendas</h4>
                    <div className="text-sm text-gray-500">124 leads ativos</div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-2">Prospecção</div>
                      <div className="space-y-2">
                        <div className="bg-white rounded p-2 border-l-4 border-[#36e961]">
                          <div className="text-xs font-medium">Empresa ABC</div>
                        </div>
                        <div className="bg-white rounded p-2 border-l-4 border-[#64ee85]">
                          <div className="text-xs font-medium">Tech Corp</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-2">Qualificação</div>
                      <div className="space-y-2">
                        <div className="bg-white rounded p-2 border-l-4 border-[#92f3a9]">
                          <div className="text-xs font-medium">StartupXYZ</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-2">Proposta</div>
                      <div className="space-y-2">
                        <div className="bg-white rounded p-2 border-l-4 border-[#11506e]">
                          <div className="text-xs font-medium">Mega Corp</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-2">Fechamento</div>
                      <div className="text-center text-xs text-gray-400 py-4">
                        +
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Casos de Uso */}
        <Section id="casos" className="bg-gray-50">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0a3042] mb-4">
              Casos de Uso
            </h2>
            <p className="text-xl text-gray-600">
              Soluções para diferentes segmentos e necessidades
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#11506e] to-[#36e961] rounded-2xl mx-auto mb-6 flex items-center justify-center text-white">
                <TrendingUpIcon />
              </div>
              <h3 className="text-lg font-semibold text-[#0a3042] mb-4">Vendas B2B</h3>
              <ul className="text-gray-600 text-sm space-y-2 text-left">
                <li>• Prospecção por segmento</li>
                <li>• Qualificação de leads</li>
                <li>• Contatos de sócios (decisores)</li>
                <li>• Pipeline estruturado</li>
              </ul>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#11506e] to-[#64ee85] rounded-2xl mx-auto mb-6 flex items-center justify-center text-white">
                <InstagramIcon />
              </div>
              <h3 className="text-lg font-semibold text-[#0a3042] mb-4">Marketing Digital</h3>
              <ul className="text-gray-600 text-sm space-y-2 text-left">
                <li>• Extração de influencers</li>
                <li>• Base qualificada para campanhas</li>
                <li>• Personalização de abordagens</li>
                <li>• Segmentação avançada</li>
              </ul>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#11506e] to-[#92f3a9] rounded-2xl mx-auto mb-6 flex items-center justify-center text-white">
                <MapIcon />
              </div>
              <h3 className="text-lg font-semibold text-[#0a3042] mb-4">Consultoria/Serviços</h3>
              <ul className="text-gray-600 text-sm space-y-2 text-left">
                <li>• Mapeamento territorial</li>
                <li>• Análise de concorrência local</li>
                <li>• Oportunidades por região</li>
                <li>• Research de mercado</li>
              </ul>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#36e961] to-[#92f3a9] rounded-2xl mx-auto mb-6 flex items-center justify-center text-white">
                <UsersIcon />
              </div>
              <h3 className="text-lg font-semibold text-[#0a3042] mb-4">Agências</h3>
              <ul className="text-gray-600 text-sm space-y-2 text-left">
                <li>• Prospecção de clientes</li>
                <li>• Research automatizado</li>
                <li>• Geração de leads qualificados</li>
                <li>• Relatórios para clientes</li>
              </ul>
            </Card>
          </div>
        </Section>

        {/* Diferenciais */}
        <Section>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0a3042] mb-4">
              8 Diferenciais Competitivos
            </h2>
            <p className="text-xl text-gray-600">
              Por que escolher o Data Atlas?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Maior base de dados empresariais do Brasil (66M)",
              "Velocidade: 50k empresas em 2,5 minutos",
              "Multicanal: Instagram + LinkedIn + Google Maps + Empresas",
              "CRM integrado: da prospecção ao fechamento",
              "Exportação completa: 32+ campos, sócios inclusos",
              "Trial gratuito: 30 dias sem limitações",
              "Tecnologia moderna: APIs premium integradas",
              "Interface intuitiva: barras de progresso, feedback em tempo real"
            ].map((diferencial, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-8 h-8 bg-gradient-to-br from-[#11506e] to-[#36e961] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-gray-700 font-medium">{diferencial}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Resultados */}
        <Section className="bg-[#0a3042] text-white">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Resultados Comprovados
            </h2>
            <p className="text-xl text-gray-300">
              Performance testada e aprovada
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[#36e961] mb-2">1.000</div>
              <div className="text-gray-300">empresas em ~1,8s</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[#64ee85] mb-2">22+</div>
              <div className="text-gray-300">perfis Instagram por busca</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[#92f3a9] mb-2">50</div>
              <div className="text-gray-300">empresas LinkedIn completas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[#36e961] mb-2">Zero</div>
              <div className="text-gray-300">bugs confirmados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[#64ee85] mb-2">100%</div>
              <div className="text-gray-300">dados oficiais atualizados</div>
            </div>
          </div>
        </Section>

        {/* CTA de meio de página */}
        <Section className="bg-gradient-to-r from-[#11506e] to-[#36e961] text-white text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Comece seu trial — sem cartão de crédito
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Acesse 66+ milhões de empresas agora mesmo. Cancele quando quiser. Sem pegadinhas.
            </p>
            <button
              onClick={handleStartTrial}
              className="bg-white text-[#11506e] px-12 py-4 rounded-full text-xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              aria-label="Iniciar teste gratuito de 30 dias"
            >
              Ative seu trial de 30 dias
            </button>
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" className="bg-gray-50">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0a3042] mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Esclarecemos suas principais dúvidas
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            <FAQItem
              question="De onde vêm os dados das empresas e com que frequência são atualizados?"
              answer="Nossos dados vêm de fontes oficiais brasileiras e são atualizados regularmente para garantir precisão. Mantemos conexão com registros oficiais para dados sempre atuais."
            />
            <FAQItem
              question="Quais são os limites do trial de 30 dias?"
              answer="Durante o trial, você tem acesso completo a todas as funcionalidades da plataforma, incluindo prospecção multicanal, exportações e CRM integrado, sem limitações."
            />
            <FAQItem
              question="Como vocês garantem conformidade com LGPD e privacidade dos dados?"
              answer="Seguimos rigorosamente a LGPD, utilizando apenas dados públicos e oficiais. Temos políticas de segurança robustas e controles de acesso para proteger informações."
            />
            <FAQItem
              question="Posso exportar quantos dados quiser?"
              answer="Sim! Você pode exportar dados em Excel (.xlsx) e CSV com mais de 32 campos por empresa, incluindo dados de sócios detalhados, sem limitações de quantidade."
            />
            <FAQItem
              question="Por que a plataforma é tão rápida comparada a outras?"
              answer="Utilizamos tecnologia moderna (Node.js + PostgreSQL Railway) com APIs premium integradas e infraestrutura otimizada para processar grandes volumes rapidamente."
            />
            <FAQItem
              question="Que tipo de suporte vocês oferecem?"
              answer="Oferecemos suporte completo durante o trial e após a assinatura, com documentação detalhada e atendimento para dúvidas técnicas e comerciais."
            />
            <FAQItem
              question="Como funciona o cancelamento?"
              answer="Você pode cancelar a qualquer momento, sem multas ou pegadinhas. Durante o trial, não é necessário cartão de crédito."
            />
          </div>
        </Section>

        {/* CTA Final */}
        <Section id="trial" className="bg-gradient-to-br from-[#0a3042] to-[#11506e] text-white text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ative seu trial de 30 dias
            </h2>
            <p className="text-xl mb-8 opacity-90">
              <strong>Data Atlas</strong> — A maior plataforma de inteligência empresarial do Brasil. <strong>66 milhões</strong> de empresas na palma da sua mão.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartTrial}
                className="bg-gradient-to-r from-[#36e961] to-[#64ee85] text-[#0a3042] px-12 py-4 rounded-full text-xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                aria-label="Iniciar teste gratuito de 30 dias"
              >
                Começar Agora - Grátis
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="border-2 border-white text-white px-12 py-4 rounded-full text-xl font-semibold hover:bg-white hover:text-[#0a3042] transition-all duration-300"
              >
                Ver Demonstração
              </button>
            </div>
            <p className="text-sm mt-6 opacity-75">
              Sem cartão de crédito • Cancele quando quiser • Sem pegadinhas
            </p>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a3042] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src={logo} alt="Data Atlas" className="h-8 w-auto" />
                <span className="ml-3 text-xl font-bold">Data Atlas</span>
              </div>
              <p className="text-gray-300 text-sm">
                A maior plataforma de inteligência empresarial do Brasil.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#ferramentas" className="text-gray-300 hover:text-white transition-colors">Ferramentas</a></li>
                <li><a href="#crm" className="text-gray-300 hover:text-white transition-colors">CRM</a></li>
                <li><a href="#casos" className="text-gray-300 hover:text-white transition-colors">Casos de Uso</a></li>
                <li><a href="#trial" className="text-gray-300 hover:text-white transition-colors">Trial Gratuito</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="text-gray-300 hover:text-white transition-colors">Sobre</a></li>
                <li><a href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="/terms" className="text-gray-300 hover:text-white transition-colors">Termos</a></li>
                <li><a href="/security" className="text-gray-300 hover:text-white transition-colors">Segurança</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#faq" className="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors">Contato</a></li>
                <li><a href="/docs" className="text-gray-300 hover:text-white transition-colors">Documentação</a></li>
                <li><a href="/status" className="text-gray-300 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300 text-sm">
              © 2025 Data Atlas. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;