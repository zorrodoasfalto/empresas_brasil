const cron = require('node-cron');
const { backupCreditsDaily } = require('./backup-credits-daily');

/**
 * Configuração do cron job para backup diário automático de créditos
 * Executa todo dia às 02:00 AM para não interferir com uso normal
 */
function setupCreditsBackupCron() {
  console.log('🕐 Configurando cron job para backup diário de créditos...');
  
  // Executar todo dia às 02:00 AM (horário do servidor)
  const cronExpression = '0 2 * * *'; // minuto hora dia mês dia_da_semana
  
  const task = cron.schedule(cronExpression, async () => {
    console.log(`\n🌅 Executando backup diário automático - ${new Date().toISOString()}`);
    
    try {
      const result = await backupCreditsDaily();
      console.log('✅ Backup diário concluído com sucesso!');
      console.log(`📁 Arquivo salvo: ${result.backupFilePath}`);
      
      // Log resumo para monitoramento
      console.log(`📊 Resumo: ${result.backup.total_users} usuários, ${result.backup.total_credits_distributed.toLocaleString()} créditos total`);
      
    } catch (error) {
      console.error('❌ ERRO no backup diário automático:', error);
      
      // Em produção, aqui você poderia enviar alerta por email/Slack
      // sendAlertEmail('Backup de créditos falhou', error.message);
    }
  }, {
    scheduled: false, // Não inicia automaticamente
    timezone: "America/Sao_Paulo" // Horário de Brasília
  });
  
  console.log(`✅ Cron job configurado: ${cronExpression} (02:00 AM todo dia)`);
  console.log('⏰ Timezone: America/Sao_Paulo (Brasília)');
  
  return {
    task,
    start: () => {
      task.start();
      console.log('🟢 Cron job iniciado - backup diário ativado');
    },
    stop: () => {
      task.stop();
      console.log('🔴 Cron job parado - backup diário desativado');
    },
    status: () => task.running,
    nextExecution: () => {
      // Calcular próxima execução
      const now = new Date();
      const next = new Date();
      next.setHours(2, 0, 0, 0); // 02:00 AM
      
      // Se já passou das 02:00 hoje, próxima execução é amanhã
      if (now.getHours() >= 2) {
        next.setDate(next.getDate() + 1);
      }
      
      return next;
    }
  };
}

/**
 * Executar backup manual (para testes)
 */
async function runManualBackup() {
  console.log('🔧 Executando backup manual...');
  
  try {
    const result = await backupCreditsDaily();
    console.log('✅ Backup manual concluído!');
    return result;
  } catch (error) {
    console.error('❌ Erro no backup manual:', error);
    throw error;
  }
}

// Exportar para uso em server.js
module.exports = {
  setupCreditsBackupCron,
  runManualBackup
};

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'manual') {
    // Executar backup manual
    runManualBackup()
      .then(() => {
        console.log('🎉 Backup manual concluído!');
        process.exit(0);
      })
      .catch(() => process.exit(1));
      
  } else if (command === 'test') {
    // Testar configuração do cron
    console.log('🧪 Testando configuração do cron job...');
    
    const cronManager = setupCreditsBackupCron();
    
    console.log(`📅 Próxima execução: ${cronManager.nextExecution().toLocaleString('pt-BR')}`);
    console.log(`🔄 Status: ${cronManager.status() ? 'Rodando' : 'Parado'}`);
    
    // Não iniciar em modo teste
    console.log('✅ Teste concluído. Use "start" para ativar o cron job.');
    
  } else if (command === 'start') {
    // Iniciar cron job
    const cronManager = setupCreditsBackupCron();
    cronManager.start();
    
    console.log(`📅 Próxima execução: ${cronManager.nextExecution().toLocaleString('pt-BR')}`);
    console.log('🟢 Cron job ativo. Pressione Ctrl+C para parar.');
    
    // Manter processo vivo
    process.on('SIGINT', () => {
      console.log('\n🛑 Parando cron job...');
      cronManager.stop();
      console.log('✅ Cron job parado.');
      process.exit(0);
    });
    
  } else {
    console.log('🔧 Uso do script de cron job:');
    console.log('');
    console.log('  node setup-credits-backup-cron.js manual');
    console.log('    Executa backup manual agora');
    console.log('');
    console.log('  node setup-credits-backup-cron.js test');
    console.log('    Testa configuração do cron job');
    console.log('');
    console.log('  node setup-credits-backup-cron.js start');
    console.log('    Inicia cron job (backup diário às 02:00)');
    console.log('');
    console.log('  O cron job roda automaticamente todo dia às 02:00 AM');
    console.log('  e mantém backups dos últimos 30 dias.');
  }
}