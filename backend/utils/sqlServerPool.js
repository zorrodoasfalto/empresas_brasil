const sql = require('mssql');
const { URL } = require('url');

function parseConnectionString(connectionString = '') {
  const defaultConfig = {
    user: process.env.SQLSERVER_USER || 'sa',
    password: process.env.SQLSERVER_PASSWORD || 'YourStrong!Passw0rd',
    database: process.env.SQLSERVER_DATABASE || 'empresas_brasil',
    server: process.env.SQLSERVER_HOST || 'localhost',
    port: process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT, 10) : 1433,
    options: {
      encrypt: process.env.SQLSERVER_ENCRYPT ? process.env.SQLSERVER_ENCRYPT === 'true' : false,
      trustServerCertificate: process.env.SQLSERVER_TRUST_CERT ? process.env.SQLSERVER_TRUST_CERT === 'true' : true,
      enableArithAbort: true,
      appName: 'EmpresasBrasilBackend',
      useUTC: false,
      multipleStatements: true
    },
    pool: {
      max: process.env.SQLSERVER_MAX_POOL ? parseInt(process.env.SQLSERVER_MAX_POOL, 10) : 10,
      min: process.env.SQLSERVER_MIN_POOL ? parseInt(process.env.SQLSERVER_MIN_POOL, 10) : 1,
      idleTimeoutMillis: process.env.SQLSERVER_IDLE_TIMEOUT ? parseInt(process.env.SQLSERVER_IDLE_TIMEOUT, 10) : 30000
    }
  };

  if (!connectionString) {
    return defaultConfig;
  }

  if (connectionString.startsWith('mssql://') || connectionString.startsWith('sqlserver://')) {
    const normalized = connectionString.replace('mssql://', 'http://').replace('sqlserver://', 'http://');
    const url = new URL(normalized);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    return {
      user: decodeURIComponent(url.username || defaultConfig.user),
      password: decodeURIComponent(url.password || defaultConfig.password),
      database: decodeURIComponent(url.pathname ? url.pathname.replace(/^\//, '') : defaultConfig.database),
      server: decodeURIComponent(url.hostname || defaultConfig.server),
      port: url.port ? parseInt(url.port, 10) : defaultConfig.port,
      options: {
        encrypt: searchParams.encrypt ? searchParams.encrypt === 'true' : defaultConfig.options.encrypt,
        trustServerCertificate: searchParams.trustServerCertificate ? searchParams.trustServerCertificate === 'true' : defaultConfig.options.trustServerCertificate,
        enableArithAbort: true,
        appName: searchParams.appName || defaultConfig.options.appName,
        useUTC: searchParams.useUTC ? searchParams.useUTC === 'true' : defaultConfig.options.useUTC,
        multipleStatements: searchParams.multipleStatements ? searchParams.multipleStatements === 'true' : true
      },
      pool: {
        max: searchParams.max ? parseInt(searchParams.max, 10) : defaultConfig.pool.max,
        min: searchParams.min ? parseInt(searchParams.min, 10) : defaultConfig.pool.min,
        idleTimeoutMillis: searchParams.idleTimeoutMillis ? parseInt(searchParams.idleTimeoutMillis, 10) : defaultConfig.pool.idleTimeoutMillis
      }
    };
  }

  // Allow standard SQL Server connection strings: Server=host;Database=db;User Id=...;Password=...;Encrypt=false
  const parts = connectionString.split(';').filter(Boolean);
  if (parts.length > 1) {
    const config = { ...defaultConfig, options: { ...defaultConfig.options }, pool: { ...defaultConfig.pool } };
    for (const part of parts) {
      const [keyRaw, valueRaw] = part.split('=');
      if (!keyRaw || typeof valueRaw === 'undefined') continue;
      const key = keyRaw.trim().toLowerCase();
      const value = valueRaw.trim();

      switch (key) {
        case 'server':
        case 'data source':
        case 'addr':
        case 'address':
        case 'network address':
          config.server = value;
          break;
        case 'port':
          config.port = parseInt(value, 10);
          break;
        case 'database':
        case 'initial catalog':
          config.database = value;
          break;
        case 'user id':
        case 'uid':
          config.user = value;
          break;
        case 'password':
        case 'pwd':
          config.password = value;
          break;
        case 'encrypt':
          config.options.encrypt = value.toLowerCase() === 'true';
          break;
        case 'trustservercertificate':
          config.options.trustServerCertificate = value.toLowerCase() === 'true';
          break;
        case 'app':
        case 'application name':
          config.options.appName = value;
          break;
        case 'connection timeout':
          config.connectionTimeout = parseInt(value, 10);
          break;
        case 'poolmaxsize':
          config.pool.max = parseInt(value, 10);
          break;
        case 'poolminsize':
          config.pool.min = parseInt(value, 10);
          break;
        default:
          break;
      }
    }
    return config;
  }

  return defaultConfig;
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    return lowered === 'true' || lowered === '1' || lowered === 't';
  }
  return !!value;
}

function convertReturningClauses(query) {
  let converted = query;

  const insertRegex = /INSERT\s+INTO\s+([\w.\[\]"]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)\s*RETURNING\s+([^;]+);?/gi;
  converted = converted.replace(insertRegex, (match, table, columns, values, returning) => {
    const outputColumns = returning.split(',').map((col) => col.trim()).filter(Boolean);
    const outputClause = outputColumns.length > 0 ? `OUTPUT ${outputColumns.map((col) => `INSERTED.${col}`).join(', ')}` : '';
    return `INSERT INTO ${table} (${columns}) ${outputClause} VALUES (${values})`;
  });

  const updateRegex = /UPDATE\s+([\w.\[\]"]+)\s+SET\s+([\s\S]+?)\s+WHERE\s+([\s\S]+?)\s+RETURNING\s+([^;]+);?/gi;
  converted = converted.replace(updateRegex, (match, table, setClause, whereClause, returning) => {
    const outputColumns = returning.split(',').map((col) => col.trim()).filter(Boolean);
    const outputClause = outputColumns.length > 0 ? `OUTPUT ${outputColumns.map((col) => `INSERTED.${col}`).join(', ')}` : '';
    return `UPDATE ${table} SET ${setClause} ${outputClause} WHERE ${whereClause}`;
  });

  const deleteRegex = /DELETE\s+FROM\s+([\w.\[\]"]+)\s+WHERE\s+([\s\S]+?)\s+RETURNING\s+([^;]+);?/gi;
  converted = converted.replace(deleteRegex, (match, table, whereClause, returning) => {
    const outputColumns = returning.split(',').map((col) => col.trim()).filter(Boolean);
    const outputClause = outputColumns.length > 0 ? `OUTPUT ${outputColumns.map((col) => `DELETED.${col}`).join(', ')}` : '';
    return `DELETE FROM ${table} ${outputClause} WHERE ${whereClause}`;
  });

  return converted;
}

function convertOnConflict(query) {
  const onConflictRegex = /INSERT\s+INTO\s+([\w.\[\]"]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)\s*ON\s+CONFLICT\s*\(([^)]+)\)\s*DO\s+NOTHING;?/gi;
  return query.replace(onConflictRegex, (match, table, columns, values, conflictColumns) => {
    const cols = columns.split(',').map((c) => c.trim());
    const vals = values.split(',').map((v) => v.trim());
    const conflict = conflictColumns.split(',').map((c) => c.trim());

    const conditions = conflict.map((col) => {
      const index = cols.indexOf(col);
      if (index === -1) {
        return `${col} = ${col}`;
      }
      return `${col} = ${vals[index]}`;
    }).join(' AND ');

    return `IF NOT EXISTS (SELECT 1 FROM ${table} WHERE ${conditions})\nBEGIN\n  INSERT INTO ${table} (${columns}) VALUES (${values})\nEND`;
  });
}

function convertArrayComparisons(query, values) {
  let converted = query;
  const arrayParams = new Map();

  values.forEach((value, index) => {
    if (Array.isArray(value)) {
      const hasNumbers = value.every((item) => typeof item === 'number' || /^-?\d+$/.test(String(item)));
      arrayParams.set(index + 1, hasNumbers ? 'int' : 'string');
      values[index] = JSON.stringify(value);
    }
  });

  converted = converted.replace(/ANY\s*\(\s*\$(\d+)::int\[\]\s*\)/gi, (match, paramIndex) => {
    const index = parseInt(paramIndex, 10);
    arrayParams.set(index, 'int');
    return `IN (SELECT CAST([value] AS INT) FROM OPENJSON(@p${index}))`;
  });

  converted = converted.replace(/ANY\s*\(\s*\$(\d+)::text\[\]\s*\)/gi, (match, paramIndex) => {
    const index = parseInt(paramIndex, 10);
    arrayParams.set(index, 'string');
    return `IN (SELECT [value] FROM OPENJSON(@p${index}))`;
  });

  converted = converted.replace(/ANY\s*\(\s*\$(\d+)\s*\)/gi, (match, paramIndex) => {
    const index = parseInt(paramIndex, 10);
    const cast = arrayParams.get(index) === 'int' ? 'CAST([value] AS INT)' : '[value]';
    return `IN (SELECT ${cast} FROM OPENJSON(@p${index}))`;
  });

  return converted;
}

function normalizeFunctions(query) {
  return query
    .replace(/NOW\(\)/gi, 'SYSDATETIME()')
    .replace(/CURRENT_TIMESTAMP/gi, 'SYSDATETIME()')
    .replace(/CURRENT_DATE/gi, 'CAST(GETDATE() AS DATE)')
    .replace(/\bILIKE\b/gi, 'LIKE')
    .replace(/RANDOM\(\)/gi, 'NEWID()')
    .replace(/::\s*TEXT/gi, '')
    .replace(/::\s*BIGINT/gi, '')
    .replace(/::\s*INT/gi, '')
    .replace(/::\s*TIMESTAMP/gi, '')
    .replace(/BOOLEAN/gi, 'BIT')
    .replace(/\bTRUE\b/gi, '1')
    .replace(/\bFALSE\b/gi, '0');
}

function convertLimitClauses(query) {
  let converted = query;

  converted = converted.replace(/LIMIT\s+(\$\d+)/gi, (match, param) => {
    return `OFFSET 0 ROWS FETCH NEXT ${param} ROWS ONLY`;
  });

  converted = converted.replace(/LIMIT\s+(@p\d+)/gi, (match, param) => {
    return `OFFSET 0 ROWS FETCH NEXT ${param} ROWS ONLY`;
  });

  converted = converted.replace(/LIMIT\s+(\d+)/gi, (match, value) => {
    return `TOP ${value}`;
  });

  converted = converted.replace(/OFFSET\s+(\$\d+)\s+ROW\S*\s+FETCH\s+NEXT\s+(\$\d+)/gi, (match, offset, limit) => {
    return `OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
  });

  converted = converted.replace(/LIMIT\s+(@p\d+)\s+OFFSET\s+(@p\d+)/gi, (match, limit, offset) => {
    return `OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
  });

  converted = converted.replace(/LIMIT\s+(\$\d+)\s+OFFSET\s+(\$\d+)/gi, (match, limit, offset) => {
    return `OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
  });

  return converted;
}

function convertSelectTopClauses(query) {
  return query.replace(/SELECT\s+(DISTINCT\s+)?(TOP\s+\d+\s+)?/gi, (match, distinctPart) => {
    if (/TOP\s+\d+/i.test(match)) {
      return match;
    }
    return match;
  });
}

function prepareQuery(query, values) {
  let converted = convertReturningClauses(query);
  converted = convertOnConflict(converted);
  converted = convertArrayComparisons(converted, values);

  converted = converted.replace(/\$(\d+)/g, (match, index) => `@p${index}`);
  converted = normalizeFunctions(converted);
  converted = convertLimitClauses(converted);
  converted = convertSelectTopClauses(converted);

  return converted;
}

class Pool {
  constructor(config = {}) {
    const connectionString = config.connectionString || process.env.DATABASE_URL || process.env.SQLSERVER_URL;
    const parsedConfig = parseConnectionString(connectionString);

    this.pool = new sql.ConnectionPool({
      ...parsedConfig,
      options: {
        ...parsedConfig.options,
        trustServerCertificate: parsedConfig.options.trustServerCertificate !== false
      }
    });

    this.pool.on('error', (err) => {
      console.error('SQL Server pool error:', err.message);
    });

    this.poolConnect = this.pool.connect()
      .then(() => {
        console.log('✅ Connected to SQL Server');
      })
      .catch((err) => {
        console.error('❌ Failed to connect to SQL Server:', err.message);
        throw err;
      });
  }

  async query(text, params = []) {
    await this.poolConnect;

    const values = Array.isArray(params) ? [...params] : [];
    const preparedText = prepareQuery(text, values);

    const request = this.pool.request();
    values.forEach((value, index) => {
      const name = `p${index + 1}`;
      if (value === null || typeof value === 'undefined') {
        request.input(name, value);
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          request.input(name, sql.BigInt, value);
        } else {
          request.input(name, sql.Float, value);
        }
      } else if (typeof value === 'boolean') {
        request.input(name, sql.Bit, normalizeBoolean(value));
      } else if (value instanceof Date) {
        request.input(name, sql.DateTime2, value);
      } else if (Array.isArray(value)) {
        request.input(name, JSON.stringify(value));
      } else {
        request.input(name, sql.NVarChar(sql.MAX), value);
      }
    });

    const result = await request.query(preparedText);

    return {
      rows: result.recordset || [],
      rowCount: result.rowsAffected && result.rowsAffected.length > 0 ? result.rowsAffected[0] : (result.recordset ? result.recordset.length : 0)
    };
  }

  async connect() {
    await this.poolConnect;
    const transaction = new sql.Transaction(this.pool);
    let inTransaction = false;

    const executeQuery = async (text, params = []) => {
      const trimmed = text.trim().toUpperCase();
      if (trimmed === 'BEGIN' || trimmed === 'START TRANSACTION') {
        if (!inTransaction) {
          await transaction.begin();
          inTransaction = true;
        }
        return { rows: [], rowCount: 0 };
      }

      if (trimmed === 'COMMIT') {
        if (inTransaction) {
          await transaction.commit();
          inTransaction = false;
        }
        return { rows: [], rowCount: 0 };
      }

      if (trimmed === 'ROLLBACK') {
        if (inTransaction) {
          await transaction.rollback();
          inTransaction = false;
        }
        return { rows: [], rowCount: 0 };
      }

      const values = Array.isArray(params) ? [...params] : [];
      const preparedText = prepareQuery(text, values);

      const request = new sql.Request(inTransaction ? transaction : this.pool);
      values.forEach((value, index) => {
        const name = `p${index + 1}`;
        if (value === null || typeof value === 'undefined') {
          request.input(name, value);
        } else if (typeof value === 'number') {
          if (Number.isInteger(value)) {
            request.input(name, sql.BigInt, value);
          } else {
            request.input(name, sql.Float, value);
          }
        } else if (typeof value === 'boolean') {
          request.input(name, sql.Bit, normalizeBoolean(value));
        } else if (value instanceof Date) {
          request.input(name, sql.DateTime2, value);
        } else if (Array.isArray(value)) {
          request.input(name, JSON.stringify(value));
        } else {
          request.input(name, sql.NVarChar(sql.MAX), value);
        }
      });

      const result = await request.query(preparedText);
      return {
        rows: result.recordset || [],
        rowCount: result.rowsAffected && result.rowsAffected.length > 0 ? result.rowsAffected[0] : (result.recordset ? result.recordset.length : 0)
      };
    };

    return {
      query: executeQuery,
      release: async () => {
        if (inTransaction) {
          await transaction.rollback();
          inTransaction = false;
        }
      }
    };
  }

  release() {
    return this.pool.close();
  }

  end() {
    return this.pool.close();
  }

  on(event, listener) {
    this.pool.on(event, listener);
  }
}

module.exports = { Pool };
