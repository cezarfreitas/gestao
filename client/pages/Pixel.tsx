import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  TrendingUp, 
  Code,
  Eye,
  Activity,
  Globe,
  Copy,
  Plus,
  Settings,
  Trash2,
  Edit,
  Download,
  RefreshCw,
  BarChart3,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";

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

// Remove mock data - will fetch from database

const generatePixelCode = (pixelId: string, siteName: string) => {
  return `<!-- Ecko Pixel -->
<script>
(function(){
var p={id:"${pixelId}",site:"${siteName}",v:"1.0"};
function t(e,d){
fetch('/api/pixel/track',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({
pixelId:p.id,site:p.site,eventType:e,
timestamp:new Date().toISOString(),
url:location.href,referrer:document.referrer,
userAgent:navigator.userAgent,...d})
}).catch(console.error);}
t('pageview',{title:document.title,path:location.pathname});
document.addEventListener('submit',function(e){
if(e.target.tagName==='FORM')
t('form_submit',{formId:e.target.id||'unknown'});
});
document.addEventListener('click',function(e){
if(e.target.matches('[data-ecko-track],.btn-cta,.hero-cta,.footer-cta'))
t('cta_click',{element:e.target.tagName,text:e.target.textContent||e.target.value});
});
})();
</script>`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "inactive": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "testing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
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

export default function Pixel() {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null);
  const [newPixel, setNewPixel] = useState({
    name: "",
    description: "",
    site: ""
  });
  const [copied, setCopied] = useState(false);

  // Fetch pixels from database
  const fetchPixels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pixels');
      if (response.ok) {
        const data = await response.json();
        setPixels(data);
      } else {
        console.error('Failed to fetch pixels');
      }
    } catch (error) {
      console.error('Error fetching pixels:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load pixels on component mount
  useEffect(() => {
    fetchPixels();
  }, []);

  const totalHits = pixels.reduce((sum, pixel) => sum + pixel.totalHits, 0);
  const totalVisitors = pixels.reduce((sum, pixel) => sum + pixel.uniqueVisitors, 0);
  const totalConversions = pixels.reduce((sum, pixel) => sum + pixel.conversions, 0);
  const avgConversionRate = pixels.length > 0 ? 
    pixels.reduce((sum, pixel) => sum + pixel.conversionRate, 0) / pixels.length : 0;

  const handleCreatePixel = async () => {
    if (!newPixel.name || !newPixel.site) return;

    try {
      const response = await fetch('/api/pixels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPixel.name,
          description: newPixel.description,
          site: newPixel.site
        })
      });

      if (response.ok) {
        const createdPixel = await response.json();
        setPixels([...pixels, createdPixel]);
        setNewPixel({ name: "", description: "", site: "" });
        setShowCreateDialog(false);
      } else {
        console.error('Failed to create pixel');
      }
    } catch (error) {
      console.error('Error creating pixel:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">E</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Ecko Streetwear</h1>
                  <p className="text-sm text-muted-foreground">Sistema de Gestão de Leads</p>
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
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Análises</span>
                </Link>
                <Link 
                  to="/pixel" 
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <Code className="w-4 h-4" />
                  <span>Pixel</span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Pixel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Pixel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Pixel</Label>
                      <Input
                        id="name"
                        value={newPixel.name}
                        onChange={(e) => setNewPixel({...newPixel, name: e.target.value})}
                        placeholder="Ex: Ecko Homepage - Campanha Black Friday"
                      />
                    </div>
                    <div>
                      <Label htmlFor="site">URL do Site</Label>
                      <Input
                        id="site"
                        value={newPixel.site}
                        onChange={(e) => setNewPixel({...newPixel, site: e.target.value})}
                        placeholder="https://exemplo.com.br"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição (opcional)</Label>
                      <Textarea
                        id="description"
                        value={newPixel.description}
                        onChange={(e) => setNewPixel({...newPixel, description: e.target.value})}
                        placeholder="Descrição do uso deste pixel..."
                      />
                    </div>
                    <Button onClick={handleCreatePixel} className="w-full">
                      Criar Pixel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={fetchPixels} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
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
              <CardTitle className="text-sm font-medium">Total de Hits</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {totalVisitors.toLocaleString()} visitantes únicos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pixels Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pixels.filter(p => p.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                {pixels.length} pixels totais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversões</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConversions}</div>
              <p className="text-xs text-muted-foreground">
                {avgConversionRate.toFixed(2)}% taxa média
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalVisitors > 0 ? ((totalHits / totalVisitors) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Taxa de engajamento
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pixels" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pixels">Meus Pixels</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="documentation">Documentação</TabsTrigger>
          </TabsList>

          {/* Pixels List Tab */}
          <TabsContent value="pixels" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="ml-3 text-muted-foreground">Carregando pixels...</span>
              </div>
            ) : pixels.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Nenhum pixel encontrado</p>
                <p className="text-sm text-muted-foreground">Clique em "Novo Pixel" para criar seu primeiro pixel de tracking</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {pixels.map((pixel) => (
                <Card key={pixel.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <CardTitle className="text-lg">{pixel.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{pixel.description}</p>
                        </div>
                        <Badge className={getStatusColor(pixel.status)}>
                          {pixel.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedPixel(pixel)}
                        >
                          <Code className="w-4 h-4 mr-2" />
                          Ver Código
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Site</p>
                        <div className="flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <a 
                            href={pixel.site} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {new URL(pixel.site).hostname}
                          </a>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Hits</p>
                        <p className="text-sm font-bold">{pixel.totalHits.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Visitantes</p>
                        <p className="text-sm font-bold">{pixel.uniqueVisitors.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Conversões</p>
                        <p className="text-sm font-bold">{pixel.conversions}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Último Hit</p>
                        <p className="text-sm">{formatDate(pixel.lastHit)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance dos Pixels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pixels.map((pixel) => (
                    <div key={pixel.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{pixel.name}</h3>
                        <p className="text-sm text-muted-foreground">{pixel.site}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{pixel.conversionRate.toFixed(2)}%</div>
                        <div className="text-sm text-muted-foreground">
                          {pixel.conversions}/{pixel.uniqueVisitors} conversões
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Como Usar o Pixel Ecko</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">1. Criando um Pixel</h3>
                  <p className="text-muted-foreground">
                    Clique em "Novo Pixel" e preencha as informações do seu site. 
                    O sistema irá gerar automaticamente um código de tracking único.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">2. Instalando o Código</h3>
                  <p className="text-muted-foreground">
                    Copie o código gerado e cole no &lt;head&gt; de todas as p��ginas do seu site 
                    que você deseja rastrear.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">3. Eventos Rastreados</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Visualizações de página automáticas</li>
                    <li>Envios de formulário</li>
                    <li>Cliques em botões CTA (elementos com classes: .btn-cta, .hero-cta, .footer-cta)</li>
                    <li>Elementos com atributo data-ecko-track</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">4. Monitoramento</h3>
                  <p className="text-muted-foreground">
                    Acompanhe o desempenho do seu pixel na aba "Analytics" e veja 
                    dados detalhados de conversões e engajamento.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pixel Code Dialog */}
        {selectedPixel && (
          <Dialog open={!!selectedPixel} onOpenChange={() => setSelectedPixel(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Código do Pixel: {selectedPixel.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Código para Instalação</Label>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-64 border font-mono whitespace-pre-wrap break-all">
                      <code>{generatePixelCode(selectedPixel.code, selectedPixel.site)}</code>
                    </pre>
                    <Button
                      className="absolute top-2 right-2"
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatePixelCode(selectedPixel.code, selectedPixel.site))}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Instruções de Instalação
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Cole este código no &lt;head&gt; de todas as páginas do seu site. 
                    O pixel começará a coletar dados automaticamente após a instalação.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
