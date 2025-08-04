import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lead, LeadStatsResponse, LeadListResponse } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Users, 
  TrendingUp, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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

const getStatusColor = (status: string) => {
  switch (status) {
    case "new": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "contacted": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "qualified": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "converted": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "lost": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function Index() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [stats, setStats] = useState<LeadStatsResponse>(mockStats);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.data.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.data.whatsapp.includes(searchTerm) ||
                         lead.data.cep.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">E</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Ecko Streetwear</h1>
                <p className="text-sm text-muted-foreground">Sistema de Gestão de Leads</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newLeads} novos esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.convertedLeads} leads convertidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualificados</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.qualifiedLeads}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando follow-up
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos Hoje</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLeads}</div>
              <p className="text-xs text-muted-foreground">
                Nas últimas 24h
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, WhatsApp ou CEP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="new">Novo</SelectItem>
                  <SelectItem value="contacted">Contatado</SelectItem>
                  <SelectItem value="qualified">Qualificado</SelectItem>
                  <SelectItem value="converted">Convertido</SelectItem>
                  <SelectItem value="lost">Perdido</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Fontes</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="referral">Indicação</SelectItem>
                  <SelectItem value="direct">Direto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <Card>
          <CardHeader>
            <CardTitle>Leads ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>{lead.data.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-foreground">{lead.data.nome}</h3>
                        <Badge className={getStatusColor(lead.status || 'new')}>
                          {lead.status || 'new'}
                        </Badge>
                        <Badge className={getPriorityColor(lead.priority || 'medium')}>
                          {lead.priority || 'medium'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {lead.data.whatsapp}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {lead.data.cep}
                        </span>
                        <span>Tipo: {lead.data.tipoLoja}</span>
                        <span>CNPJ: {lead.data.cnpj}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span>Origem: {lead.origin}</span>
                        <span>Fonte: {lead.source}</span>
                        <span>{formatDate(lead.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
