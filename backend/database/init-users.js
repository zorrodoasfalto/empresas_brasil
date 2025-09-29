const { Pool } = require('../utils/sqlServerPool');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    process.env.SQLSERVER_URL ||
    'sqlserver://sa:YourStrong!Passw0rd@localhost:1433/empresas_brasil?encrypt=false&trustServerCertificate=true'
});

const createUsersTable = async () => {
  console.log('ℹ️ SQL Server migration: skipping automatic schema creation. Certifique-se de aplicar as migrações manualmente.');
  return Promise.resolve();
};

module.exports = { createUsersTable, pool };
