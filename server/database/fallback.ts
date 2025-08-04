// Fallback mock data when database is not available
import { Lead, LeadStatsResponse } from "@shared/api";

export const mockLeads: Lead[] = [
  {
    id: "lead_001",
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
    id: "lead_002",
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

export const mockStats: LeadStatsResponse = {
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

export const mockPixels = [
  {
    id: "px_001",
    name: "Ecko Streetwear - Homepage",
    description: "Pixel principal para tracking da homepage",
    code: "px_001_ecko_main",
    status: "active",
    site: "https://ecko.com.br",
    createdAt: "2024-01-10T10:00:00.000Z",
    lastHit: "2024-01-15T14:30:00.000Z",
    totalHits: 15420,
    uniqueVisitors: 8930,
    conversions: 234,
    conversionRate: 2.62
  },
  {
    id: "px_002",
    name: "Ecko Kids - Landing Page",
    description: "Tracking específico para campanhas do Ecko Kids",
    code: "px_002_kids_lp",
    status: "active",
    site: "https://kids.ecko.com.br",
    createdAt: "2024-01-08T15:20:00.000Z",
    lastHit: "2024-01-15T13:45:00.000Z",
    totalHits: 8760,
    uniqueVisitors: 5240,
    conversions: 156,
    conversionRate: 2.98
  }
];
