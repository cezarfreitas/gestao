import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lead, LeadStatsResponse } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  MousePointer,
  Wifi,
  MapPin,
  Phone,
  Building,
  Calendar,
  Eye,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  ExternalLink,
  Code,
} from "lucide-react";

// Mock data for 7 different sites
const mockSites = [
  {
    name: "Ecko Streetwear",
    title: "Ecko Streetwear - Seja um Lojista Oficial",
    url: "https://ecko.com.br",
    leads: 892,
    conversion: 15.2,
    status: "active",
  },
  {
    name: "Ecko Kids",
    title: "Ecko Kids - Moda Infantil Oficial",
    url: "https://kids.ecko.com.br",
    leads: 567,
    conversion: 12.8,
    status: "active",
  },
  {
    name: "Ecko Feminino",
    title: "Ecko Feminino - Coleção Exclusiva",
    url: "https://women.ecko.com.br",
    leads: 423,
    conversion: 18.1,
    status: "active",
  },
  {
    name: "Ecko Outlet",
    title: "Ecko Outlet - Ofertas Especiais",
    url: "https://outlet.ecko.com.br",
    leads: 334,
    conversion: 9.4,
    status: "active",
  },
  {
    name: "Ecko Pro",
    title: "Ecko Pro - Linha Profissional",
    url: "https://pro.ecko.com.br",
    leads: 289,
    conversion: 22.3,
    status: "active",
  },
  {
    name: "Ecko Accessories",
    title: "Ecko Accessories - Acessórios Originais",
    url: "https://accessories.ecko.com.br",
    leads: 198,
    conversion: 14.7,
    status: "active",
  },
  {
    name: "Ecko Limited",
    title: "Ecko Limited - Edições Limitadas",
    url: "https://limited.ecko.com.br",
    leads: 156,
    conversion: 28.5,
    status: "beta",
  },
];

// Mock analytics data based on the payload structure
const mockAnalytics = {
  leadSources: [
    { name: "Website", value: 45, count: 892 },
    { name: "Social Media", value: 25, count: 496 },
    { name: "Google Ads", value: 20, count: 396 },
    { name: "Referral", value: 10, count: 198 },
  ],
  leadOrigins: [
    { name: "hero_cta", value: 35, count: 693 },
    { name: "footer_form", value: 25, count: 495 },
    { name: "sidebar_cta", value: 20, count: 396 },
    { name: "popup_form", value: 15, count: 297 },
    { name: "newsletter", value: 5, count: 99 },
  ],
  deviceTypes: [
    { name: "Desktop", value: 60, count: 1188 },
    { name: "Mobile", value: 35, count: 693 },
    { name: "Tablet", value: 5, count: 99 },
  ],
  platforms: [
    { name: "Windows", value: 45, count: 891 },
    { name: "Android", value: 25, count: 495 },
    { name: "iOS", value: 20, count: 396 },
    { name: "macOS", value: 10, count: 198 },
  ],
  connectionTypes: [
    { name: "WiFi", value: 55, count: 1089 },
    { name: "4G", value: 30, count: 594 },
    { name: "3G", value: 10, count: 198 },
    { name: "5G", value: 5, count: 99 },
  ],
  timeMetrics: {
    avgTimeOnSite: 245,
    avgPageViews: 3.2,
    avgScrollDepth: 68,
    bounceRate: 24,
  },
  storeTypes: [
    { name: "fisica-ecommerce", value: 40, count: 792 },
    { name: "fisica", value: 35, count: 693 },
    { name: "ecommerce", value: 25, count: 495 },
  ],
  topRegions: [
    { region: "São Paulo", count: 423, percentage: 21.3 },
    { region: "Rio de Janeiro", count: 298, percentage: 15.0 },
    { region: "Minas Gerais", count: 245, percentage: 12.3 },
    { region: "Paraná", count: 189, percentage: 9.5 },
    { region: "Bahia", count: 156, percentage: 7.8 },
  ],
};

const mockStats: LeadStatsResponse = {
  totalLeads: 1980,
  newLeads: 124,
  contactedLeads: 356,
  qualifiedLeads: 289,
  convertedLeads: 98,
  lostLeads: 145,
  conversionRate: 14.2,
  leadsBySource: {
    website: 892,
    social: 496,
    ads: 396,
    referral: 196,
  },
  leadsByType: {
    form_with_cnpj: 1485,
    newsletter: 297,
    contact: 198,
  },
};

// Generate mock daily leads data for the last 30 days with individual site data
const generateDailyLeadsData = () => {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const weekdayMultiplier =
      date.getDay() >= 1 && date.getDay() <= 5 ? 1.2 : 0.8;

    // Generate leads for each site based on their relative performance
    const siteLeads = {
      "Ecko Streetwear": Math.round(
        (8 + Math.random() * 12) * weekdayMultiplier,
      ),
      "Ecko Kids": Math.round((4 + Math.random() * 8) * weekdayMultiplier),
      "Ecko Feminino": Math.round((3 + Math.random() * 6) * weekdayMultiplier),
      "Ecko Outlet": Math.round((2 + Math.random() * 5) * weekdayMultiplier),
      "Ecko Pro": Math.round((2 + Math.random() * 4) * weekdayMultiplier),
      "Ecko Accessories": Math.round(
        (1 + Math.random() * 3) * weekdayMultiplier,
      ),
      "Ecko Limited": Math.round((1 + Math.random() * 2) * weekdayMultiplier),
    };

    const totalLeads = Object.values(siteLeads).reduce(
      (sum, leads) => sum + leads,
      0,
    );

    data.push({
      date: date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      fullDate: date.toLocaleDateString("pt-BR"),
      total: totalLeads,
      ...siteLeads,
    });
  }

  return data;
};

const dailyLeadsData = generateDailyLeadsData();

// Color palette for different sites
const siteColors = {
  "Ecko Streetwear": "#2563eb", // Blue
  "Ecko Kids": "#dc2626", // Red
  "Ecko Feminino": "#c026d3", // Magenta
  "Ecko Outlet": "#ea580c", // Orange
  "Ecko Pro": "#16a34a", // Green
  "Ecko Accessories": "#7c3aed", // Purple
  "Ecko Limited": "#0891b2", // Cyan
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
};

export default function Dashboards() {
  const [stats, setStats] = useState<LeadStatsResponse>(mockStats);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [selectedSite, setSelectedSite] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    E
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Ecko Streetwear
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Sistema de Gestão de Leads
                  </p>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  to="/"
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Leads</span>
                </Link>
                <Link
                  to="/dashboards"
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Análises</span>
                </Link>
                <Link
                  to="/pixel"
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Code className="w-4 h-4" />
                  <span>Pixel</span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecionar Site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Sites</SelectItem>
                  {mockSites.map((site) => (
                    <SelectItem key={site.url} value={site.url}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Leads
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalLeads.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats.newLeads} nos últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Conversão
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.convertedLeads} conversões
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatTime(mockAnalytics.timeMetrics.avgTimeOnSite)}
              </div>
              <p className="text-xs text-muted-foreground">
                {mockAnalytics.timeMetrics.avgPageViews} páginas/sessão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Rejeição
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockAnalytics.timeMetrics.bounceRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                {mockAnalytics.timeMetrics.avgScrollDepth}% scroll médio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Leads Chart */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Entrada de Leads - Últimos 30 Dias</span>
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>
                  Total:{" "}
                  {dailyLeadsData.reduce((sum, day) => sum + day.total, 0)}{" "}
                  leads
                </span>
                <span>•</span>
                <span>
                  Média:{" "}
                  {Math.round(
                    dailyLeadsData.reduce((sum, day) => sum + day.total, 0) /
                      dailyLeadsData.length,
                  )}{" "}
                  leads/dia
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyLeadsData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={{
                      stroke: "hsl(var(--muted-foreground))",
                      strokeWidth: 1,
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={{
                      stroke: "hsl(var(--muted-foreground))",
                      strokeWidth: 1,
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: any, name: string) => [
                      `${value} leads`,
                      name,
                    ]}
                    labelFormatter={(label: any, payload: any) => {
                      if (payload && payload[0]) {
                        return `Data: ${payload[0].payload.fullDate}`;
                      }
                      return `Data: ${label}`;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="line"
                  />

                  {/* Line for each site */}
                  {Object.keys(siteColors).map((siteName) => (
                    <Line
                      key={siteName}
                      type="monotone"
                      dataKey={siteName}
                      stroke={siteColors[siteName as keyof typeof siteColors]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Daily insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.max(...dailyLeadsData.map((d) => d.total))}
                </div>
                <div className="text-sm text-muted-foreground">Melhor Dia</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {
                    dailyLeadsData.find(
                      (d) =>
                        d.total ===
                        Math.max(...dailyLeadsData.map((d) => d.total)),
                    )?.fullDate
                  }
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(
                    dailyLeadsData
                      .slice(-7)
                      .reduce((sum, day) => sum + day.total, 0) / 7,
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Média Últimos 7 Dias
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {dailyLeadsData
                    .slice(-7)
                    .reduce((sum, day) => sum + day.total, 0)}{" "}
                  leads na semana
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {dailyLeadsData[dailyLeadsData.length - 1]?.total || 0}
                </div>
                <div className="text-sm text-muted-foreground">Hoje</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {(dailyLeadsData[dailyLeadsData.length - 1]?.total || 0) >
                  (dailyLeadsData[dailyLeadsData.length - 2]?.total || 0)
                    ? "📈"
                    : "📉"}{" "}
                  vs ontem (
                  {dailyLeadsData[dailyLeadsData.length - 2]?.total || 0})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="sources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sources">Fontes & Origens</TabsTrigger>
            <TabsTrigger value="devices">Dispositivos</TabsTrigger>
            <TabsTrigger value="behavior">Comportamento</TabsTrigger>
            <TabsTrigger value="regions">Regiões</TabsTrigger>
            <TabsTrigger value="sites">Sites</TabsTrigger>
          </TabsList>

          {/* Sources & Origins Tab */}
          <TabsContent value="sources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Fontes de Tráfego</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAnalytics.leadSources.map((source) => (
                    <div key={source.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {source.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {source.count}
                          </span>
                          <Badge variant="secondary">{source.value}%</Badge>
                        </div>
                      </div>
                      <Progress value={source.value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Lead Origins */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MousePointer className="w-5 h-5" />
                    <span>Origens dos Formulários</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAnalytics.leadOrigins.map((origin) => (
                    <div key={origin.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {origin.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {origin.count}
                          </span>
                          <Badge variant="secondary">{origin.value}%</Badge>
                        </div>
                      </div>
                      <Progress value={origin.value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Store Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Tipos de Loja</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {mockAnalytics.storeTypes.map((type) => (
                    <div
                      key={type.name}
                      className="text-center p-4 border rounded-lg"
                    >
                      <div className="text-2xl font-bold text-primary mb-2">
                        {type.count}
                      </div>
                      <div className="text-sm font-medium mb-1">
                        {type.name}
                      </div>
                      <Badge variant="outline">{type.value}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5" />
                    <span>Tipos de Dispositivo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAnalytics.deviceTypes.map((device) => (
                    <div key={device.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {device.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {device.count}
                          </span>
                          <Badge variant="secondary">{device.value}%</Badge>
                        </div>
                      </div>
                      <Progress value={device.value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Platforms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="w-5 h-5" />
                    <span>Plataformas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAnalytics.platforms.map((platform) => (
                    <div key={platform.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {platform.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {platform.count}
                          </span>
                          <Badge variant="secondary">{platform.value}%</Badge>
                        </div>
                      </div>
                      <Progress value={platform.value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Connection Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wifi className="w-5 h-5" />
                  <span>Tipos de Conexão</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mockAnalytics.connectionTypes.map((connection) => (
                    <div
                      key={connection.name}
                      className="text-center p-3 border rounded-lg"
                    >
                      <div className="text-xl font-bold text-primary mb-1">
                        {connection.count}
                      </div>
                      <div className="text-sm font-medium mb-1">
                        {connection.name}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {connection.value}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Session Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Métricas de Sessão</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {formatTime(mockAnalytics.timeMetrics.avgTimeOnSite)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tempo Médio
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {mockAnalytics.timeMetrics.avgPageViews}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Páginas/Sessão
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Profundidade de Scroll</span>
                        <span className="text-sm font-medium">
                          {mockAnalytics.timeMetrics.avgScrollDepth}%
                        </span>
                      </div>
                      <Progress
                        value={mockAnalytics.timeMetrics.avgScrollDepth}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Taxa de Rejeição</span>
                        <span className="text-sm font-medium">
                          {mockAnalytics.timeMetrics.bounceRate}%
                        </span>
                      </div>
                      <Progress
                        value={mockAnalytics.timeMetrics.bounceRate}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Insights de Engajamento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Alto Engajamento
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      75% dos visitantes fazem scroll além de 50% da página
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                      Qualidade do Tráfego
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">
                      Taxa de rejeição baixa (24%) indica tráfego qualificado
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                      Formul��rio Hero CTA
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-300">
                      35% dos leads vêm do formulário principal
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Regions Tab */}
          <TabsContent value="regions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Distribuição Geográfica</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.topRegions.map((region, index) => (
                    <div
                      key={region.region}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant="outline"
                          className="w-8 h-8 p-0 flex items-center justify-center"
                        >
                          {index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium">{region.region}</div>
                          <div className="text-sm text-muted-foreground">
                            {region.count} leads
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{region.percentage}%</div>
                        <Progress
                          value={region.percentage}
                          className="h-2 w-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sites Tab */}
          <TabsContent value="sites" className="space-y-6">
            {/* Site Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockSites.map((site) => (
                <Card
                  key={site.url}
                  className={`${selectedSite === site.url ? "ring-2 ring-primary" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {site.name}
                      </CardTitle>
                      <Badge
                        variant={
                          site.status === "active" ? "default" : "secondary"
                        }
                      >
                        {site.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {site.title}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Leads
                        </span>
                        <span className="text-sm font-medium">
                          {site.leads}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Conversão
                        </span>
                        <span className="text-sm font-medium">
                          {site.conversion}%
                        </span>
                      </div>
                      <div className="mt-3">
                        <Progress
                          value={(site.leads / 1000) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {(
                            (site.leads /
                              mockSites.reduce((sum, s) => sum + s.leads, 0)) *
                            100
                          ).toFixed(1)}
                          % do total
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Site Performance Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Performance por Site</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockSites
                    .sort((a, b) => b.leads - a.leads)
                    .map((site, index) => (
                      <div key={site.url} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className="w-6 h-6 p-0 flex items-center justify-center text-xs"
                            >
                              {index + 1}
                            </Badge>
                            <span className="text-sm font-medium">
                              {site.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {site.leads} leads
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {site.conversion}% conv.
                            </div>
                          </div>
                        </div>
                        <Progress
                          value={
                            (site.leads /
                              Math.max(...mockSites.map((s) => s.leads))) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Taxa de Conversão</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockSites
                    .sort((a, b) => b.conversion - a.conversion)
                    .map((site, index) => (
                      <div key={site.url} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className="w-6 h-6 p-0 flex items-center justify-center text-xs"
                            >
                              {index + 1}
                            </Badge>
                            <span className="text-sm font-medium">
                              {site.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {site.conversion}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {site.leads} leads
                            </div>
                          </div>
                        </div>
                        <Progress
                          value={
                            (site.conversion /
                              Math.max(...mockSites.map((s) => s.conversion))) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>

            {/* Site URLs and Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>URLs e Status dos Sites</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Site</th>
                        <th className="text-left py-2">URL</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-right py-2">Leads</th>
                        <th className="text-right py-2">Conversão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockSites.map((site) => (
                        <tr key={site.url} className="border-b">
                          <td className="py-3 font-medium">{site.name}</td>
                          <td className="py-3">
                            <a
                              href={site.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center"
                            >
                              {site.url}
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={
                                site.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {site.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-right font-medium">
                            {site.leads}
                          </td>
                          <td className="py-3 text-right">
                            {site.conversion}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
