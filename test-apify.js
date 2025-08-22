#!/usr/bin/env node

/**
 * Script de teste para verificar configuração do Apify
 * Uso: node test-apify.js
 */

require('dotenv').config();
const axios = require('axios');

const APIFY_API_KEY = process.env.APIFY_API_KEY;
const APIFY_BASE_URL = 'https://api.apify.com/v2';

async function testApifyConfiguration() {
  console.log('🧪 TESTE DE CONFIGURAÇÃO APIFY');
  console.log('===============================');
  
  // 1. Verificar se a chave existe
  console.log('1. Verificando variável de ambiente...');
  if (!APIFY_API_KEY || APIFY_API_KEY === 'apify_api_your_key_here') {
    console.log('❌ APIFY_API_KEY não configurada');
    console.log('📋 INSTRUÇÕES:');
    console.log('   1. Acesse: https://console.apify.com/settings/integrations');
    console.log('   2. Copie sua "Personal API Token"');
    console.log('   3. Edite o arquivo .env');
    console.log('   4. Substitua "apify_api_your_key_here" pela sua chave real');
    console.log('   5. Execute novamente: node test-apify.js');
    return;
  }
  
  console.log(`✅ APIFY_API_KEY configurada (${APIFY_API_KEY.length} caracteres)`);
  
  // 2. Testar conexão básica
  console.log('\n2. Testando conexão com API Apify...');
  try {
    const response = await axios.get(`${APIFY_BASE_URL}/acts`, {
      params: { token: APIFY_API_KEY, limit: 1 },
      timeout: 10000
    });
    
    console.log('✅ Conexão com Apify API: SUCESSO');
    console.log(`📊 Status: ${response.status}`);
    
  } catch (error) {
    console.log('❌ Erro na conexão com Apify API');
    
    if (error.response) {
      console.log(`📊 Status: ${error.response.status}`);
      console.log(`📄 Erro: ${error.response.data?.error?.message || 'Erro desconhecido'}`);
      
      if (error.response.status === 401) {
        console.log('🔑 PROBLEMA: Chave API inválida');
        console.log('   - Verifique se a chave está correta');
        console.log('   - Gere uma nova chave em: https://console.apify.com/settings/integrations');
      }
    } else {
      console.log(`📄 Erro de rede: ${error.message}`);
    }
    return;
  }
  
  // 3. Testar actor específico do Google Maps
  console.log('\n3. Testando Google Maps Scraper...');
  try {
    const actorResponse = await axios.get(`${APIFY_BASE_URL}/acts/nwua9Gu5YrADL7ZDj`, {
      params: { token: APIFY_API_KEY },
      timeout: 10000
    });
    
    const actor = actorResponse.data.data;
    console.log('✅ Google Maps Scraper: ACESSÍVEL');
    console.log(`📋 Nome: ${actor.name}`);
    console.log(`👤 Autor: ${actor.username}`);
    console.log(`🌐 Público: ${actor.isPublic ? 'Sim' : 'Não'}`);
    
  } catch (error) {
    console.log('⚠️  Google Maps Scraper: NÃO ACESSÍVEL');
    console.log('   Pode ser necessário permissão ou o actor pode ter mudado');
  }
  
  // 4. Teste final
  console.log('\n4. Teste do servidor local...');
  try {
    const localResponse = await axios.get('http://localhost:6000/api/debug/env', {
      timeout: 5000
    });
    
    const data = localResponse.data;
    console.log('✅ Servidor local: RESPONDENDO');
    console.log(`🔑 Apify configurado: ${data.hasApifyKey ? 'SIM' : 'NÃO'}`);
    console.log(`📏 Tamanho da chave: ${data.apifyKeyLength}`);
    console.log(`🚀 Cliente inicializado: ${data.clientInitialized ? 'SIM' : 'NÃO'}`);
    
  } catch (error) {
    console.log('❌ Servidor local não está rodando');
    console.log('   Execute: node claude-startup.js');
  }
  
  console.log('\n🎉 TESTE CONCLUÍDO!');
  console.log('================');
  
  if (APIFY_API_KEY && APIFY_API_KEY !== 'apify_api_your_key_here') {
    console.log('✅ Apify deve estar funcionando corretamente!');
    console.log('🔄 Se o servidor estava rodando, reinicie-o para aplicar as mudanças');
  }
}

// Executar teste
testApifyConfiguration().catch(console.error);