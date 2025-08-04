/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Lead management types based on the provided JSON structure
 */
export interface Site {
  title: string;
  name: string;
  url: string;
}

export interface LeadData {
  nome: string;
  whatsapp: string;
  cnpj: string;
  tipoLoja: string;
  cep: string;
}

export interface Traffic {
  referrer: string;
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  viewportSize: string;
  timezone: string;
  cookiesEnabled: boolean;
  onlineStatus: boolean;
  url: string;
  pathname: string;
  search: string;
  hash: string;
}

export interface Interaction {
  sessionStartTime: string;
  timeOnSite: number;
  currentTimestamp: string;
  sessionId: string;
  pageViews: number;
  scrollDepth: number;
  touchDevice: boolean;
  connectionType: string;
}

export interface Lead {
  id?: string;
  type: string;
  site: Site;
  data: LeadData;
  origin: string;
  timestamp: string;
  source: string;
  traffic: Traffic;
  interaction: Interaction;
  status?: "new" | "contacted" | "qualified" | "converted" | "lost";
  priority?: "low" | "medium" | "high";
  notes?: string;
  assignedTo?: string;
}

export interface LeadFilters {
  status?: string;
  priority?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface LeadListResponse {
  leads: Lead[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LeadStatsResponse {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  leadsBySource: Record<string, number>;
  leadsByType: Record<string, number>;
}
