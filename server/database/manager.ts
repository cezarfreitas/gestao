import { testConnection } from "./connection.js";
import { mockLeads, mockStats, mockPixels } from "./fallback.js";

// Global flag to track database availability
let isDatabaseAvailable = false;

// Test database availability on startup
export const checkDatabaseAvailability = async () => {
  console.log("🔍 Checking database availability...");

  try {
    isDatabaseAvailable = await testConnection(5000); // 5 second timeout

    if (isDatabaseAvailable) {
      console.log("✅ Database is available - using MySQL");
    } else {
      console.log("⚠️  Database unavailable - using mock data fallback");
    }
  } catch (error) {
    console.log("⚠️  Database connection failed - using mock data fallback");
    isDatabaseAvailable = false;
  }

  return isDatabaseAvailable;
};

// Get database availability status
export const getDatabaseStatus = () => {
  return {
    available: isDatabaseAvailable,
    mode: isDatabaseAvailable ? "database" : "mock",
  };
};

// Check if we should use database or fallback
export const shouldUseDatabase = () => isDatabaseAvailable;

// Middleware to add database status to requests
export const addDatabaseStatus = (req: any, res: any, next: any) => {
  req.dbStatus = getDatabaseStatus();
  next();
};

export { mockLeads, mockStats, mockPixels };
