import { RequestHandler } from "express";
import { query } from "../database/connection.js";
import { v4 as uuidv4 } from 'uuid';

interface PixelEvent {
  id?: string;
  pixelId: string;
  site: string;
  eventType: 'pageview' | 'form_submit' | 'cta_click' | 'custom';
  timestamp: string;
  url: string;
  referrer: string;
  userAgent: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

interface Pixel {
  id: string;
  name: string;
  description: string;
  code: string;
  status: 'active' | 'inactive' | 'testing';
  site: string;
  createdAt: string;
  lastHit: string;
  totalHits: number;
  uniqueVisitors: number;
  conversions: number;
  conversionRate: number;
}

// Track pixel events
export const trackPixelEvent: RequestHandler = async (req, res) => {
  try {
    const eventData: PixelEvent = req.body;
    
    // Validate required fields
    if (!eventData.pixelId || !eventData.eventType || !eventData.url) {
      return res.status(400).json({ 
        error: 'Missing required fields: pixelId, eventType, url' 
      });
    }
    
    // Find the pixel by code
    const pixelSQL = 'SELECT * FROM pixels WHERE code = ?';
    const pixelResults = await query(pixelSQL, [eventData.pixelId]) as any[];
    
    if (pixelResults.length === 0) {
      return res.status(404).json({ 
        error: 'Pixel not found' 
      });
    }
    
    const pixel = pixelResults[0];
    
    // Check if pixel is active
    if (pixel.status !== 'active' && pixel.status !== 'testing') {
      return res.status(403).json({ 
        error: 'Pixel is not active' 
      });
    }
    
    // Insert event record
    const eventSQL = `
      INSERT INTO pixel_events (
        pixel_id, pixel_code, event_type, url, referrer, user_agent, 
        session_id, additional_data, ip_address, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const timestamp = eventData.timestamp || new Date().toISOString();
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    
    const result = await query(eventSQL, [
      pixel.id,
      eventData.pixelId,
      eventData.eventType,
      eventData.url,
      eventData.referrer || '',
      eventData.userAgent || '',
      eventData.sessionId || '',
      JSON.stringify(eventData.additionalData || {}),
      ipAddress,
      new Date(timestamp)
    ]) as any;
    
    // Update pixel statistics
    const updateSQL = `
      UPDATE pixels 
      SET 
        total_hits = total_hits + 1,
        last_hit = ?,
        conversions = CASE WHEN ? = 'form_submit' THEN conversions + 1 ELSE conversions END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await query(updateSQL, [new Date(timestamp), eventData.eventType, pixel.id]);
    
    // Update conversion rate (simplified calculation)
    if (eventData.eventType === 'form_submit') {
      const conversionSQL = `
        UPDATE pixels 
        SET conversion_rate = (conversions / GREATEST(unique_visitors, 1)) * 100
        WHERE id = ?
      `;
      await query(conversionSQL, [pixel.id]);
    }
    
    // Return success with event ID
    res.status(200).json({ 
      success: true,
      eventId: result.insertId
    });
    
  } catch (error) {
    console.error('Pixel tracking error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Get all pixels
export const getPixels: RequestHandler = async (req, res) => {
  try {
    const pixelsSQL = `
      SELECT 
        id, name, description, code, status, site, total_hits, unique_visitors,
        conversions, conversion_rate, last_hit, created_at, updated_at
      FROM pixels 
      ORDER BY created_at DESC
    `;
    
    const results = await query(pixelsSQL) as any[];
    
    const pixels: Pixel[] = results.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      code: row.code,
      status: row.status,
      site: row.site,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      lastHit: row.last_hit?.toISOString() || new Date().toISOString(),
      totalHits: row.total_hits || 0,
      uniqueVisitors: row.unique_visitors || 0,
      conversions: row.conversions || 0,
      conversionRate: parseFloat(row.conversion_rate) || 0
    }));
    
    res.json(pixels);
  } catch (error) {
    console.error('Error fetching pixels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get pixel by ID
export const getPixelById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pixelSQL = `
      SELECT 
        id, name, description, code, status, site, total_hits, unique_visitors,
        conversions, conversion_rate, last_hit, created_at, updated_at
      FROM pixels 
      WHERE id = ?
    `;
    
    const results = await query(pixelSQL, [id]) as any[];
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Pixel not found' });
    }
    
    const row = results[0];
    const pixel: Pixel = {
      id: row.id,
      name: row.name,
      description: row.description || '',
      code: row.code,
      status: row.status,
      site: row.site,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      lastHit: row.last_hit?.toISOString() || new Date().toISOString(),
      totalHits: row.total_hits || 0,
      uniqueVisitors: row.unique_visitors || 0,
      conversions: row.conversions || 0,
      conversionRate: parseFloat(row.conversion_rate) || 0
    };
    
    res.json(pixel);
  } catch (error) {
    console.error('Error fetching pixel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new pixel
export const createPixel: RequestHandler = async (req, res) => {
  try {
    const { name, description, site } = req.body;
    
    if (!name || !site) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, site' 
      });
    }
    
    const pixelId = uuidv4();
    const code = `px_${Date.now().toString().slice(-6)}_${site.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    
    const pixelSQL = `
      INSERT INTO pixels (
        id, name, description, code, status, site, total_hits, unique_visitors, 
        conversions, conversion_rate, last_hit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await query(pixelSQL, [
      pixelId,
      name,
      description || '',
      code,
      'testing',
      site,
      0,
      0,
      0,
      0.00,
      new Date()
    ]);
    
    const newPixel: Pixel = {
      id: pixelId,
      name,
      description: description || '',
      code,
      status: 'testing',
      site,
      createdAt: new Date().toISOString(),
      lastHit: new Date().toISOString(),
      totalHits: 0,
      uniqueVisitors: 0,
      conversions: 0,
      conversionRate: 0
    };
    
    res.status(201).json(newPixel);
    
  } catch (error) {
    console.error('Create pixel error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Update pixel
export const updatePixel: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if pixel exists
    const checkSQL = 'SELECT id FROM pixels WHERE id = ?';
    const existing = await query(checkSQL, [id]) as any[];
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Pixel not found' });
    }
    
    // Build update query dynamically (only allow certain fields)
    const allowedFields = ['name', 'description', 'status', 'site'];
    const updateFields = [];
    const updateValues = [];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    updateValues.push(id);
    
    const updateSQL = `
      UPDATE pixels 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await query(updateSQL, updateValues);
    
    // Return updated pixel
    const updatedPixelSQL = 'SELECT * FROM pixels WHERE id = ?';
    const [updatedPixel] = await query(updatedPixelSQL, [id]) as any[];
    
    res.json({
      id: updatedPixel.id,
      name: updatedPixel.name,
      description: updatedPixel.description || '',
      code: updatedPixel.code,
      status: updatedPixel.status,
      site: updatedPixel.site,
      createdAt: updatedPixel.created_at?.toISOString() || new Date().toISOString(),
      lastHit: updatedPixel.last_hit?.toISOString() || new Date().toISOString(),
      totalHits: updatedPixel.total_hits || 0,
      uniqueVisitors: updatedPixel.unique_visitors || 0,
      conversions: updatedPixel.conversions || 0,
      conversionRate: parseFloat(updatedPixel.conversion_rate) || 0
    });
    
  } catch (error) {
    console.error('Error updating pixel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete pixel
export const deletePixel: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if pixel exists
    const checkSQL = 'SELECT id FROM pixels WHERE id = ?';
    const existing = await query(checkSQL, [id]) as any[];
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Pixel not found' });
    }
    
    // Delete pixel (events will be deleted due to foreign key constraints)
    const deleteSQL = 'DELETE FROM pixels WHERE id = ?';
    await query(deleteSQL, [id]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting pixel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get pixel analytics
export const getPixelAnalytics: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeframe = '30d' } = req.query;
    
    // Check if pixel exists
    const pixelSQL = 'SELECT * FROM pixels WHERE id = ?';
    const pixelResults = await query(pixelSQL, [id]) as any[];
    
    if (pixelResults.length === 0) {
      return res.status(404).json({ error: 'Pixel not found' });
    }
    
    const pixel = pixelResults[0];
    
    // Calculate timeframe
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get events in timeframe
    const eventsSQL = `
      SELECT event_type, url, referrer, COUNT(*) as count
      FROM pixel_events 
      WHERE pixel_id = ? AND timestamp >= ?
      GROUP BY event_type, url, referrer
      ORDER BY count DESC
    `;
    
    const events = await query(eventsSQL, [id, startDate]) as any[];
    
    // Aggregate analytics
    const eventsByType: Record<string, number> = {};
    const topPages: Record<string, number> = {};
    const topReferrers: Record<string, number> = {};
    
    events.forEach((event: any) => {
      // Count by event type
      eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + event.count;
      
      // Count by page (pathname only)
      try {
        const pathname = new URL(event.url).pathname;
        topPages[pathname] = (topPages[pathname] || 0) + event.count;
      } catch {
        topPages[event.url] = (topPages[event.url] || 0) + event.count;
      }
      
      // Count by referrer
      const referrer = event.referrer || 'Direct';
      topReferrers[referrer] = (topReferrers[referrer] || 0) + event.count;
    });
    
    const totalEvents = events.reduce((sum, event) => sum + event.count, 0);
    
    const analytics = {
      pixel: {
        id: pixel.id,
        name: pixel.name,
        code: pixel.code,
        status: pixel.status,
        site: pixel.site,
        totalHits: pixel.total_hits,
        uniqueVisitors: pixel.unique_visitors,
        conversions: pixel.conversions,
        conversionRate: parseFloat(pixel.conversion_rate)
      },
      timeframe: timeframe,
      totalEvents,
      eventsByType,
      topPages,
      topReferrers
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching pixel analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get pixel events
export const getPixelEvents: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    // Check if pixel exists
    const checkSQL = 'SELECT id FROM pixels WHERE id = ?';
    const existing = await query(checkSQL, [id]) as any[];
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Pixel not found' });
    }
    
    // Get total count
    const countSQL = 'SELECT COUNT(*) as total FROM pixel_events WHERE pixel_id = ?';
    const [countResult] = await query(countSQL, [id]) as any[];
    
    // Get paginated events
    const eventsSQL = `
      SELECT id, pixel_code, event_type, url, referrer, user_agent, session_id, 
             additional_data, ip_address, timestamp, created_at
      FROM pixel_events 
      WHERE pixel_id = ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;
    
    const events = await query(eventsSQL, [id, Number(limit), Number(offset)]) as any[];
    
    const formattedEvents = events.map((event: any) => ({
      id: event.id.toString(),
      pixelId: event.pixel_code,
      eventType: event.event_type,
      url: event.url,
      referrer: event.referrer,
      userAgent: event.user_agent,
      sessionId: event.session_id,
      additionalData: event.additional_data ? JSON.parse(event.additional_data) : {},
      ipAddress: event.ip_address,
      timestamp: event.timestamp?.toISOString() || new Date().toISOString()
    }));
    
    res.json({
      events: formattedEvents,
      total: countResult.total,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    console.error('Error fetching pixel events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
