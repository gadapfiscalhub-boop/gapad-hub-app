# Diretrizes de Arquitetura & Especificação Técnica PWA (Headless)
## Migração do Modelo Operacional de Campo para o JHPCS (`C:\JHPCS`)

Este documento consolida a arquitetura, o design system técnico, o fluxo de dados e os padrões de resiliência implementados no **GADAP Field App**, servindo como guia direto de replicação e adaptação no repositório **JHPCS**.

---

## 1. Visão Geral da Arquitetura

O aplicativo opera no modelo **Headless PWA** de alta resiliência para dispositivos móveis em canteiro de obras:
- **Sem Backend Próprio:** Consome diretamente a API central via REST/JSON.
- **Isolamento Multitenant & Obra:** Toda chamada HTTP é enriquecida automaticamente com o token de autenticação e os headers de contexto (`X-Project-ID` e `X-Tenant-ID`).
- **Resiliência Offline-First:** Detecção nativa do estado da rede (`navigator.onLine`), cache local de entidades essenciais (`localStorage` / IndexedDB) e Service Worker com estratégia *Network First with Fallback*.

```
+-------------------------------------------------------------------+
|                        PWA - Cliente Mobile                       |
|                                                                   |
|   +-----------------------+     +-----------------------------+   |
|   |   useNetworkStatus    |     |      useCamera / useGeo     |   |
|   |  (Online/Offline UX)  |     |   (Hardware API Celular)    |   |
|   +-----------+-----------+     +--------------+--------------+   |
|               |                                |                  |
|   +-----------v-----------+     +--------------v--------------+   |
|   |     AppContext        |     |         apiClient           |   |
|   | (Sessão + Obra Ativa) |<--->| (Injeção JWT + X-Project-ID)|   |
|   +-----------------------+     +--------------+--------------+   |
+------------------------------------------------|------------------+
                                                 | HTTPS
                                                 v
                       +----------------------------------+
                       |   API Central (ERP FastAPI)     |
                       |  /api/v1/projects/{id}/...       |
                       +----------------------------------+
```

---

## 2. Design System Técnico (Identidade Visual ERP)

O design adota o padrão estético técnico de dashboard corporativo:

| Elemento | Código HEX | Utilização |
| :--- | :--- | :--- |
| **Fundo Global** | `#060b13` | Cor base do app e de tela inteira (`bg-[#060b13]`) |
| **Superfície Cards** | `#0d1522` | Containers de formulário, cards e cabeçalhos |
| **Linhas / Bordas** | `#19273c` | Divisórias e bordas sutis (`border-[#19273c]`) |
| **Destaque / Ação** | `#10b981` (Emerald) | Botões de submissão, pills de status e ícones |
| **Aviso / Offline** | `#f59e0b` (Amber) | Banners de aviso, dados em cache e pendências |
| **Texto Primário** | `#f1f5f9` / `#ffffff` | Títulos e dados numéricos |
| **Texto Secundário**| `#94a3b8` / `#64748b` | Legendas, instruções e labels de formulário |

---

## 3. Pilares Obrigatórios para Replicação no JHPCS

### 3.1. Cliente HTTP Resiliente (`lib/apiClient.ts`)
O cliente não deve depender de bibliotecas externas pesadas; basta uma abstração em cima de `fetch` que execute 3 passos críticos:

1. **Pre-flight Offline Check:** Verifica se `navigator.onLine === false` antes de tentar abrir socket. Se offline, lança erro tipado `NETWORK_OFFLINE`.
2. **Injeção de Contexto:** Adiciona os cabeçalhos:
   - `Authorization: Bearer <token>`
   - `X-Project-ID: <active_project_id>`
   - `X-Tenant-ID: <tenant_id>`
3. **Tratamento de Exceções de Rede:** Converte `Failed to fetch` em erro amigável que a interface pode capturar para acionar o cache local.

### 3.2. Fluxo Obrigatório de Sessão e Obra Ativa
No canteiro, nenhuma transação é órfã. O fluxo de navegação deve ser estritamente sequencial:
1. **`/login`:** Autentica operador e obtém o token JWT.
2. **`/selecionar-obra`:** Imediatamente após o login, o operador é direcionado para escolher em qual obra/canteiro está trabalhando hoje.
3. **Persistência de Contexto:** O ID da obra é salvo em `localStorage` (`@gadap:active_project_id` ou `@jhpcs:active_project_id`) e injetado no estado global (`AppContext`).
4. **Aplicação Liberada:** As demais páginas (apontamento, medição, orçamentos, materiais) só podem ser acessadas após a validação da obra ativa.

### 3.3. Cache Local de Obras (`localStorage` / IndexedDB)
- Chave de cache recomendada: `@jhpcs:cached_projects`
- Estrutura:
  ```json
  {
    "projects": [
      { "id": "obr-01", "name": "Obra Alpha", "status": "Ativa", "address": "..." }
    ],
    "timestamp": 1793977200000
  }
  ```
- **Comportamento em Falha de Sinal:** Se a chamada para a API falhar ou estiver offline, recupera o cache local instantaneamente e marca os cards com a etiqueta visual `"Dados locais (Offline)"`, permitindo ao operador selecionar a obra mesmo sem 4G/5G.

### 3.4. Navegação por Polegar (Bottom Navigation)
Para uso em smartphone em campo:
- **Menu Inferior Fixo:** `h-16`, posicionado com `pb-[env(safe-area-inset-bottom)]`.
- **4 Módulos Estratégicos:**
  1. *Início* (Visão geral da obra)
  2. *Diário & Fotos* (Avanço físico com câmera)
  3. *Orçamentos / Medições* (Cálculos de campo)
  4. *Ponto Eletrônico* (GPS)
- **Ocultação Automática:** Desabilitado nas rotas `/login` e `/selecionar-obra`.

### 3.5. Acesso a Recursos Nativos do Celular

#### A. Câmera Traseira Direta (Avanço Físico e Diário de Obra)
Evita abrir seletores genéricos ou galeria:
```html
<input
  type="file"
  accept="image/*"
  capture="environment"
  multiple
/>
```

#### B. Geolocalização com Alta Precisão (Ponto e Check-in)
Uso da API nativa com parâmetro de alta precisão:
```javascript
navigator.geolocation.getCurrentPosition(
  (pos) => {
    const { latitude, longitude, accuracy } = pos.coords;
    // Dispara registro com log_method = 'MOBILE_GPS'
  },
  (err) => console.error(err),
  { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
);
```

### 3.6. Manifesto PWA (`public/manifest.json`)
```json
{
  "name": "JHPCS Field App",
  "short_name": "JHPCS Field",
  "start_url": "/login",
  "display": "standalone",
  "background_color": "#060b13",
  "theme_color": "#060b13",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 4. Checklist Rápido de Migração para `C:\JHPCS`

1. **Configuração de Estilo:**
   - Adicionar variáveis `--background: #060b13` e paleta navy/emerald em `globals.css`.
2. **Contexto Central:**
   - Criar `contexts/AppContext.tsx` gerenciando `token`, `user` e `activeProject`.
3. **Camada de Rede:**
   - Copiar e adaptar `lib/apiClient.ts` com a URL base da API do JHPCS.
   - Criar `hooks/useNetworkStatus.ts` e o banner `components/OfflineBanner.tsx`.
4. **Fluxo de Inicialização:**
   - Garantir que `app/page.tsx` faça `redirect("/login")`.
   - Implementar `app/login/page.tsx` com visual técnico.
   - Implementar `app/selecionar-obra/page.tsx` com cache local de resiliência.
5. **Instalação PWA:**
   - Copiar `public/manifest.json`, `public/sw.js` e `components/RegisterSW.tsx`.
   - Adicionar as tags de `viewport` e `themeColor` no `app/layout.tsx`.

