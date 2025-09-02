// Configuração unificada do JWT_SECRET para todo o projeto
// Evita problemas de inconsistência entre diferentes arquivos

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-for-development';

module.exports = {
  JWT_SECRET
};