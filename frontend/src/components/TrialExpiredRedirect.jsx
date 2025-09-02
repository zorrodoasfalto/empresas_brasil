import React from 'react';

const TrialExpiredRedirect = ({ children }) => {
  // Se o usuário chegou até aqui, significa que já passou pela autenticação no Dashboard
  // Não há necessidade de fazer verificações redundantes
  // A verificação de trial será feita nas APIs quando necessário
  return children;
};

export default TrialExpiredRedirect;