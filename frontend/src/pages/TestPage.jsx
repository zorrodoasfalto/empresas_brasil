import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  color: #00ffaa;
  font-size: 2rem;
`;

const TestPage = () => {
  return (
    <Container>
      <Title>🧪 Página de Teste - Victor</Title>
      <p style={{color: '#fff', fontSize: '1.2rem'}}>
        Se você está vendo esta página, o React está funcionando!
      </p>
      <p style={{color: '#ccc'}}>
        Isso significa que o problema é específico da página GoogleMapsScraper.
      </p>
    </Container>
  );
};

export default TestPage;