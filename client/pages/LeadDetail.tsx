import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Lead } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Globe,
  Smartphone,
  Monitor,
  User,
  Building,
  Calendar,
  MousePointer,
  Wifi,
  ExternalLink
} from "lucide-react";

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

const formatTimeOnSite = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${id}`);
      if (response.ok) {
        const data = await response.json();
        setLead(data);
      }
    } catch (error) {
      console.error("Error fetching lead:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados do lead...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Lead não encontrado</h1>
          <p className="text-muted-foreground mb-4">O lead solicitado não foi encontrado.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">E</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Detalhes do Lead</h1>
                <p className="text-sm text-muted-foreground">Informações completas do prospecto</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Editar
              </Button>
              <Button size="sm">
                Marcar como Contatado
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Lead Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="text-lg">
                        {lead.data.nome.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">{lead.data.nome}</CardTitle>
                      <p className="text-muted-foreground">Lead #{lead.id}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getStatusColor(lead.status || 'new')}>
                      {lead.status || 'new'}
                    </Badge>
                    <Badge className={getPriorityColor(lead.priority || 'medium')}>
                      {lead.priority || 'medium'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{lead.data.whatsapp}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{lead.data.cep}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span>Tipo: {lead.data.tipoLoja}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>CNPJ: {lead.data.cnpj}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lead Source & Origin */}
            <Card>
              <CardHeader>
                <CardTitle>Origem e Fonte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Origem</p>
                    <p className="text-lg">{lead.origin}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fonte</p>
                    <p className="text-lg">{lead.source}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipo de Formulário</p>
                    <p className="text-lg">{lead.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
                    <p className="text-lg">{formatDate(lead.timestamp)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Site Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Site</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome do Site</p>
                    <p className="text-lg">{lead.site.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Título da Página</p>
                    <p className="text-lg">{lead.site.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">URL</p>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={lead.site.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center"
                      >
                        {lead.site.url}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Traffic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Tráfego</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Referenciador</p>
                  <p className="text-sm break-all">{lead.traffic.referrer}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Idioma</p>
                  <p className="text-sm">{lead.traffic.language}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plataforma</p>
                  <p className="text-sm">{lead.traffic.platform}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolução</p>
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{lead.traffic.screenResolution}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Viewport</p>
                  <p className="text-sm">{lead.traffic.viewportSize}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timezone</p>
                  <p className="text-sm">{lead.traffic.timezone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Interaction Data */}
            <Card>
              <CardHeader>
                <CardTitle>Dados de Interação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Session ID</p>
                  <p className="text-sm font-mono">{lead.interaction.sessionId}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tempo no Site</p>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{formatTimeOnSite(lead.interaction.timeOnSite)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Páginas Visualizadas</p>
                  <p className="text-sm">{lead.interaction.pageViews}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profundidade de Scroll</p>
                  <div className="flex items-center space-x-2">
                    <MousePointer className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{lead.interaction.scrollDepth}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dispositivo Touch</p>
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{lead.interaction.touchDevice ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Conexão</p>
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{lead.interaction.connectionType}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Início da Sessão</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{formatDate(lead.interaction.sessionStartTime)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
