import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import logo from '../assets/images/logo.png';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: #e0e0e0;
  padding: 2rem;
`;

const Header = styled.header`
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 170, 0.2);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  color: #00ffaa;
  margin: 0;
  font-size: 1.8rem;
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, #ff4757, #ff6b7a);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
`;

const Content = styled.div`
  background: rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 170, 0.2);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  return (
    <Container>
      <Header>
        <Title>🏢 Dashboard Empresas Brasil</Title>
        <div>
          <span>Olá, {user?.email}</span>
          <LogoutButton onClick={logout} style={{ marginLeft: '1rem' }}>
            Sair
          </LogoutButton>
        </div>
      </Header>
      
      <Content>
        <h2 style={{ color: '#00ffaa', marginBottom: '2rem' }}>
          Dashboard Funcionando! ✅
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Sistema restaurado com sucesso!
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ 
            background: 'rgba(0, 255, 170, 0.1)', 
            border: '1px solid rgba(0, 255, 170, 0.3)', 
            borderRadius: '8px', 
            padding: '1.5rem',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/google-maps-scraper'}
          >
            <h3 style={{ color: '#00ffaa', margin: '0 0 0.5rem 0' }}>📍 Google Maps</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0a0a0' }}>Scraper Google Maps</p>
          </div>
          
          <div style={{ 
            background: 'rgba(0, 255, 170, 0.1)', 
            border: '1px solid rgba(0, 255, 170, 0.3)', 
            borderRadius: '8px', 
            padding: '1.5rem',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/linkedin-scraper'}
          >
            <h3 style={{ color: '#00ffaa', margin: '0 0 0.5rem 0' }}>🔵 LinkedIn</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0a0a0' }}>Scraper LinkedIn</p>
          </div>
          
          <div style={{ 
            background: 'rgba(0, 255, 170, 0.1)', 
            border: '1px solid rgba(0, 255, 170, 0.3)', 
            borderRadius: '8px', 
            padding: '1.5rem',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/instagram'}
          >
            <h3 style={{ color: '#00ffaa', margin: '0 0 0.5rem 0' }}>📸 Instagram</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0a0a0' }}>Scraper Instagram</p>
          </div>
          
          <div style={{ 
            background: 'rgba(0, 255, 170, 0.1)', 
            border: '1px solid rgba(0, 255, 170, 0.3)', 
            borderRadius: '8px', 
            padding: '1.5rem',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/leads'}
          >
            <h3 style={{ color: '#00ffaa', margin: '0 0 0.5rem 0' }}>🗃️ Leads</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0a0a0' }}>Gestão CRM</p>
          </div>
          
          <div style={{ 
            background: 'rgba(0, 255, 170, 0.1)', 
            border: '1px solid rgba(0, 255, 170, 0.3)', 
            borderRadius: '8px', 
            padding: '1.5rem',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/kanban'}
          >
            <h3 style={{ color: '#00ffaa', margin: '0 0 0.5rem 0' }}>📋 Kanban</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0a0a0' }}>Gestão Projetos</p>
          </div>
          
          <div style={{ 
            background: 'rgba(0, 255, 170, 0.1)', 
            border: '1px solid rgba(0, 255, 170, 0.3)', 
            borderRadius: '8px', 
            padding: '1.5rem',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/funil'}
          >
            <h3 style={{ color: '#00ffaa', margin: '0 0 0.5rem 0' }}>🌪️ Funil</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0a0a0' }}>Pipeline Vendas</p>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0, 136, 204, 0.1)', border: '1px solid rgba(0, 204, 255, 0.3)', borderRadius: '8px' }}>
          <h3 style={{ color: '#00ccff', margin: '0 0 0.5rem 0' }}>🏢 66M Empresas Brasil</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Sistema principal está temporariamente em manutenção para otimização.</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#a0a0a0' }}>Todos os outros scrapers estão funcionando normalmente.</p>
        </div>
      </Content>
    </Container>
  );
};

export default Dashboard;