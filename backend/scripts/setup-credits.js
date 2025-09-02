const { Pool } = require('pg');

const CONNECTION_STRING = 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway';

const pool = new Pool({
  connectionString: CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
});

async function setupCredits() {
  try {
    console.log('🚀 CONFIGURANDO SISTEMA DE CRÉDITOS...\n');

    // 1. Verificar quantos usuários existem
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM simple_users');
    console.log(`👥 Total de usuários: ${totalUsers.rows[0].count}`);

    // 2. Verificar usuários por role
    const usersByRole = await pool.query(`
      SELECT 
        COALESCE(role, 'trial') as role,
        COUNT(*) as count
      FROM simple_users 
      GROUP BY role
      ORDER BY role
    `);
    
    console.log('\n📊 USUÁRIOS POR ROLE:');
    usersByRole.rows.forEach(row => {
      console.log(`   ${row.role}: ${row.count} usuários`);
    });

    // 3. Configurar créditos para todos os usuários
    console.log('\n💳 CONFIGURANDO CRÉDITOS...');
    
    // Para cada usuário, criar registro de créditos baseado no role
    const allUsers = await pool.query(`
      SELECT id, email, COALESCE(role, 'trial') as role
      FROM simple_users 
      ORDER BY id
    `);

    let processed = 0;
    let adminsFound = 0;
    let trialsFound = 0;

    for (const user of allUsers.rows) {
      // Definir créditos baseado no role
      let credits = 5; // trial default
      let plan = user.role || 'trial';

      if (user.role === 'admin') {
        credits = 10000;
        adminsFound++;
      } else if (user.role === 'max') {
        credits = 300;
      } else if (user.role === 'premium') {
        credits = 150;
      } else if (user.role === 'pro') {
        credits = 50;
      } else {
        // trial ou null
        credits = 5;
        trialsFound++;
        plan = 'trial';
      }

      // Inserir ou atualizar créditos
      await pool.query(`
        INSERT INTO user_credits (user_id, credits, plan) 
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          credits = $2,
          plan = $3,
          updated_at = NOW()
      `, [user.id, credits, plan]);

      processed++;
    }

    console.log(`✅ ${processed} usuários processados`);
    console.log(`   👑 Admins configurados: ${adminsFound} (10.000 créditos cada)`);
    console.log(`   🆓 Trials configurados: ${trialsFound} (5 créditos cada)`);

    // 4. Verificar resultado final
    const creditsSummary = await pool.query(`
      SELECT 
        plan,
        COUNT(*) as users,
        SUM(credits) as total_credits,
        AVG(credits) as avg_credits
      FROM user_credits 
      GROUP BY plan
      ORDER BY plan
    `);

    console.log('\n📈 RESUMO FINAL DOS CRÉDITOS:');
    creditsSummary.rows.forEach(row => {
      console.log(`   ${row.plan}: ${row.users} usuários - ${row.total_credits} créditos total (média: ${Math.round(row.avg_credits)})`);
    });

    // 5. Verificar se admin específico está configurado corretamente
    const adminCheck = await pool.query(`
      SELECT u.email, uc.credits, uc.plan, u.role
      FROM simple_users u
      LEFT JOIN user_credits uc ON u.id = uc.user_id
      WHERE u.role = 'admin'
      ORDER BY u.id
    `);

    if (adminCheck.rows.length > 0) {
      console.log('\n👑 ADMINS CONFIGURADOS:');
      adminCheck.rows.forEach(admin => {
        console.log(`   ${admin.email}: ${admin.credits} créditos (${admin.plan})`);
      });
    }

    console.log('\n✅ SISTEMA DE CRÉDITOS CONFIGURADO COM SUCESSO!');
    console.log('\n💡 CUSTOS POR BUSCA:');
    console.log('   Google Maps: 1 crédito');
    console.log('   Instagram: 1 crédito');
    console.log('   LinkedIn: 5 créditos');
    console.log('   Empresas Brasil: 1 crédito');

  } catch (error) {
    console.error('❌ Erro ao configurar créditos:', error);
  } finally {
    await pool.end();
  }
}

setupCredits();