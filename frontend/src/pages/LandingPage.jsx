import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import logo from '../assets/images/logo.png';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(54, 233, 97, 0.3); }
  50% { box-shadow: 0 0 30px rgba(54, 233, 97, 0.6); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Inter', 'Roboto', system-ui, sans-serif;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(10, 48, 66, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  nav {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem;
    
    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      
      img {
        height: 48px;
        width: auto;
      }
      
    }
    
    .nav-links {
      display: none;
      align-items: center;
      gap: 2rem;
      
      @media (min-width: 768px) {
        display: flex;
      }
      
      a {
        color: #d1d5db;
        text-decoration: none;
        transition: color 0.3s ease;
        
        &:hover {
          color: #36e961;
        }
      }
    }
    
    .mobile-menu-btn {
      display: block;
      background: none;
      border: none;
      color: #d1d5db;
      cursor: pointer;
      
      @media (min-width: 768px) {
        display: none;
      }
    }
  }
`;

const CTAButton = styled.button`
  background: linear-gradient(135deg, #36e961, #64ee85);
  color: #0a3042;
  padding: 12px 24px;
  border: none;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 10px 25px rgba(54, 233, 97, 0.4);
    transform: translateY(-2px);
  }
`;

const Section = styled.section`
  padding: 4rem 1rem;
  
  @media (min-width: 640px) {
    padding: 4rem 1.5rem;
  }
  
  @media (min-width: 1024px) {
    padding: 4rem 2rem;
  }
  
  .section-content {
    max-width: 1280px;
    margin: 0 auto;
  }
`;

const HeroSection = styled(Section)`
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  padding-top: 5rem;
  
  .hero-grid {
    display: grid;
    gap: 3rem;
    align-items: center;
    
    @media (min-width: 1024px) {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  .hero-content {
    animation: ${fadeInUp} 0.8s ease-out;
    
    h1 {
      font-size: 2.5rem;
      font-weight: bold;
      color: #0a3042;
      margin-bottom: 1.5rem;
      line-height: 1.2;
      
      @media (min-width: 640px) {
        font-size: 3rem;
      }
      
      @media (min-width: 1024px) {
        font-size: 3.75rem;
      }
      
      .highlight {
        color: #36e961;
      }
    }
    
    p {
      font-size: 1.25rem;
      color: #6b7280;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
  }
  
  .cta-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
    
    @media (min-width: 640px) {
      flex-direction: row;
    }
  }
  
  .primary-cta {
    background: linear-gradient(135deg, #11506e, #36e961);
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 9999px;
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 20px 40px rgba(54, 233, 97, 0.4);
      transform: scale(1.05);
    }
  }
  
  .secondary-cta {
    background: transparent;
    color: #11506e;
    padding: 1rem 2rem;
    border: 2px solid #11506e;
    border-radius: 9999px;
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: #11506e;
      color: white;
    }
  }
  
  .social-proof {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    font-size: 0.875rem;
    color: #6b7280;
    
    .proof-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
  
  .hero-visual {
    display: none;
    
    @media (min-width: 1024px) {
      display: block;
      position: relative;
      
      .visual-card {
        background: white;
        border-radius: 1rem;
        padding: 2rem;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        position: relative;
        animation: ${float} 6s ease-in-out infinite;
        
        &::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #64ee85, #36e961);
          border-radius: 1rem;
          opacity: 0.2;
          transform: rotate(6deg);
          z-index: -1;
        }
        
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          
          .dot {
            width: 1rem;
            height: 1rem;
            background: #36e961;
            border-radius: 50%;
          }
          
          .big-number {
            font-size: 1.5rem;
            font-weight: bold;
            color: #0a3042;
          }
        }
        
        .progress-bars {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
          
          .bar {
            height: 1rem;
            border-radius: 0.5rem;
            
            &.full {
              background: #e5e7eb;
            }
            
            &.gradient {
              background: linear-gradient(135deg, #11506e, #36e961);
              width: 75%;
            }
            
            &.half {
              background: #e5e7eb;
              width: 50%;
            }
          }
        }
        
        .icons-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          
          .icon-item {
            text-align: center;
            
            .icon-circle {
              width: 3rem;
              height: 3rem;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 0.5rem;
              
              &.green {
                background: rgba(54, 233, 97, 0.2);
              }
              
              &.blue {
                background: rgba(100, 238, 133, 0.2);
              }
              
              &.light {
                background: rgba(146, 243, 169, 0.2);
              }
            }
            
            .icon-label {
              font-size: 0.75rem;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
`;

const StatsSection = styled(Section)`
  background: #0a3042;
  color: white;
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    
    @media (min-width: 768px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  .stat {
    text-align: center;
    
    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #36e961;
      margin-bottom: 0.5rem;
      
      @media (min-width: 640px) {
        font-size: 3rem;
      }
    }
    
    .stat-label {
      color: #9ca3af;
      font-weight: 500;
    }
  }
`;

const BenefitsSection = styled(Section)`
  .section-header {
    text-align: center;
    margin-bottom: 4rem;
    
    h2 {
      font-size: 2.25rem;
      font-weight: bold;
      color: #0a3042;
      margin-bottom: 1rem;
      
      @media (min-width: 640px) {
        font-size: 2.5rem;
      }
    }
    
    p {
      font-size: 1.25rem;
      color: #6b7280;
      max-width: 48rem;
      margin: 0 auto;
    }
  }
  
  .benefits-grid {
    display: grid;
    gap: 2rem;
    
    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    transform: translateY(-5px);
  }
  
  .card-icon {
    width: 4rem;
    height: 4rem;
    background: linear-gradient(135deg, #11506e, #36e961);
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    color: white;
    font-size: 1.5rem;
  }
  
  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #0a3042;
    margin-bottom: 1rem;
    text-align: center;
    line-height: 1.3;
    
    &.long-title {
      font-size: 1.1rem;
    }
  }
  
  .card-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      color: #6b7280;
      
      &::before {
        content: '✓';
        color: #36e961;
        font-weight: bold;
        flex-shrink: 0;
      }
    }
  }
`;

const ToolsGrid = styled.div`
  display: grid;
  gap: 2rem;
  margin-top: 3rem;
  grid-template-columns: 1fr;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const AffiliateSection = styled(Section)`
  background: linear-gradient(135deg, #f0fdff 0%, #e6fffa 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 100%;
    height: 200%;
    background: radial-gradient(circle, rgba(54, 233, 97, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  
  .affiliate-grid {
    display: grid;
    gap: 4rem;
    align-items: center;
    position: relative;
    z-index: 1;
    
    @media (min-width: 1024px) {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  .affiliate-content {
    animation: ${fadeInUp} 0.8s ease-out;
    
    h2 {
      font-size: 2.25rem;
      font-weight: bold;
      color: #0a3042;
      margin-bottom: 1rem;
      
      @media (min-width: 640px) {
        font-size: 2.5rem;
      }
      
      .highlight {
        color: #36e961;
      }
    }
    
    p {
      font-size: 1.25rem;
      color: #6b7280;
      margin-bottom: 2.5rem;
      line-height: 1.6;
    }
  }
  
  .benefits-list {
    display: grid;
    gap: 1rem;
    margin-bottom: 2.5rem;
    
    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .benefit-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    background: white;
    padding: 1rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    }
    
    .benefit-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    
    .benefit-text {
      .title {
        font-weight: 600;
        color: #0a3042;
        margin-bottom: 0.25rem;
      }
      
      .description {
        font-size: 0.875rem;
        color: #6b7280;
      }
    }
  }
  
  .affiliate-cta {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    
    @media (min-width: 640px) {
      flex-direction: row;
    }
    
    .primary-btn {
      background: linear-gradient(135deg, #11506e, #36e961);
      color: white;
      padding: 1rem 2rem;
      border: none;
      border-radius: 9999px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 20px 40px rgba(54, 233, 97, 0.4);
        transform: scale(1.05);
      }
    }
  }
  
  .affiliate-visual {
    display: none;
    
    @media (min-width: 1024px) {
      display: block;
      position: relative;
      
      .visual-card {
        background: white;
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        position: relative;
        animation: ${float} 6s ease-in-out infinite;
        
        &::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #36e961, #64ee85);
          border-radius: 1.5rem;
          opacity: 0.1;
          transform: rotate(-3deg);
          z-index: -1;
        }
        
        .earnings-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 1.5rem;
          
          h3 {
            color: #0a3042;
            font-weight: 600;
            margin: 0;
          }
          
          .status-dot {
            width: 0.75rem;
            height: 0.75rem;
            background: #36e961;
            border-radius: 50%;
            animation: ${glow} 2s ease-in-out infinite;
          }
        }
        
        .big-earnings {
          font-size: 2rem;
          font-weight: bold;
          color: #36e961;
          margin-bottom: 0.5rem;
        }
        
        .earnings-label {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 2rem;
        }
        
        .stats-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          
          .stat-item {
            text-align: center;
            
            .stat-number {
              font-size: 1.25rem;
              font-weight: bold;
              color: #0a3042;
              margin-bottom: 0.25rem;
            }
            
            .stat-label {
              font-size: 0.75rem;
              color: #6b7280;
            }
          }
        }
        
        .growth-chart {
          height: 3rem;
          background: linear-gradient(90deg, #e5e7eb 0%, #36e961 100%);
          border-radius: 0.5rem;
          position: relative;
          overflow: hidden;
          margin-bottom: 1rem;
          
          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 75%;
            height: 100%;
            background: linear-gradient(135deg, #11506e, #36e961);
            animation: growthAnimation 3s ease-in-out infinite alternate;
          }
        }
        
        .referral-badges {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
          
          .badge {
            background: rgba(54, 233, 97, 0.1);
            color: #36e961;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
          }
        }
      }
    }
  }
`;

const growthAnimation = keyframes`
  0% { width: 60%; }
  100% { width: 85%; }
`;

const CTASection = styled(Section)`
  background: linear-gradient(135deg, #11506e, #36e961);
  color: white;
  text-align: center;
  
  .cta-content {
    max-width: 64rem;
    margin: 0 auto;
    
    h2 {
      font-size: 2.25rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
      
      @media (min-width: 640px) {
        font-size: 2.5rem;
      }
    }
    
    p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    
    .final-cta {
      background: white;
      color: #11506e;
      padding: 1rem 3rem;
      border: none;
      border-radius: 9999px;
      font-size: 1.25rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      animation: ${glow} 2s ease-in-out infinite;
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 20px 40px rgba(255, 255, 255, 0.3);
      }
    }
    
    .guarantee {
      font-size: 0.875rem;
      margin-top: 1.5rem;
      opacity: 0.75;
    }
  }
`;

const Footer = styled.footer`
  background: #0a3042;
  color: white;
  padding: 3rem 1rem;
  
  .footer-content {
    max-width: 1280px;
    margin: 0 auto;
    
    .footer-grid {
      display: grid;
      gap: 2rem;
      
      @media (min-width: 768px) {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    
    .footer-brand {
      .brand {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
        
        img {
          height: 32px;
          width: auto;
        }
        
        span {
          margin-left: 12px;
          font-size: 1.25rem;
          font-weight: bold;
        }
      }
      
      p {
        color: #9ca3af;
        font-size: 0.875rem;
      }
    }
    
    .footer-section {
      h3 {
        font-weight: 600;
        margin-bottom: 1rem;
      }
      
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          margin-bottom: 0.5rem;
          
          a {
            color: #9ca3af;
            text-decoration: none;
            font-size: 0.875rem;
            transition: color 0.3s ease;
            
            &:hover {
              color: white;
            }
          }
        }
      }
    }
    
    .footer-bottom {
      border-top: 1px solid #374151;
      margin-top: 2rem;
      padding-top: 2rem;
      text-align: center;
      
      p {
        color: #9ca3af;
        font-size: 0.875rem;
      }
    }
  }
`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Meta tags
  useEffect(() => {
    document.title = "Data Atlas — Inteligência Empresarial (66M+)";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = "Acesso instantâneo a 66+ milhões de empresas, prospecção multicanal (Instagram, LinkedIn, Google Maps) e CRM integrado. Teste grátis por 30 dias.";
    }
  }, []);

  const handleStartTrial = () => {
    navigate('/register');
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Container>
      <Header>
        <nav>
          <div className="nav-content">
            <div className="logo">
              <img src={logo} alt="Data Atlas" />
            </div>

            <div className="nav-links">
              <a href="#beneficios" onClick={(e) => { e.preventDefault(); scrollToSection('beneficios'); }}>Benefícios</a>
              <a href="#ferramentas" onClick={(e) => { e.preventDefault(); scrollToSection('ferramentas'); }}>Ferramentas</a>
              <a href="#afiliados" onClick={(e) => { e.preventDefault(); scrollToSection('afiliados'); }}>Afiliados</a>
              <a href="#trial" onClick={(e) => { e.preventDefault(); scrollToSection('trial'); }}>Trial</a>
              <CTAButton onClick={handleStartTrial}>
                Entrar na plataforma
              </CTAButton>
            </div>

            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Abrir menu"
            >
              ☰
            </button>
          </div>
        </nav>
      </Header>

      <main>
        <HeroSection>
          <div className="section-content">
            <div className="hero-grid">
              <div className="hero-content">
                <h1>
                  <span className="highlight">66 milhões</span> de empresas,{" "}
                  <span style={{ display: 'block' }}>um clique de distância.</span>
                </h1>
                <p>
                  Dados oficiais + prospecção multicanal + CRM integrado para acelerar suas vendas.
                </p>
                
                <div className="cta-buttons">
                  <button 
                    className="primary-cta"
                    onClick={handleStartTrial}
                    aria-label="Iniciar teste gratuito de 30 dias"
                  >
                    Teste grátis por 30 dias
                  </button>
                  <button 
                    className="secondary-cta"
                    onClick={() => navigate('/dashboard')}
                  >
                    Ver demonstração
                  </button>
                </div>

                <div className="social-proof">
                  <div className="proof-item">
                    <span>✓</span>
                    <span>99%+ uptime</span>
                  </div>
                  <div className="proof-item">
                    <span>✓</span>
                    <span>Performance testada</span>
                  </div>
                  <div className="proof-item">
                    <span>✓</span>
                    <span>Zero bugs</span>
                  </div>
                </div>
              </div>

              <div className="hero-visual">
                <div className="visual-card">
                  <div className="stat-header">
                    <div className="dot"></div>
                    <div className="big-number">66.000.000+</div>
                  </div>
                  <div className="progress-bars">
                    <div className="bar full"></div>
                    <div className="bar gradient"></div>
                    <div className="bar half"></div>
                  </div>
                  <div className="icons-grid">
                    <div className="icon-item">
                      <div className="icon-circle green">🏢</div>
                      <div className="icon-label">Empresas</div>
                    </div>
                    <div className="icon-item">
                      <div className="icon-circle blue">🔍</div>
                      <div className="icon-label">Prospecção</div>
                    </div>
                    <div className="icon-item">
                      <div className="icon-circle light">📈</div>
                      <div className="icon-label">CRM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HeroSection>

        <StatsSection>
          <div className="section-content">
            <div className="stats-grid">
              <div className="stat">
                <div className="stat-number">66M+</div>
                <div className="stat-label">Empresas Brasileiras</div>
              </div>
              <div className="stat">
                <div className="stat-number">27</div>
                <div className="stat-label">Estados + DF</div>
              </div>
              <div className="stat">
                <div className="stat-number">20</div>
                <div className="stat-label">Segmentos Mapeados</div>
              </div>
              <div className="stat">
                <div className="stat-number">99%</div>
                <div className="stat-label">Uptime Garantido</div>
              </div>
            </div>
          </div>
        </StatsSection>

        <BenefitsSection id="beneficios">
          <div className="section-content">
            <div className="section-header">
              <h2>Por que o Data Atlas?</h2>
              <p>
                Uma plataforma completa de inteligência empresarial brasileira que oferece acesso instantâneo a dados de <strong>66+ milhões</strong> de empresas, ferramentas de prospecção multicanal e <strong>CRM integrado</strong> para impulsionar vendas e marketing.
              </p>
            </div>

            <div className="benefits-grid">
              <Card>
                <div className="card-icon">🏢</div>
                <h3 className="card-title">Base massiva, insights reais</h3>
                <ul className="card-list">
                  <li><strong>66.000.000+</strong> empresas brasileiras</li>
                  <li><strong>Cobertura nacional</strong>: 27 estados + DF</li>
                  <li><strong>20</strong> segmentos mapeados</li>
                  <li><strong>Dados de sócios</strong>: 3+ por empresa</li>
                  <li><strong>Dados de contato</strong>: telefone, email, endereço</li>
                  <li><strong>Base atualizada</strong>: dados oficiais Receita Federal</li>
                </ul>
              </Card>

              <Card>
                <div className="card-icon">🔍</div>
                <h3 className="card-title">Prospecção multicanal</h3>
                <ul className="card-list">
                  <li><strong>Instagram Email Scraper</strong>: extração de emails</li>
                  <li><strong>LinkedIn Company Scraper</strong>: dados empresariais</li>
                  <li><strong>Google Maps</strong>: prospecção local</li>
                  <li><strong>Busca Empresarial Inteligente</strong>: filtros avançados</li>
                  <li><strong>Processamento em tempo real</strong>: com progresso</li>
                  <li><strong>Múltiplos canais</strong>: prospecção integrada</li>
                </ul>
              </Card>

              <Card>
                <div className="card-icon">📈</div>
                <h3 className="card-title long-title">Um CRM conectado a maior base de dados do mundo</h3>
                <ul className="card-list">
                  <li><strong>Pipeline Kanban</strong>: visual e drag & drop</li>
                  <li><strong>Gestão de Leads</strong>: histórico completo</li>
                  <li><strong>Fases customizáveis</strong>: adapte seu processo</li>
                  <li><strong>Acompanhamento</strong>: progresso por etapa</li>
                  <li><strong>Conversão otimizada</strong>: identifique gargalos</li>
                  <li><strong>Interface intuitiva</strong>: fácil de usar</li>
                </ul>
              </Card>

              <Card>
                <div className="card-icon">📊</div>
                <h3 className="card-title">Exportação sem atrito</h3>
                <ul className="card-list">
                  <li><strong>Exportação nativa</strong>: Excel (.xlsx) e CSV</li>
                  <li><strong>32+ campos</strong> por empresa exportados</li>
                  <li><strong>Dados de sócios</strong>: informações detalhadas</li>
                  <li><strong>Performance</strong>: 50k empresas em 2,5min</li>
                  <li><strong>Formato compatível</strong>: Excel brasileiro</li>
                  <li><strong>Larguras automáticas</strong>: colunas otimizadas</li>
                </ul>
              </Card>
            </div>
          </div>
        </BenefitsSection>

        <Section id="ferramentas" style={{ background: '#f9fafb' }}>
          <div className="section-content">
            <div className="section-header">
              <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0a3042', marginBottom: '1rem', textAlign: 'center' }}>
                Ferramentas de Prospecção
              </h2>
              <p style={{ fontSize: '1.25rem', color: '#6b7280', textAlign: 'center' }}>
                Tudo que você precisa para encontrar e qualificar seus prospects
              </p>
            </div>

            <ToolsGrid>
              <Card>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '3rem', height: '3rem', background: 'linear-gradient(135deg, #11506e, #36e961)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                      🔍
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0a3042', marginBottom: '0.75rem' }}>
                        Busca Empresarial Inteligente
                      </h3>
                      <ul style={{ color: '#6b7280', margin: 0, padding: 0, listStyle: 'none' }}>
                        <li style={{ marginBottom: '0.5rem' }}>• Filtros avançados por segmento, localização, porte</li>
                        <li style={{ marginBottom: '0.5rem' }}>• Performance: <strong>50.000 empresas em ~2,5 minutos</strong></li>
                        <li style={{ marginBottom: '0.5rem' }}>• Exportação nativa <strong>Excel (.xlsx)</strong> e <strong>CSV</strong></li>
                        <li style={{ marginBottom: '0.5rem' }}>• <strong>32+ campos</strong> por empresa exportados</li>
                        <li style={{ marginBottom: '0.5rem' }}>• Dados de sócios detalhados inclusos</li>
                        <li>• <strong>Dados de contato</strong>: telefone, email, endereço</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '3rem', height: '3rem', background: 'linear-gradient(135deg, #11506e, #64ee85)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                      📷
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0a3042', marginBottom: '0.75rem' }}>
                        Instagram Email Scraper
                      </h3>
                      <ul style={{ color: '#6b7280', margin: 0, padding: 0, listStyle: 'none' }}>
                        <li style={{ marginBottom: '0.5rem' }}>• Extração de emails de perfis públicos</li>
                        <li style={{ marginBottom: '0.5rem' }}>• <strong>20 páginas</strong> processadas por busca</li>
                        <li style={{ marginBottom: '0.5rem' }}>• ~<strong>22 resultados</strong> em <strong>2–3 minutos</strong></li>
                        <li style={{ marginBottom: '0.5rem' }}>• Filtros: Gmail, Yahoo, Outlook</li>
                        <li>• Casos: influencers, clínicas, academias, restaurantes</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '3rem', height: '3rem', background: 'linear-gradient(135deg, #11506e, #92f3a9)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                      💼
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0a3042', marginBottom: '0.75rem' }}>
                        LinkedIn Company Scraper
                      </h3>
                      <ul style={{ color: '#6b7280', margin: 0, padding: 0, listStyle: 'none' }}>
                        <li style={{ marginBottom: '0.5rem' }}>• Busca empresas no LinkedIn com dados detalhados</li>
                        <li style={{ marginBottom: '0.5rem' }}>• <strong>50 empresas</strong> por busca com informações completas</li>
                        <li style={{ marginBottom: '0.5rem' }}>• Dados: funcionários, setor, localização, website</li>
                        <li style={{ marginBottom: '0.5rem' }}>• <strong>API Ghost Genius</strong> integrada</li>
                        <li>• Processamento em tempo real com barra de progresso</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '3rem', height: '3rem', background: 'linear-gradient(135deg, #11506e, #36e961)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                      🗺️
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0a3042', marginBottom: '0.75rem' }}>
                        Google Maps Business Scraper
                      </h3>
                      <ul style={{ color: '#6b7280', margin: 0, padding: 0, listStyle: 'none' }}>
                        <li style={{ marginBottom: '0.5rem' }}>• Extração local de nome, endereço, telefone, avaliações</li>
                        <li style={{ marginBottom: '0.5rem' }}>• Integração com <strong>Google Places API</strong></li>
                        <li style={{ marginBottom: '0.5rem' }}>• Ideal para prospecção <strong>local/territorial</strong></li>
                        <li style={{ marginBottom: '0.5rem' }}>• Dados de estabelecimentos comerciais</li>
                        <li>• Informações de contato direto</li>
                      </ul>
                    </div>
                  </div>
                </Card>
            </ToolsGrid>
          </div>
        </Section>

        <AffiliateSection id="afiliados">
          <div className="section-content">
            <div className="affiliate-grid">
              <div className="affiliate-content">
                <h2>
                  Programa de <span className="highlight">Afiliados</span>
                </h2>
                <p>
                  Transforme sua rede em renda extra. Ganhe comissões recorrentes compartilhando a maior base de dados empresariais do Brasil.
                </p>
                
                <div className="benefits-list">
                  <div className="benefit-item">
                    <div className="benefit-icon">💰</div>
                    <div className="benefit-text">
                      <div className="title">15% de comissão</div>
                      <div className="description">Para cada mensalidade dos seus referidos</div>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <div className="benefit-icon">🎁</div>
                    <div className="benefit-text">
                      <div className="title">10% de desconto</div>
                      <div className="description">Para quem usa seu link de afiliado</div>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <div className="benefit-icon">📈</div>
                    <div className="benefit-text">
                      <div className="title">Renda recorrente</div>
                      <div className="description">Comissões mensais automáticas</div>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <div className="benefit-icon">🔗</div>
                    <div className="benefit-text">
                      <div className="title">Link personalizado</div>
                      <div className="description">Fácil de compartilhar e rastrear</div>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <div className="benefit-icon">📊</div>
                    <div className="benefit-text">
                      <div className="title">Dashboard completo</div>
                      <div className="description">Aba Afiliados em Configurações</div>
                    </div>
                  </div>
                  
                  <div className="benefit-item">
                    <div className="benefit-icon">⚡</div>
                    <div className="benefit-text">
                      <div className="title">Pagamento automático</div>
                      <div className="description">Sem burocracia, direto na conta</div>
                    </div>
                  </div>
                </div>

                <div className="affiliate-cta">
                  <button 
                    className="primary-btn"
                    onClick={() => navigate('/dashboard?tab=configuracoes')}
                  >
                    Acessar Configurações
                  </button>
                </div>
              </div>

              <div className="affiliate-visual">
                <div className="visual-card">
                  <div className="earnings-header">
                    <h3>Ganhos do Afiliado</h3>
                    <div className="status-dot"></div>
                  </div>
                  
                  <div className="big-earnings">R$ 2.450</div>
                  <div className="earnings-label">Este mês</div>
                  
                  <div className="stats-row">
                    <div className="stat-item">
                      <div className="stat-number">47</div>
                      <div className="stat-label">Referidos</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">15%</div>
                      <div className="stat-label">Comissão</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">R$ 523</div>
                      <div className="stat-label">Próxima</div>
                    </div>
                  </div>
                  
                  <div className="growth-chart"></div>
                  
                  <div className="referral-badges">
                    <div className="badge">Ativo</div>
                    <div className="badge">Top 10%</div>
                    <div className="badge">Premium</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AffiliateSection>

        <CTASection id="trial">
          <div className="cta-content">
            <h2>Ative seu trial de 30 dias</h2>
            <p>
              <strong>Data Atlas</strong> — A maior plataforma de inteligência empresarial do Brasil. <strong>66 milhões</strong> de empresas na palma da sua mão.
            </p>
            <button 
              className="final-cta"
              onClick={handleStartTrial}
              aria-label="Iniciar teste gratuito de 30 dias"
            >
              Começar Agora - Grátis
            </button>
            <p className="guarantee">
              Sem cartão de crédito • Cancele quando quiser • Sem pegadinhas
            </p>
          </div>
        </CTASection>
      </main>

      <Footer>
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="brand">
                <img src={logo} alt="Data Atlas" />
                <span>Data Atlas</span>
              </div>
              <p>
                A maior plataforma de inteligência empresarial do Brasil.
              </p>
            </div>
            
            <div className="footer-section">
              <h3>Produto</h3>
              <ul>
                <li><a href="#ferramentas" onClick={(e) => { e.preventDefault(); scrollToSection('ferramentas'); }}>Ferramentas</a></li>
                <li><a href="#beneficios" onClick={(e) => { e.preventDefault(); scrollToSection('beneficios'); }}>Benefícios</a></li>
                <li><a href="#afiliados" onClick={(e) => { e.preventDefault(); scrollToSection('afiliados'); }}>Afiliados</a></li>
                <li><a href="#trial" onClick={(e) => { e.preventDefault(); scrollToSection('trial'); }}>Trial Gratuito</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Empresa</h3>
              <ul>
                <li><Link to="/about">Sobre</Link></li>
                <li><Link to="/privacy">Privacidade</Link></li>
                <li><Link to="/terms">Termos</Link></li>
                <li><Link to="/security">Segurança</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Suporte</h3>
              <ul>
                <li><a href="mailto:contato@dataatlas.com">Contato</a></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>
              © 2025 Data Atlas. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </Footer>
    </Container>
  );
};

export default LandingPage;