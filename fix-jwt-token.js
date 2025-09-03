// Script para limpar tokens JWT corrompidos
// Execute no console do navegador (F12 -> Console)

console.log('🔧 LIMPANDO TOKENS JWT CORROMPIDOS...');

// 1. Mostrar token atual
const currentToken = localStorage.getItem('token');
console.log('Token atual:', currentToken ? 'EXISTE' : 'NÃO EXISTE');

if (currentToken) {
  try {
    // Tentar decodificar token
    const parts = currentToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token decodificado:', payload);
      console.log('Email no token:', payload.email);
      console.log('Token expira em:', new Date(payload.exp * 1000));
    } else {
      console.log('❌ TOKEN MALFORMADO - não tem 3 partes!');
    }
  } catch (error) {
    console.log('❌ ERRO ao decodificar token:', error.message);
  }
}

// 2. Limpar todos os dados
console.log('🧹 Limpando localStorage...');
localStorage.clear();

console.log('🧹 Limpando sessionStorage...');
sessionStorage.clear();

// 3. Limpar cookies (se houver)
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('✅ LIMPEZA COMPLETA! Recarregue a página (F5) e faça login novamente.');
console.log('📧 Use: rodyrodrigo@gmail.com');

// 4. Recarregar automaticamente após 2 segundos
setTimeout(() => {
  console.log('🔄 Recarregando página...');
  location.reload();
}, 2000);