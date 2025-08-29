// Teste simples para verificar erros no Dashboard
const fs = require('fs');

// Ler o Dashboard.jsx
const dashboardContent = fs.readFileSync('./src/pages/Dashboard.jsx', 'utf8');

// Verificar erros comuns
const issues = [];

// Verificar variáveis não definidas
if (dashboardContent.includes('token') && !dashboardContent.includes('const token = localStorage.getItem')) {
  issues.push('Token pode estar undefined');
}

// Verificar states duplicados
const stateMatches = dashboardContent.match(/useState\(/g) || [];
const uniqueStates = new Set();
const duplicateStates = [];

// Procurar por declarações de state
const stateDeclarations = dashboardContent.match(/const \[(\w+),/g) || [];
stateDeclarations.forEach(declaration => {
  const stateName = declaration.match(/const \[(\w+),/)[1];
  if (uniqueStates.has(stateName)) {
    duplicateStates.push(stateName);
  }
  uniqueStates.add(stateName);
});

if (duplicateStates.length > 0) {
  issues.push(`States duplicados: ${duplicateStates.join(', ')}`);
}

// Verificar imports
const requiredImports = ['React', 'useState', 'useEffect', 'useAuth', 'toast'];
requiredImports.forEach(imp => {
  if (!dashboardContent.includes(imp)) {
    issues.push(`Import missing: ${imp}`);
  }
});

console.log('=== ANÁLISE DO DASHBOARD ===');
console.log(`Total de useState: ${stateMatches.length}`);
console.log(`States únicos: ${uniqueStates.size}`);
console.log(`Linhas de código: ${dashboardContent.split('\n').length}`);

if (issues.length > 0) {
  console.log('\n❌ PROBLEMAS ENCONTRADOS:');
  issues.forEach(issue => console.log(`- ${issue}`));
} else {
  console.log('\n✅ Nenhum problema óbvio encontrado');
}