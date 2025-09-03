const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: { rejectUnauthorized: false }
});

/**
 * Sistema de restore de créditos a partir de backups
 * Permite recuperar créditos em caso de bugs ou problemas
 */
async function restoreCreditsFromBackup(backupDate = null, dryRun = true) {
  try {
    console.log(`🔄 Iniciando restore de créditos ${dryRun ? '(DRY RUN)' : '(EXECUÇÃO REAL)'}`);
    
    // Determinar arquivo de backup
    const backupDir = path.join(__dirname, '../backups/credits');
    let backupFile;
    
    if (backupDate) {
      backupFile = `credits_backup_${backupDate}.json`;
    } else {
      // Usar backup mais recente
      const files = await fs.readdir(backupDir);
      const backupFiles = files.filter(f => f.startsWith('credits_backup_') && f.endsWith('.json'));
      backupFiles.sort().reverse(); // Mais recente primeiro
      backupFile = backupFiles[0];
    }
    
    if (!backupFile) {
      throw new Error('Nenhum arquivo de backup encontrado');
    }
    
    const backupFilePath = path.join(backupDir, backupFile);
    console.log(`📁 Usando backup: ${backupFile}`);
    
    // Carregar dados do backup
    const backupData = JSON.parse(await fs.readFile(backupFilePath, 'utf8'));
    
    console.log(`📊 Dados do backup:`);
    console.log(`   - Data: ${backupData.backup_date}`);
    console.log(`   - Total usuários: ${backupData.total_users}`);
    console.log(`   - Total créditos: ${backupData.total_credits_distributed.toLocaleString()}`);
    
    if (dryRun) {
      console.log('\n🔍 DRY RUN - Simulando restore...');
      
      // Mostrar diferenças sem aplicar
      for (const backupUser of backupData.users) {
        const currentUser = await pool.query(
          'SELECT * FROM user_credits WHERE user_id = $1',
          [backupUser.user_id]
        );
        
        if (currentUser.rows.length === 0) {
          console.log(`➕ CRIAR: User ${backupUser.user_id} (${backupUser.email}) - ${backupUser.credits} créditos`);
        } else {
          const current = currentUser.rows[0];
          if (current.credits !== backupUser.credits) {
            console.log(`🔄 ATUALIZAR: User ${backupUser.user_id} (${backupUser.email}) - ${current.credits} → ${backupUser.credits} créditos`);
          }
        }
      }
      
      console.log('\n✅ DRY RUN concluído. Use dryRun=false para aplicar as mudanças.');
      
    } else {
      console.log('\n⚠️  APLICANDO MUDANÇAS REAIS...');
      
      let created = 0;
      let updated = 0;
      let errors = 0;
      
      // Aplicar restore real
      for (const backupUser of backupData.users) {
        try {
          const currentUser = await pool.query(
            'SELECT * FROM user_credits WHERE user_id = $1',
            [backupUser.user_id]
          );
          
          if (currentUser.rows.length === 0) {
            // Criar novo registro
            await pool.query(`
              INSERT INTO user_credits (user_id, credits, plan, created_at, updated_at)
              VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            `, [
              backupUser.user_id,
              backupUser.credits,
              backupUser.plan,
              backupUser.credits_created_at
            ]);
            
            console.log(`➕ CRIADO: User ${backupUser.user_id} (${backupUser.email}) - ${backupUser.credits} créditos`);
            created++;
            
          } else {
            const current = currentUser.rows[0];
            if (current.credits !== backupUser.credits || current.plan !== backupUser.plan) {
              // Atualizar registro existente
              await pool.query(`
                UPDATE user_credits 
                SET credits = $1, plan = $2, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $3
              `, [backupUser.credits, backupUser.plan, backupUser.user_id]);
              
              console.log(`🔄 ATUALIZADO: User ${backupUser.user_id} (${backupUser.email}) - ${current.credits} → ${backupUser.credits} créditos`);
              updated++;
            }
          }
          
        } catch (error) {
          console.error(`❌ ERRO: User ${backupUser.user_id} - ${error.message}`);
          errors++;
        }
      }
      
      console.log(`\n📊 Restore concluído:`);
      console.log(`   - Criados: ${created}`);
      console.log(`   - Atualizados: ${updated}`);
      console.log(`   - Erros: ${errors}`);
    }
    
    await pool.end();
    return { success: true, backupFile, dryRun };
    
  } catch (error) {
    console.error('❌ Erro no restore de créditos:', error);
    await pool.end();
    throw error;
  }
}

/**
 * Listar backups disponíveis
 */
async function listAvailableBackups() {
  try {
    const backupDir = path.join(__dirname, '../backups/credits');
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(f => f.startsWith('credits_backup_') && f.endsWith('.json'));
    
    console.log('📋 Backups disponíveis:');
    
    for (const file of backupFiles.sort().reverse()) {
      const backupPath = path.join(backupDir, file);
      const stats = await fs.stat(backupPath);
      const backup = JSON.parse(await fs.readFile(backupPath, 'utf8'));
      
      console.log(`   ${file}`);
      console.log(`      - Data: ${backup.backup_date}`);
      console.log(`      - Usuários: ${backup.total_users}`);
      console.log(`      - Créditos: ${backup.total_credits_distributed.toLocaleString()}`);
      console.log(`      - Tamanho: ${(stats.size / 1024).toFixed(1)}KB`);
      console.log('');
    }
    
    return backupFiles;
    
  } catch (error) {
    console.error('❌ Erro ao listar backups:', error);
    throw error;
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'list') {
    listAvailableBackups()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
      
  } else if (command === 'restore') {
    const backupDate = args[1]; // YYYY-MM-DD ou null para mais recente
    const dryRun = args[2] !== '--apply'; // Default é dry run
    
    restoreCreditsFromBackup(backupDate, dryRun)
      .then(() => {
        console.log('🎉 Operação concluída!');
        process.exit(0);
      })
      .catch(() => process.exit(1));
      
  } else {
    console.log('🔧 Uso do script de restore:');
    console.log('');
    console.log('  node restore-credits-from-backup.js list');
    console.log('    Lista todos os backups disponíveis');
    console.log('');
    console.log('  node restore-credits-from-backup.js restore [data] [--apply]');
    console.log('    data: YYYY-MM-DD (opcional, usa mais recente se omitido)');
    console.log('    --apply: aplica mudanças (sem isso, apenas simula)');
    console.log('');
    console.log('  Exemplos:');
    console.log('    node restore-credits-from-backup.js restore              # Dry run do backup mais recente');
    console.log('    node restore-credits-from-backup.js restore --apply      # Aplica backup mais recente');
    console.log('    node restore-credits-from-backup.js restore 2025-09-03   # Dry run do backup específico');
    console.log('    node restore-credits-from-backup.js restore 2025-09-03 --apply  # Aplica backup específico');
  }
}

module.exports = { restoreCreditsFromBackup, listAvailableBackups };