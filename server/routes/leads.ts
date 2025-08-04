import { RequestHandler } from "express";
import { Lead, LeadStatsResponse, LeadListResponse } from "@shared/api";
import { query } from "../database/connection.js";
import { v4 as uuidv4 } from 'uuid';

// Get all leads with filtering and pagination
export const getLeads: RequestHandler = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, source, search } = req.query;
    
    let whereConditions = [];
    let params: any[] = [];
    
    // Build WHERE conditions
    if (status && status !== 'all') {
      whereConditions.push('l.status = ?');
      params.push(status);
    }
    
    if (source && source !== 'all') {
      whereConditions.push('l.source = ?');
      params.push(source);
    }
    
    if (search) {
      whereConditions.push('(l.nome LIKE ? OR l.whatsapp LIKE ? OR l.cep LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Get total count
    const countSQL = `
      SELECT COUNT(*) as total 
      FROM leads l 
      ${whereClause}
    `;
    const [countResult] = await query(countSQL, params) as any[];
    const total = countResult.total;
    
    // Get paginated results
    const offset = (Number(page) - 1) * Number(pageSize);
    const leadsSQL = `
      SELECT 
        l.*,
        t.referrer, t.user_agent, t.language, t.platform, t.screen_resolution,
        t.viewport_size, t.timezone, t.cookies_enabled, t.online_status, t.url, t.pathname, t.search, t.hash,
        i.session_start_time, i.time_on_site, i.current_timestamp, i.session_id,
        i.page_views, i.scroll_depth, i.touch_device, i.connection_type
      FROM leads l
      LEFT JOIN traffic t ON l.id = t.lead_id
      LEFT JOIN interactions i ON l.id = i.lead_id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(Number(pageSize), offset);
    const leads = await query(leadsSQL, params) as any[];
    
    // Transform database results to Lead interface
    const transformedLeads: Lead[] = leads.map((row: any) => ({
      id: row.id,
      type: row.type,
      site: {
        title: row.site_title || '',
        name: row.site_name || '',
        url: row.site_url || ''
      },
      data: {
        nome: row.nome,
        whatsapp: row.whatsapp || '',
        cnpj: row.cnpj || '',
        tipoLoja: row.tipo_loja || '',
        cep: row.cep || ''
      },
      origin: row.origin || '',
      timestamp: row.timestamp?.toISOString() || new Date().toISOString(),
      source: row.source || '',
      status: row.status || 'new',
      priority: row.priority || 'medium',
      notes: row.notes || '',
      assignedTo: row.assigned_to || '',
      traffic: {
        referrer: row.referrer || '',
        userAgent: row.user_agent || '',
        language: row.language || '',
        platform: row.platform || '',
        screenResolution: row.screen_resolution || '',
        viewportSize: row.viewport_size || '',
        timezone: row.timezone || '',
        cookiesEnabled: row.cookies_enabled || false,
        onlineStatus: row.online_status || false,
        url: row.url || '',
        pathname: row.pathname || '',
        search: row.search || '',
        hash: row.hash || ''
      },
      interaction: {
        sessionStartTime: row.session_start_time?.toISOString() || new Date().toISOString(),
        timeOnSite: row.time_on_site || 0,
        currentTimestamp: row.current_timestamp?.toISOString() || new Date().toISOString(),
        sessionId: row.session_id || '',
        pageViews: row.page_views || 0,
        scrollDepth: row.scroll_depth || 0,
        touchDevice: row.touch_device || false,
        connectionType: row.connection_type || ''
      }
    }));
    
    const response: LeadListResponse = {
      leads: transformedLeads,
      total,
      page: Number(page),
      pageSize: Number(pageSize)
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get lead statistics
export const getLeadStats: RequestHandler = async (req, res) => {
  try {
    // Get basic counts
    const statsSQL = `
      SELECT 
        COUNT(*) as totalLeads,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as newLeads,
        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contactedLeads,
        SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualifiedLeads,
        SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as convertedLeads,
        SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lostLeads
      FROM leads
    `;
    
    const [stats] = await query(statsSQL) as any[];
    
    // Get leads by source
    const sourceSQL = `
      SELECT source, COUNT(*) as count
      FROM leads
      GROUP BY source
    `;
    const sourceResults = await query(sourceSQL) as any[];
    const leadsBySource: Record<string, number> = {};
    sourceResults.forEach((row: any) => {
      leadsBySource[row.source || 'unknown'] = row.count;
    });
    
    // Get leads by type
    const typeSQL = `
      SELECT type, COUNT(*) as count
      FROM leads
      GROUP BY type
    `;
    const typeResults = await query(typeSQL) as any[];
    const leadsByType: Record<string, number> = {};
    typeResults.forEach((row: any) => {
      leadsByType[row.type || 'unknown'] = row.count;
    });
    
    const conversionRate = stats.totalLeads > 0 ? 
      (stats.convertedLeads / stats.totalLeads) * 100 : 0;
    
    const response: LeadStatsResponse = {
      totalLeads: stats.totalLeads || 0,
      newLeads: stats.newLeads || 0,
      contactedLeads: stats.contactedLeads || 0,
      qualifiedLeads: stats.qualifiedLeads || 0,
      convertedLeads: stats.convertedLeads || 0,
      lostLeads: stats.lostLeads || 0,
      conversionRate: Number(conversionRate.toFixed(2)),
      leadsBySource,
      leadsByType
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single lead by ID
export const getLeadById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const leadSQL = `
      SELECT 
        l.*,
        t.referrer, t.user_agent, t.language, t.platform, t.screen_resolution,
        t.viewport_size, t.timezone, t.cookies_enabled, t.online_status, t.url, t.pathname, t.search, t.hash,
        i.session_start_time, i.time_on_site, i.current_timestamp, i.session_id,
        i.page_views, i.scroll_depth, i.touch_device, i.connection_type
      FROM leads l
      LEFT JOIN traffic t ON l.id = t.lead_id
      LEFT JOIN interactions i ON l.id = i.lead_id
      WHERE l.id = ?
    `;
    
    const results = await query(leadSQL, [id]) as any[];
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    const row = results[0];
    const lead: Lead = {
      id: row.id,
      type: row.type,
      site: {
        title: row.site_title || '',
        name: row.site_name || '',
        url: row.site_url || ''
      },
      data: {
        nome: row.nome,
        whatsapp: row.whatsapp || '',
        cnpj: row.cnpj || '',
        tipoLoja: row.tipo_loja || '',
        cep: row.cep || ''
      },
      origin: row.origin || '',
      timestamp: row.timestamp?.toISOString() || new Date().toISOString(),
      source: row.source || '',
      status: row.status || 'new',
      priority: row.priority || 'medium',
      notes: row.notes || '',
      assignedTo: row.assigned_to || '',
      traffic: {
        referrer: row.referrer || '',
        userAgent: row.user_agent || '',
        language: row.language || '',
        platform: row.platform || '',
        screenResolution: row.screen_resolution || '',
        viewportSize: row.viewport_size || '',
        timezone: row.timezone || '',
        cookiesEnabled: row.cookies_enabled || false,
        onlineStatus: row.online_status || false,
        url: row.url || '',
        pathname: row.pathname || '',
        search: row.search || '',
        hash: row.hash || ''
      },
      interaction: {
        sessionStartTime: row.session_start_time?.toISOString() || new Date().toISOString(),
        timeOnSite: row.time_on_site || 0,
        currentTimestamp: row.current_timestamp?.toISOString() || new Date().toISOString(),
        sessionId: row.session_id || '',
        pageViews: row.page_views || 0,
        scrollDepth: row.scroll_depth || 0,
        touchDevice: row.touch_device || false,
        connectionType: row.connection_type || ''
      }
    };
    
    res.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new lead
export const createLead: RequestHandler = async (req, res) => {
  try {
    const leadData = req.body as Omit<Lead, 'id'>;
    const leadId = uuidv4();
    
    // Insert lead
    const leadSQL = `
      INSERT INTO leads (
        id, type, site_title, site_name, site_url, nome, whatsapp, cnpj, tipo_loja, cep,
        origin, timestamp, source, status, priority, notes, assigned_to
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await query(leadSQL, [
      leadId,
      leadData.type || 'form_with_cnpj',
      leadData.site.title,
      leadData.site.name,
      leadData.site.url,
      leadData.data.nome,
      leadData.data.whatsapp,
      leadData.data.cnpj,
      leadData.data.tipoLoja,
      leadData.data.cep,
      leadData.origin,
      new Date(leadData.timestamp),
      leadData.source,
      leadData.status || 'new',
      leadData.priority || 'medium',
      leadData.notes || '',
      leadData.assignedTo || ''
    ]);
    
    // Insert traffic data
    const trafficSQL = `
      INSERT INTO traffic (
        lead_id, referrer, user_agent, language, platform, screen_resolution,
        viewport_size, timezone, cookies_enabled, online_status, url, pathname, search, hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await query(trafficSQL, [
      leadId,
      leadData.traffic.referrer,
      leadData.traffic.userAgent,
      leadData.traffic.language,
      leadData.traffic.platform,
      leadData.traffic.screenResolution,
      leadData.traffic.viewportSize,
      leadData.traffic.timezone,
      leadData.traffic.cookiesEnabled,
      leadData.traffic.onlineStatus,
      leadData.traffic.url,
      leadData.traffic.pathname,
      leadData.traffic.search,
      leadData.traffic.hash
    ]);
    
    // Insert interaction data
    const interactionSQL = `
      INSERT INTO interactions (
        lead_id, session_start_time, time_on_site, current_timestamp, session_id,
        page_views, scroll_depth, touch_device, connection_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await query(interactionSQL, [
      leadId,
      new Date(leadData.interaction.sessionStartTime),
      leadData.interaction.timeOnSite,
      new Date(leadData.interaction.currentTimestamp),
      leadData.interaction.sessionId,
      leadData.interaction.pageViews,
      leadData.interaction.scrollDepth,
      leadData.interaction.touchDevice,
      leadData.interaction.connectionType
    ]);
    
    const newLead: Lead = {
      ...leadData,
      id: leadId,
      status: leadData.status || 'new',
      priority: leadData.priority || 'medium'
    };
    
    res.status(201).json(newLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a lead
export const updateLead: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if lead exists
    const checkSQL = 'SELECT id FROM leads WHERE id = ?';
    const existing = await query(checkSQL, [id]) as any[];
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    // Build update query dynamically
    const allowedFields = ['status', 'priority', 'notes', 'assigned_to'];
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
      UPDATE leads 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await query(updateSQL, updateValues);
    
    // Return updated lead
    const updatedLead = await getLeadById(req, res);
    
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a lead
export const deleteLead: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if lead exists
    const checkSQL = 'SELECT id FROM leads WHERE id = ?';
    const existing = await query(checkSQL, [id]) as any[];
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    // Delete lead (traffic and interactions will be deleted due to foreign key constraints)
    const deleteSQL = 'DELETE FROM leads WHERE id = ?';
    await query(deleteSQL, [id]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
