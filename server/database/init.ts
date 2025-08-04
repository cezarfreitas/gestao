import { query, testConnection } from './connection.js';

// SQL for creating tables
const createTablesSQL = {
  // Leads table
  leads: `
    CREATE TABLE IF NOT EXISTS leads (
      id VARCHAR(36) PRIMARY KEY,
      type VARCHAR(50) NOT NULL DEFAULT 'form_with_cnpj',
      site_title VARCHAR(255),
      site_name VARCHAR(255),
      site_url VARCHAR(255),
      nome VARCHAR(255) NOT NULL,
      whatsapp VARCHAR(20),
      cnpj VARCHAR(20),
      tipo_loja VARCHAR(50),
      cep VARCHAR(20),
      origin VARCHAR(100),
      timestamp DATETIME NOT NULL,
      source VARCHAR(100),
      status ENUM('new', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new',
      priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
      notes TEXT,
      assigned_to VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_timestamp (timestamp),
      INDEX idx_status (status),
      INDEX idx_source (source),
      INDEX idx_site_name (site_name),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // Traffic data table (normalized from leads)
  traffic: `
    CREATE TABLE IF NOT EXISTS traffic (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lead_id VARCHAR(36) NOT NULL,
      referrer TEXT,
      user_agent TEXT,
      language VARCHAR(10),
      platform VARCHAR(50),
      screen_resolution VARCHAR(20),
      viewport_size VARCHAR(20),
      timezone VARCHAR(50),
      cookies_enabled BOOLEAN,
      online_status BOOLEAN,
      url TEXT,
      pathname VARCHAR(500),
      search TEXT,
      hash VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
      INDEX idx_lead_id (lead_id),
      INDEX idx_referrer (referrer(255)),
      INDEX idx_platform (platform)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // Interaction data table (normalized from leads)
  interactions: `
    CREATE TABLE IF NOT EXISTS interactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lead_id VARCHAR(36) NOT NULL,
      session_start_time DATETIME,
      time_on_site INT,
      interaction_timestamp DATETIME,
      session_id VARCHAR(100),
      page_views INT,
      scroll_depth INT,
      touch_device BOOLEAN,
      connection_type VARCHAR(20),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
      INDEX idx_lead_id (lead_id),
      INDEX idx_session_id (session_id),
      INDEX idx_session_start_time (session_start_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // Pixels table
  pixels: `
    CREATE TABLE IF NOT EXISTS pixels (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      code VARCHAR(100) UNIQUE NOT NULL,
      status ENUM('active', 'inactive', 'testing') DEFAULT 'testing',
      site VARCHAR(255) NOT NULL,
      total_hits INT DEFAULT 0,
      unique_visitors INT DEFAULT 0,
      conversions INT DEFAULT 0,
      conversion_rate DECIMAL(5,2) DEFAULT 0.00,
      last_hit DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_code (code),
      INDEX idx_status (status),
      INDEX idx_site (site),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // Pixel events table
  pixel_events: `
    CREATE TABLE IF NOT EXISTS pixel_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pixel_id VARCHAR(36) NOT NULL,
      pixel_code VARCHAR(100) NOT NULL,
      event_type ENUM('pageview', 'form_submit', 'cta_click', 'custom') NOT NULL,
      url TEXT,
      referrer TEXT,
      user_agent TEXT,
      session_id VARCHAR(100),
      additional_data JSON,
      ip_address VARCHAR(45),
      timestamp DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pixel_id) REFERENCES pixels(id) ON DELETE CASCADE,
      INDEX idx_pixel_id (pixel_id),
      INDEX idx_pixel_code (pixel_code),
      INDEX idx_event_type (event_type),
      INDEX idx_timestamp (timestamp),
      INDEX idx_session_id (session_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,

  // Lead stats summary table (for faster analytics)
  lead_stats: `
    CREATE TABLE IF NOT EXISTS lead_stats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date DATE NOT NULL,
      site_name VARCHAR(255),
      source VARCHAR(100),
      total_leads INT DEFAULT 0,
      new_leads INT DEFAULT 0,
      contacted_leads INT DEFAULT 0,
      qualified_leads INT DEFAULT 0,
      converted_leads INT DEFAULT 0,
      lost_leads INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_daily_stats (date, site_name, source),
      INDEX idx_date (date),
      INDEX idx_site_name (site_name),
      INDEX idx_source (source)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `
};

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    console.log('🔄 Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    console.log('🔄 Creating database tables...');
    
    // Create tables in order (considering foreign key dependencies)
    const tableOrder = ['leads', 'traffic', 'interactions', 'pixels', 'pixel_events', 'lead_stats'];
    
    for (const tableName of tableOrder) {
      console.log(`Creating table: ${tableName}`);
      await query(createTablesSQL[tableName as keyof typeof createTablesSQL]);
    }

    console.log('✅ Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Insert sample data for testing
export const insertSampleData = async () => {
  try {
    console.log('🔄 Inserting sample data...');
    
    // Sample lead data
    const sampleLeadId = 'lead_' + Date.now();
    const leadSQL = `
      INSERT IGNORE INTO leads (
        id, type, site_title, site_name, site_url, nome, whatsapp, cnpj, tipo_loja, cep,
        origin, timestamp, source, status, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await query(leadSQL, [
      sampleLeadId,
      'form_with_cnpj',
      'Ecko Streetwear - Seja um Lojista Oficial',
      'Ecko Streetwear',
      'https://ecko.com.br',
      'João Silva',
      '(11) 99999-9999',
      'sim',
      'fisica-ecommerce',
      '01000-000',
      'hero_cta',
      new Date('2024-01-15T10:30:00.000Z'),
      'website',
      'new',
      'high'
    ]);

    // Sample traffic data
    const trafficSQL = `
      INSERT IGNORE INTO traffic (
        lead_id, referrer, user_agent, language, platform, screen_resolution,
        viewport_size, timezone, cookies_enabled, online_status, url, pathname, search
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await query(trafficSQL, [
      sampleLeadId,
      'https://google.com',
      'Mozilla/5.0...',
      'pt-BR',
      'Win32',
      '1920x1080',
      '1366x768',
      'America/Sao_Paulo',
      true,
      true,
      'https://ecko.com.br',
      '/',
      '?utm_source=google'
    ]);

    // Sample interaction data
    const interactionSQL = `
      INSERT IGNORE INTO interactions (
        lead_id, session_start_time, time_on_site, interaction_timestamp, session_id,
        page_views, scroll_depth, touch_device, connection_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await query(interactionSQL, [
      sampleLeadId,
      new Date('2024-01-15T10:25:00.000Z'),
      320,
      new Date('2024-01-15T10:30:00.000Z'),
      'lfpxy8z1abc',
      3,
      75,
      false,
      '4g'
    ]);

    // Sample pixel data
    const pixelId = 'px_' + Date.now();
    const pixelSQL = `
      INSERT IGNORE INTO pixels (
        id, name, description, code, status, site, total_hits, unique_visitors, conversions, conversion_rate, last_hit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await query(pixelSQL, [
      pixelId,
      'Ecko Streetwear - Homepage',
      'Pixel principal para tracking da homepage',
      'px_001_ecko_main',
      'active',
      'https://ecko.com.br',
      15420,
      8930,
      234,
      2.62,
      new Date()
    ]);

    console.log('✅ Sample data inserted successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to insert sample data:', error);
    throw error;
  }
};

// Drop all tables (for development reset)
export const dropAllTables = async () => {
  try {
    console.log('🔄 Dropping all tables...');
    
    const dropOrder = ['pixel_events', 'interactions', 'traffic', 'lead_stats', 'pixels', 'leads'];
    
    // Disable foreign key checks temporarily
    await query('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const tableName of dropOrder) {
      await query(`DROP TABLE IF EXISTS ${tableName}`);
      console.log(`Dropped table: ${tableName}`);
    }
    
    // Re-enable foreign key checks
    await query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ All tables dropped successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to drop tables:', error);
    throw error;
  }
};
