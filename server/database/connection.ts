import mysql from "mysql2/promise";

// Database configuration
const dbConfig = {
  host: "148.230.78.129",
  port: 3459,
  user: "leads",
  password: "e35dc30e2cfa66364f67",
  database: "leads",
  connectionLimit: 5,
  connectTimeout: 20000,
  waitForConnections: true,
  queueLimit: 0,
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test database connection with timeout
export const testConnection = async (timeoutMs = 10000) => {
  try {
    const connectionPromise = pool.getConnection();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout")), timeoutMs),
    );

    const connection = (await Promise.race([
      connectionPromise,
      timeoutPromise,
    ])) as any;
    console.log("✅ Database connected successfully to:", dbConfig.host);
    connection.release();
    return true;
  } catch (error) {
    console.error(
      "❌ Database connection failed:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
};

// Execute query helper
export const query = async (sql: string, params?: any[]): Promise<any> => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

// Get connection from pool
export const getConnection = async () => {
  return await pool.getConnection();
};

export default pool;
