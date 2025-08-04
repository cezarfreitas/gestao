# 🚀 Ecko Streetwear Lead Management System - Deploy Guide

Sistema completo de gestão de leads com dashboard analytics e pixel tracking.

## 📋 Pré-requisitos

- Docker 20.10+
- Node.js 18+ (para desenvolvimento)
- MySQL 8.0+ (já configurado)

## 🛠️ Opções de Deploy

### 1. Deploy com Docker (Recomendado)

#### Build e Run Manual
```bash
# Build da imagem
docker build -t ecko-leads-system:latest .

# Run do container
docker run -d \
  --name ecko-leads-app \
  --restart unless-stopped \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e DB_HOST=148.230.78.129 \
  -e DB_PORT=3459 \
  -e DB_USER=leads \
  -e DB_PASSWORD=e35dc30e2cfa66364f67 \
  -e DB_NAME=leads \
  ecko-leads-system:latest
```

#### Com Docker Compose
```bash
# Start do serviço
docker-compose up -d

# Parar o serviço
docker-compose down

# Rebuild e restart
docker-compose up --build -d
```

#### Script de Deploy Automatizado
```bash
# Fazer o script executável
chmod +x deploy.sh

# Executar deploy
./deploy.sh production
```

### 2. Deploy com Kubernetes

```bash
# Apply dos manifests
kubectl apply -f k8s-deployment.yml

# Verificar status
kubectl get pods -l app=ecko-leads
kubectl get svc ecko-leads-service
kubectl get ingress ecko-leads-ingress

# Logs
kubectl logs -l app=ecko-leads -f

# Remover deployment
kubectl delete -f k8s-deployment.yml
```

### 3. Deploy Manual (Node.js)

```bash
# Instalar dependências
npm ci --only=production

# Build da aplicação
npm run build

# Iniciar em produção
npm run start:prod
```

## 🌐 Configuração de Domínio

**Domínio de Produção:** `ntk.idenegociosdigitais.com.br`

### Configuração DNS
Aponte o domínio para o servidor onde a aplicação está rodando:
```
ntk.idenegociosdigitais.com.br -> IP_DO_SERVIDOR:8080
```

### SSL/HTTPS
- Configure SSL/TLS no proxy reverso (Nginx/Apache)
- Use Let's Encrypt para certificados gratuitos
- Ou configure o Ingress Controller no Kubernetes

## 📊 Banco de Dados

### Configuração Atual
- **Host:** 148.230.78.129:3459
- **Database:** leads
- **User:** leads
- **Tabelas:** Criadas automaticamente na inicialização

### Inicialização Manual do Banco
```bash
# Entrar no container
docker exec -it ecko-leads-app bash

# Executar inicialização
cd server
npx tsx scripts/setup-database.ts init
npx tsx scripts/setup-database.ts seed
```

## 🔍 Monitoramento

### Health Check
```bash
# Verificar API
curl http://localhost:8080/api/ping

# Verificar status do container
docker ps | grep ecko-leads
docker logs ecko-leads-app
```

### Endpoints Importantes
- **Health Check:** `/api/ping`
- **Leads API:** `/api/leads`
- **Pixel Tracking:** `/api/pixel/track`
- **Dashboard:** `/`
- **Analytics:** `/dashboards`
- **Pixel Management:** `/pixel`

## 🔧 Variáveis de Ambiente

### Produção
```env
NODE_ENV=production
PORT=8080
DB_HOST=148.230.78.129
DB_PORT=3459
DB_USER=leads
DB_PASSWORD=e35dc30e2cfa66364f67
DB_NAME=leads
API_BASE_URL=https://ntk.idenegociosdigitais.com.br
```

### Desenvolvimento
```env
NODE_ENV=development
PORT=8080
DB_HOST=148.230.78.129
DB_PORT=3459
DB_USER=leads
DB_PASSWORD=e35dc30e2cfa66364f67
DB_NAME=leads
API_BASE_URL=http://localhost:8080
```

## 📈 Performance

### Recursos Recomendados
- **CPU:** 1-2 cores
- **RAM:** 512MB - 1GB
- **Storage:** 5GB
- **Network:** 1Gbps

### Otimizações
- Container multi-stage build
- Dependências de produção apenas
- Health checks configurados
- Restart automático
- Logs estruturados

## 🛡️ Segurança

### Configurações Aplicadas
- Container não-root user
- Health checks
- Rate limiting (configurável)
- CORS configurado
- HTTPS recomendado

### Recomendações Adicionais
- Firewall configurado
- SSL/TLS certificates
- Backup do banco de dados
- Monitoring e alertas

## 🚨 Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker logs ecko-leads-app

# Verificar se a porta está em uso
netstat -tlnp | grep :8080

# Restart do container
docker restart ecko-leads-app
```

### Banco de dados não conecta
```bash
# Testar conexão manual
docker exec -it ecko-leads-app npx tsx server/scripts/test-connection.ts

# Verificar variáveis de ambiente
docker exec -it ecko-leads-app env | grep DB_
```

### API não responde
```bash
# Verificar health check
curl -f http://localhost:8080/api/ping

# Verificar logs da aplicação
docker logs -f ecko-leads-app
```

## 📞 Suporte

Para problemas de deploy ou configuração:
1. Verificar logs do container
2. Testar conexão com banco de dados
3. Validar variáveis de ambiente
4. Verificar recursos do servidor

---

## 📝 Comandos Úteis

```bash
# Status completo
docker ps -a | grep ecko-leads
docker logs --tail 50 ecko-leads-app

# Backup do container
docker commit ecko-leads-app ecko-leads-backup:$(date +%Y%m%d)

# Update da aplicação
docker pull ecko-leads-system:latest
docker stop ecko-leads-app
docker rm ecko-leads-app
./deploy.sh production

# Cleanup
docker system prune -f
docker image prune -f
```
