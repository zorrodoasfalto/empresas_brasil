const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: { rejectUnauthorized: false }
});

/**
 * Sistema de backup diário de créditos dos usuários
 * Previne perda de dados e permite restore em caso de bugs
 */
async function backupCreditsDaily() {
  try {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log(`🔄 Iniciando backup diário de créditos - ${timestamp}`);

    // Buscar todos os dados de créditos com informações do usuário
    const backupData = await pool.query(`
      SELECT 
        uc.user_id,
        uc.credits,
        uc.plan,
        uc.created_at as credits_created_at,
        uc.updated_at as credits_updated_at,
        su.email,
        su.role as user_role,
        su.created_at as user_created_at,
        u.email as users_table_email,
        u.role as users_table_role,
        u.status as user_status,
        u.subscription_status,
        u.trial_expires_at,
        CURRENT_TIMESTAMP as backup_timestamp
      FROM user_credits uc
      LEFT JOIN simple_users su ON uc.user_id = su.id
      LEFT JOIN users u ON su.email = u.email
      ORDER BY uc.credits DESC, su.email ASC
    `);

    // Criar estrutura do backup
    const backup = {
      backup_date: timestamp,
      backup_timestamp: new Date().toISOString(),
      total_users: backupData.rows.length,
      total_credits_distributed: backupData.rows.reduce((sum, user) => sum + (user.credits || 0), 0),
      users: backupData.rows,
      summary: {
        admin_users: backupData.rows.filter(u => u.user_role === 'admin').length,
        trial_users: backupData.rows.filter(u => u.user_role === 'trial').length,
        pro_users: backupData.rows.filter(u => u.user_role === 'pro').length,
        premium_users: backupData.rows.filter(u => u.user_role === 'premium').length,
        max_users: backupData.rows.filter(u => u.user_role === 'max').length,
        credits_by_plan: {
          admin: backupData.rows.filter(u => u.plan === 'admin').reduce((sum, u) => sum + u.credits, 0),
          trial: backupData.rows.filter(u => u.plan === 'trial').reduce((sum, u) => sum + u.credits, 0),
          pro: backupData.rows.filter(u => u.plan === 'pro').reduce((sum, u) => sum + u.credits, 0),
          premium: backupData.rows.filter(u => u.plan === 'premium').reduce((sum, u) => sum + u.credits, 0),
          max: backupData.rows.filter(u => u.plan === 'max').reduce((sum, u) => sum + u.credits, 0)
        }
      }
    };

    // Criar pasta de backups se não existir
    const backupDir = path.join(__dirname, '../backups/credits');
    try {
      await fs.mkdir(backupDir, { recursive: true });
    } catch (err) {
      // Pasta já existe
    }

    // Salvar backup em arquivo JSON
    const backupFileName = `credits_backup_${timestamp}.json`;
    const backupFilePath = path.join(backupDir, backupFileName);
    
    await fs.writeFile(backupFilePath, JSON.stringify(backup, null, 2), 'utf8');

    // Criar também um backup CSV para fácil visualização
    const csvFileName = `credits_backup_${timestamp}.csv`;
    const csvFilePath = path.join(backupDir, csvFileName);
    
    let csvContent = 'user_id,email,role,plan,credits,created_at,updated_at,user_status,subscription_status,backup_date\n';
    backup.users.forEach(user => {
      csvContent += `${user.user_id},${user.email || 'N/A'},${user.user_role || 'N/A'},${user.plan || 'N/A'},${user.credits || 0},${user.credits_created_at || 'N/A'},${user.credits_updated_at || 'N/A'},${user.user_status || 'N/A'},${user.subscription_status || 'N/A'},${timestamp}\n`;
    });
    
    await fs.writeFile(csvFilePath, csvContent, 'utf8');

    // Log estatísticas
    console.log(`✅ Backup concluído com sucesso!`);
    console.log(`📊 Estatísticas do backup:`);
    console.log(`   - Total de usuários: ${backup.total_users}`);
    console.log(`   - Total de créditos: ${backup.total_credits_distributed.toLocaleString()}`);
    console.log(`   - Admins: ${backup.summary.admin_users} usuários`);
    console.log(`   - Trial: ${backup.summary.trial_users} usuários`);
    console.log(`   - Pro: ${backup.summary.pro_users} usuários`);
    console.log(`   - Premium: ${backup.summary.premium_users} usuários`);
    console.log(`   - Max: ${backup.summary.max_users} usuários`);
    console.log(`📁 Arquivos salvos:`);
    console.log(`   - JSON: ${backupFilePath}`);
    console.log(`   - CSV: ${csvFilePath}`);

    // Limpar backups antigos (manter últimos 30 dias)
    await cleanOldBackups(backupDir);

    await pool.end();
    return { success: true, backup, backupFilePath, csvFilePath };

  } catch (error) {
    console.error('❌ Erro no backup de créditos:', error);
    await pool.end();
    throw error;
  }
}

/**
 * Limpar backups antigos - manter apenas últimos 30 dias
 */
async function cleanOldBackups(backupDir) {
  try {
    const files = await fs.readdir(backupDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 dias atrás

    for (const file of files) {
      if (file.startsWith('credits_backup_') && file.includes('.json')) {
        // Extrair data do nome do arquivo
        const dateMatch = file.match(/credits_backup_(\d{4}-\d{2}-\d{2})\.json/);
        if (dateMatch) {
          const fileDate = new Date(dateMatch[1]);
          if (fileDate < cutoffDate) {
            const filePath = path.join(backupDir, file);
            const csvFile = file.replace('.json', '.csv');
            const csvPath = path.join(backupDir, csvFile);
            
            await fs.unlink(filePath);
            try {
              await fs.unlink(csvPath);
            } catch (err) {
              // CSV pode não existir
            }
            console.log(`🗑️  Backup antigo removido: ${file}`);
          }
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  Erro ao limpar backups antigos:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  backupCreditsDaily()
    .then(result => {
      console.log('🎉 Backup diário concluído com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Falha no backup diário:', error);
      process.exit(1);
    });
}

module.exports = { backupCreditsDaily, cleanOldBackups };