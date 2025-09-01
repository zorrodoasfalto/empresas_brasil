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
  // Breadcrumb invisível apenas para SEO - sem renderização visual
  return null;
};

export default Breadcrumb;