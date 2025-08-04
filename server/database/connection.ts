import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: 'server.idenegociosdigitais.com.br',
  port: 3308,
  user: 'leadsntk',
  password: 'cbfb25e40439aa14fed4',
  database: 'leadsntk',
  connectionLimit: 5,
  connectTimeout: 20000,
  waitForConnections: true,
  queueLimit: 0
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Execute query helper
export const query = async (sql: string, params?: any[]): Promise<any> => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get connection from pool
export const getConnection = async () => {
  return await pool.getConnection();
};

export default pool;
