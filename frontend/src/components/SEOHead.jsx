import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title = "Data Atlas - 66 Milhões de Empresas | Prospecção e CRM Avançado",
  description = "Acesse 66+ milhões de empresas brasileiras, prospecção multicanal (Instagram, LinkedIn, Google Maps) e CRM integrado. Teste grátis por 7 dias. Performance garantida.",
  keywords = "empresas brasil, base de dados empresas, prospecção leads, crm integrado, dados cnpj, linkedin scraper, instagram scraper, google maps scraper, inteligência comercial, leads qualificados, vendas b2b, dados empresariais, cnpj consulta, empresas ativas, receita federal, dados abertos, prospecção digital, automação vendas, funil de vendas, kanban leads",
  url = "https://dataatlas.com.br/",
  image = "https://dataatlas.com.br/og-image.jpg",
  type = "website"
}) => {
  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content="Data Atlas" />
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Data Atlas" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@dataatlasbr" />
    </Helmet>
  );
};

// Páginas específicas com SEO otimizado
export const LandingPageSEO = () => (
  <SEOHead 
    title="Data Atlas - 66 Milhões de Empresas | Prospecção e CRM Avançado"
    description="Acesse 66+ milhões de empresas brasileiras, prospecção multicanal (Instagram, LinkedIn, Google Maps) e CRM integrado. Teste grátis por 7 dias. Performance garantida."
    keywords="empresas brasil, base de dados empresas, prospecção leads, crm integrado, dados cnpj, linkedin scraper, instagram scraper, google maps scraper, inteligência comercial, leads qualificados, vendas b2b, dados empresariais, cnpj consulta, empresas ativas, receita federal, dados abertos, prospecção digital, automação vendas, funil de vendas, kanban leads"
    url="https://dataatlas.com.br/"
  />
);

export const LoginSEO = () => (
  <SEOHead 
    title="Login - Data Atlas | Acesse sua conta"
    description="Faça login na maior plataforma de inteligência empresarial do Brasil. Acesso instantâneo a 66+ milhões de empresas brasileiras."
    keywords="login data atlas, acesso plataforma empresas, entrar conta data atlas, login empresas brasil"
    url="https://dataatlas.com.br/login"
  />
);

export const RegisterSEO = () => (
  <SEOHead 
    title="Cadastro Grátis - Data Atlas | Teste 7 Dias"
    description="Cadastre-se grátis no Data Atlas. Teste por 7 dias nossa base com 66+ milhões de empresas brasileiras, prospecção multicanal e CRM integrado."
    keywords="cadastro grátis data atlas, registro empresas brasil, teste gratuito 7 dias, criar conta data atlas, trial gratuito prospecção"
    url="https://dataatlas.com.br/register"
  />
);

export const DashboardSEO = () => (
  <SEOHead 
    title="Dashboard - Data Atlas | Painel de Controle Empresarial"
    description="Painel completo com acesso a 66+ milhões de empresas brasileiras, ferramentas de prospecção, CRM integrado e exportação de dados."
    keywords="dashboard empresas brasil, painel controle data atlas, busca empresas cnpj, ferramentas prospecção"
    url="https://dataatlas.com.br/dashboard"
  />
);

export const GoogleMapsSEO = () => (
  <SEOHead 
    title="Google Maps Scraper - Data Atlas | Prospecção Local"
    description="Ferramenta de extração de dados do Google Maps. Encontre estabelecimentos comerciais com nome, endereço, telefone e avaliações para prospecção local."
    keywords="google maps scraper, extração dados google maps, prospecção local, busca estabelecimentos comerciais, dados google places api"
    url="https://dataatlas.com.br/google-maps-scraper"
  />
);

export const LinkedInSEO = () => (
  <SEOHead 
    title="LinkedIn Company Scraper - Data Atlas | Prospecção B2B"
    description="Extraia dados de empresas do LinkedIn com informações detalhadas: funcionários, setor, localização e website. 50 empresas por busca."
    keywords="linkedin company scraper, extração dados linkedin, prospecção b2b, busca empresas linkedin, dados empresariais linkedin"
    url="https://dataatlas.com.br/linkedin-scraper"
  />
);

export const InstagramSEO = () => (
  <SEOHead 
    title="Instagram Email Scraper - Data Atlas | Extração de Emails"
    description="Extraia emails de perfis públicos do Instagram. Ideal para influencers, clínicas, academias e restaurantes. 22 resultados em 2-3 minutos."
    keywords="instagram email scraper, extração email instagram, busca emails influencers, prospecção instagram, contatos instagram"
    url="https://dataatlas.com.br/instagram"
  />
);

export const LeadsSEO = () => (
  <SEOHead 
    title="Gestão de Leads - Data Atlas | CRM Integrado"
    description="Gerencie seus leads com histórico completo conectado à maior base de dados empresariais do Brasil. CRM integrado com 66+ milhões de empresas."
    keywords="gestão leads brasil, crm integrado empresas, histórico leads completo, gerenciamento prospectos"
    url="https://dataatlas.com.br/leads"
  />
);

export const FunilSEO = () => (
  <SEOHead 
    title="Funil de Vendas - Data Atlas | Pipeline de Conversão"
    description="Acompanhe seu pipeline de vendas com fases customizáveis. Identifique gargalos e otimize conversões conectado à base de 66+ milhões de empresas."
    keywords="funil de vendas brasil, pipeline conversão, fases customizáveis vendas, otimização gargalos"
    url="https://dataatlas.com.br/funil"
  />
);

export const KanbanSEO = () => (
  <SEOHead 
    title="Kanban de Leads - Data Atlas | Gestão Visual"
    description="Pipeline Kanban visual com drag & drop para gestão de leads. Interface intuitiva conectada à maior base empresarial do Brasil."
    keywords="kanban leads brasil, pipeline visual drag drop, gestão leads kanban, interface intuitiva vendas"
    url="https://dataatlas.com.br/kanban"
  />
);

export const SubscriptionSEO = () => (
  <SEOHead 
    title="Planos e Assinatura - Data Atlas | Pro, Premium, Max"
    description="Escolha seu plano ideal: Pro (R$ 97), Premium (R$ 147) ou Max (R$ 247). Acesso completo a 66+ milhões de empresas brasileiras."
    keywords="planos data atlas, assinatura pro premium max, preços data atlas, plano empresas brasil"
    url="https://dataatlas.com.br/subscription"
  />
);

export const AboutSEO = () => (
  <SEOHead 
    title="Sobre - Data Atlas | Maior Plataforma Empresarial do Brasil"
    description="Conheça o Data Atlas, a maior plataforma de inteligência empresarial do Brasil com 66+ milhões de empresas, fundada em 2024."
    keywords="sobre data atlas, maior plataforma empresarial brasil, inteligência empresarial, fundação 2024"
    url="https://dataatlas.com.br/about"
  />
);

export default SEOHead;