import { RequestHandler } from "express";
import { Lead, LeadStatsResponse, LeadListResponse } from "@shared/api";

// Mock data for demonstration
const mockLeads: Lead[] = [
  {
    id: "1",
    type: "form_with_cnpj",
    site: {
      title: "Ecko Streetwear - Seja um Lojista Oficial",
      name: "Ecko Streetwear",
      url: "https://ecko.com.br"
    },
    data: {
      nome: "João Silva",
      whatsapp: "(11) 99999-9999",
      cnpj: "sim",
      tipoLoja: "fisica-ecommerce",
      cep: "01000-000"
    },
    origin: "hero_cta",
    timestamp: "2024-01-15T10:30:00.000Z",
    source: "website",
    status: "new",
    priority: "high",
    traffic: {
      referrer: "https://google.com",
      userAgent: "Mozilla/5.0...",
      language: "pt-BR",
      platform: "Win32",
      screenResolution: "1920x1080",
      viewportSize: "1366x768",
      timezone: "America/Sao_Paulo",
      cookiesEnabled: true,
      onlineStatus: true,
      url: "https://exemplo.com.br",
      pathname: "/",
      search: "?utm_source=google",
      hash: ""
    },
    interaction: {
      sessionStartTime: "2024-01-15T10:25:00.000Z",
      timeOnSite: 320,
      currentTimestamp: "2024-01-15T10:30:00.000Z",
      sessionId: "lfpxy8z1abc",
      pageViews: 3,
      scrollDepth: 75,
      touchDevice: false,
      connectionType: "4g"
    }
  },
  {
    id: "2",
    type: "form_with_cnpj",
    site: {
      title: "Ecko Streetwear - Seja um Lojista Oficial",
      name: "Ecko Streetwear",
      url: "https://ecko.com.br"
    },
    data: {
      nome: "Maria Santos",
      whatsapp: "(21) 88888-8888",
      cnpj: "sim",
      tipoLoja: "fisica",
      cep: "20000-000"
    },
    origin: "footer_form",
    timestamp: "2024-01-15T09:15:00.000Z",
    source: "social",
    status: "contacted",
    priority: "medium",
    traffic: {
      referrer: "https://instagram.com",
      userAgent: "Mozilla/5.0...",
      language: "pt-BR",
      platform: "iPhone",
      screenResolution: "375x812",
      viewportSize: "375x812",
      timezone: "America/Sao_Paulo",
      cookiesEnabled: true,
      onlineStatus: true,
      url: "https://exemplo.com.br",
      pathname: "/lojistas",
      search: "?utm_source=instagram",
      hash: ""
    },
    interaction: {
      sessionStartTime: "2024-01-15T09:10:00.000Z",
      timeOnSite: 450,
      currentTimestamp: "2024-01-15T09:15:00.000Z",
      sessionId: "abc123xyz",
      pageViews: 5,
      scrollDepth: 90,
      touchDevice: true,
      connectionType: "wifi"
    }
  }
];

const mockStats: LeadStatsResponse = {
  totalLeads: 1247,
  newLeads: 89,
  contactedLeads: 234,
  qualifiedLeads: 156,
  convertedLeads: 67,
  lostLeads: 89,
  conversionRate: 12.4,
  leadsBySource: {
    website: 678,
    social: 234,
    referral: 189,
    direct: 146
  },
  leadsByType: {
    "form_with_cnpj": 892,
    "newsletter": 234,
    "contact": 121
  }
};

// Get all leads with filtering and pagination
export const getLeads: RequestHandler = (req, res) => {
  const { page = 1, pageSize = 10, status, source, search } = req.query;
  
  let filteredLeads = [...mockLeads];
  
  // Apply filters
  if (status && status !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.status === status);
  }
  
  if (source && source !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.source === source);
  }
  
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    filteredLeads = filteredLeads.filter(lead => 
      lead.data.nome.toLowerCase().includes(searchTerm) ||
      lead.data.whatsapp.includes(searchTerm) ||
      lead.data.cep.includes(searchTerm)
    );
  }
  
  // Pagination
  const startIndex = (Number(page) - 1) * Number(pageSize);
  const endIndex = startIndex + Number(pageSize);
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);
  
  const response: LeadListResponse = {
    leads: paginatedLeads,
    total: filteredLeads.length,
    page: Number(page),
    pageSize: Number(pageSize)
  };
  
  res.json(response);
};

// Get lead statistics
export const getLeadStats: RequestHandler = (req, res) => {
  res.json(mockStats);
};

// Get a single lead by ID
export const getLeadById: RequestHandler = (req, res) => {
  const { id } = req.params;
  const lead = mockLeads.find(l => l.id === id);
  
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  
  res.json(lead);
};

// Create a new lead
export const createLead: RequestHandler = (req, res) => {
  const leadData = req.body as Omit<Lead, 'id'>;
  
  const newLead: Lead = {
    ...leadData,
    id: Date.now().toString(),
    status: leadData.status || 'new',
    priority: leadData.priority || 'medium'
  };
  
  mockLeads.push(newLead);
  res.status(201).json(newLead);
};

// Update a lead
export const updateLead: RequestHandler = (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const leadIndex = mockLeads.findIndex(l => l.id === id);
  
  if (leadIndex === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  
  mockLeads[leadIndex] = { ...mockLeads[leadIndex], ...updates };
  res.json(mockLeads[leadIndex]);
};

// Delete a lead
export const deleteLead: RequestHandler = (req, res) => {
  const { id } = req.params;
  const leadIndex = mockLeads.findIndex(l => l.id === id);
  
  if (leadIndex === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  
  mockLeads.splice(leadIndex, 1);
  res.status(204).send();
};
