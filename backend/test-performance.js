const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZYTuUEyXUgNzuSqMYjEwloTlPmJKPCYh@hopper.proxy.rlwy.net:20520/railway',
  ssl: { rejectUnauthorized: false },
});

const JWT_SECRET = process.env.JWT_SECRET || 'empresas-brasil-jwt-secret-2024';

async function testPerformance() {
  try {
    console.log('🚀 TESTE DE PERFORMANCE DAS OTIMIZAÇÕES');
    console.log('=========================================');

    const startTime = Date.now();

    // Simular a query principal otimizada
    console.log('📊 Executando query principal otimizada...');
    const companiesQuery = `
      SELECT
        est.cnpj,
        est.cnpj_basico,
        est.razao_social,
        est.uf
      FROM estabelecimento est
      INNER JOIN empresas emp ON est.cnpj_basico = emp.cnpj_basico
      WHERE est.uf = 'SP'
        AND est.situacao_cadastral = '02'
        AND est.cnae_fiscal = ANY($1)
      ORDER BY est.cnpj_basico
      LIMIT 1000
    `;

    const transporteCnaes = ["4930201", "4930202", "5320202", "5229099"];
    const companiesResult = await pool.query(companiesQuery, [transporteCnaes]);

    const companiesTime = Date.now() - startTime;
    console.log(`✅ ${companiesResult.rows.length} empresas em ${companiesTime}ms`);

    // Simular query de sócios otimizada (1 sócio por empresa)
    if (companiesResult.rows.length > 0) {
      const cnpjBasicos = companiesResult.rows.map(row => row.cnpj_basico);

      console.log('📊 Executando query de sócios otimizada (1 por empresa)...');
      const sociosStartTime = Date.now();

      const sociosQuery = `
        SELECT
          cnpj_basico,
          nome_socio
        FROM (
          SELECT
            cnpj_basico,
            nome_socio,
            ROW_NUMBER() OVER (PARTITION BY cnpj_basico ORDER BY identificador_de_socio) as rn
          FROM socios
          WHERE cnpj_basico = ANY($1)
            AND nome_socio IS NOT NULL
            AND nome_socio != ''
        ) ranked_socios
        WHERE rn = 1
        ORDER BY cnpj_basico
      `;

      const sociosResult = await pool.query(sociosQuery, [cnpjBasicos]);
      const sociosTime = Date.now() - sociosStartTime;
      console.log(`✅ ${sociosResult.rows.length} sócios em ${sociosTime}ms`);
    }

    const totalTime = Date.now() - startTime;
    console.log('');
    console.log('🎯 RESULTADO FINAL:');
    console.log(`⚡ Tempo total: ${totalTime}ms`);
    console.log('✅ Otimizações aplicadas:');
    console.log('   • 1 sócio por empresa (vs 2 antes)');
    console.log('   • Query única (sem loop de paginação)');
    console.log('   • Sem LEFT JOIN com tabela simples');
    console.log('   • ROW_NUMBER para precisão de sócios');

    if (totalTime < 5000) {
      console.log('🚀 PERFORMANCE EXCELENTE! < 5 segundos');
    } else if (totalTime < 10000) {
      console.log('✅ Performance boa: < 10 segundos');
    } else {
      console.log('⚠️ Performance moderada: > 10 segundos');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testPerformance();