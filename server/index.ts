import "dotenv/config";
import express from "express";
import cors from "cors";
import { initializeDatabase, insertSampleData } from "./database/init.js";
import { handleDemo } from "./routes/demo";
import {
  getLeads,
  getLeadStats,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
} from "./routes/leads";
import {
  trackPixelEvent,
  getPixels,
  getPixelById,
  createPixel,
  updatePixel,
  deletePixel,
  getPixelAnalytics,
  getPixelEvents
} from "./routes/pixel";

export function createServer() {
  const app = express();

  // Initialize database on startup
  initializeDatabase()
    .then(() => {
      console.log('📊 Database initialized successfully');
      // Insert sample data only if needed
      return insertSampleData();
    })
    .then(() => {
      console.log('🔧 Sample data inserted successfully');
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error);
    });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Lead management API routes
  app.get("/api/leads", getLeads);
  app.get("/api/leads/stats", getLeadStats);
  app.get("/api/leads/:id", getLeadById);
  app.post("/api/leads", createLead);
  app.put("/api/leads/:id", updateLead);
  app.delete("/api/leads/:id", deleteLead);

  // Pixel tracking API routes
  app.post("/api/pixel/track", trackPixelEvent);
  app.get("/api/pixels", getPixels);
  app.get("/api/pixels/:id", getPixelById);
  app.post("/api/pixels", createPixel);
  app.put("/api/pixels/:id", updatePixel);
  app.delete("/api/pixels/:id", deletePixel);
  app.get("/api/pixels/:id/analytics", getPixelAnalytics);
  app.get("/api/pixels/:id/events", getPixelEvents);

  return app;
}
