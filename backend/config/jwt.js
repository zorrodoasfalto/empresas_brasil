// Configuração unificada do JWT_SECRET para todo o projeto
// Evita problemas de inconsistência entre diferentes arquivos

const JWT_SECRET = process.env.JWT_SECRET || 'empresas-brasil-jwt-secret-2025-super-secure-key-for-production-and-development';

module.exports = {
  JWT_SECRET
};