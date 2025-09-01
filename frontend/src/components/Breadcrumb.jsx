import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const BreadcrumbContainer = styled.nav`
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  
  .breadcrumb-list {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
    max-width: 1280px;
    margin: 0 auto;
  }
  
  .breadcrumb-item {
    display: flex;
    align-items: center;
    
    a {
      color: #6b7280;
      text-decoration: none;
      transition: color 0.2s ease;
      
      &:hover {
        color: #11506e;
      }
    }
    
    &.active {
      color: #11506e;
      font-weight: 500;
    }
    
    &:not(:last-child)::after {
      content: '/';
      margin-left: 0.5rem;
      color: #9ca3af;
    }
  }
`;

const Breadcrumb = () => {
  const location = useLocation();
  
  // Mapeamento de rotas para breadcrumbs
  const pathNameMap = {
    '/': 'Início',
    '/login': 'Login',
    '/register': 'Cadastro',
    '/dashboard': 'Dashboard',
    '/app': 'Busca Empresarial',
    '/google-maps-scraper': 'Google Maps Scraper',
    '/google-places': 'Google Places API',
    '/linkedin-scraper': 'LinkedIn Scraper',
    '/instagram': 'Instagram Email Scraper',
    '/leads': 'Gestão de Leads',
    '/funil': 'Funil de Vendas',
    '/kanban': 'Kanban de Leads',
    '/subscription': 'Planos e Assinatura',
    '/checkout': 'Checkout',
    '/about': 'Sobre',
    '/privacy': 'Política de Privacidade',
    '/terms': 'Termos de Uso',
    '/security': 'Política de Segurança'
  };

  // Rotas que não devem mostrar breadcrumb
  const hiddenRoutes = ['/', '/login', '/register', '/dashboard', '/app'];
  
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  // Gerar breadcrumbs baseado no caminho atual
  const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
  
  const breadcrumbs = [
    { path: '/', name: 'Início', isActive: false }
  ];

  // Adicionar Dashboard se não estivermos nele
  if (location.pathname !== '/dashboard' && !location.pathname.startsWith('/dashboard')) {
    breadcrumbs.push({ path: '/dashboard', name: 'Dashboard', isActive: false });
  }

  // Adicionar página atual
  const currentPage = pathNameMap[location.pathname] || pathSegments[pathSegments.length - 1];
  if (currentPage && currentPage !== 'Dashboard') {
    breadcrumbs.push({ path: location.pathname, name: currentPage, isActive: true });
  }

  return (
    <BreadcrumbContainer>
      <ul className="breadcrumb-list" itemScope itemType="https://schema.org/BreadcrumbList">
        {breadcrumbs.map((breadcrumb, index) => (
          <li 
            key={breadcrumb.path}
            className={`breadcrumb-item ${breadcrumb.isActive ? 'active' : ''}`}
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {breadcrumb.isActive ? (
              <>
                <span itemProp="name">{breadcrumb.name}</span>
                <meta itemProp="position" content={index + 1} />
              </>
            ) : (
              <>
                <Link 
                  to={breadcrumb.path}
                  itemProp="item"
                  title={`Ir para ${breadcrumb.name}`}
                >
                  <span itemProp="name">{breadcrumb.name}</span>
                </Link>
                <meta itemProp="position" content={index + 1} />
              </>
            )}
          </li>
        ))}
      </ul>
    </BreadcrumbContainer>
  );
};

export default Breadcrumb;