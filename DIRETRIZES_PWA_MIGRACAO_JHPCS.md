# Diretrizes de Arquitetura & Especificação Técnica PWA (Headless)
## Migração do Modelo Operacional de Campo para o JHPCS (`C:\JHPCS`)

Este documento consolida a arquitetura, o design system técnico, o fluxo de dados, os padrões de resiliência e a **inteligência de detecção de dispositivo (Device Detection)** implementados no **GADAP Field App**, servindo como guia direto de replicação e adaptação no repositório **JHPCS**.

---

## 1. Visão Geral da Arquitetura

O aplicativo opera no modelo **Headless PWA** de alta resiliência adaptável ao contexto de uso (campo vs. escritório de obras):
- **Sem Backend Próprio:** Consome diretamente a API central via REST/JSON.
- **Detecção de Dispositivo (Device Detection):** Comportamento responsivo inteligente dependendo se o acesso ocorre via smartphone no canteiro ou notebook no container da engenharia.
- **Isolamento Multitenant & Obra:** Toda chamada HTTP é enriquecida automaticamente com o token de autenticação e os headers de contexto (`X-Project-ID` e `X-Tenant-ID`).
- **Resiliência Offline-First:** Detecção nativa do estado da rede (`navigator.onLine`), cache local de entidades essenciais (`localStorage` / IndexedDB) e Service Worker com estratégia *Network First with Fallback*.

```
+---------------------------------------------------------------------------------+
|                               PWA - Camada Cliente                              |
|                                                                                 |
|   +-----------------------+     +------------------------+     +------------+   |
|   |   useDeviceDetection  |     |    useNetworkStatus    |     | BottomNav  |   |
|   | (Mobile vs. Desktop)  |     |  (Online/Offline UX)   |     | (ThumbUX)  |   |
|   +-----------+-----------+     +-----------+------------+     +-----+------+   |
|               |                             |                        |          |
|      +--------+--------+                    |                        |          |
|      |                 |                    |                        |          |
|   [Mobile]         [Desktop]                |                        |          |
|  Câmera Traseira   Drag & Drop              v                        |          |
|  Direta (<input>)  (Mouse Event)       +----+------------------------+----+     |
|                                        |            AppContext            |     |
|                                        |  (Sessão JWT + Obra Ativa)       |     |
|                                        +-----------------+----------------+     |
+----------------------------------------------------------|----------------------+
                                                           | HTTPS (JSON)
                                                           v
                                         +----------------------------------+
                                         |    API Central (ERP FastAPI)     |
                                         |   /api/v1/projects/{id}/...      |
                                         +----------------------------------+
```

---

## 2. Inteligência de Detecção de Dispositivo (Device Detection)

O PWA adapta a experiência de acordo com o hardware utilizado:

### 2.1. Matriz de Comportamento por Dispositivo

| Cenário | Dispositivo Detectado | Layout / Espaçamento | Mecanismo de Imagens & Evidências |
| :--- | :--- | :--- | :--- |
| **No Canteiro (Sol / Luvas)** | **Mobile** (`useDeviceDetection.isMobile`) | Focado no polegar, botões de toque largo (`h-14`), Bottom Navigation fixa | **Bloqueia Drag-and-Drop**. Força a **câmera traseira nativa** com `capture="environment"`, abrindo a lente na hora sem passar por menus. |
| **No Escritório / Container** | **Desktop / Notebook** (`isDesktop`) | Espaçamento expandido, layout de tabela técnica | **Habilita Drag-and-Drop**. Permite arrastar fotos e notas fiscais com o mouse, com upload direto via clique. |

### 2.2. Implementação do Hook (`hooks/useDeviceDetection.ts`)

```typescript
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  deviceType: DeviceType;
  isMobile: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  supportsCameraCapture: boolean;
  supportsDragAndDrop: boolean;
}

export function useDeviceDetection(): DeviceInfo {
  // Analisa navigator.userAgent, navigator.maxTouchPoints e window.innerWidth
  // Retorna flags booleanas para renderização condicional na UI
}
```

### 2.3. Componente Híbrido (`components/ResponsivePhotoCapture.tsx`)
Renderiza dinamicamente:
- No celular: Botão largo com ícone de câmera `capture="environment"`.
- No computador: Área pontilhada com suporte a `onDrop`, `onDragOver` e `onDragLeave`.

---

## 3. Design System Técnico (Identidade Visual ERP)

O design adota o padrão estético técnico corporativo alinhado ao ERP Principal:

| Elemento | Código HEX | Utilização |
| :--- | :--- | :--- |
| **Fundo Global** | `#060b13` | Cor base do app e de tela inteira (`bg-[#060b13]`) |
| **Superfície Cards** | `#0d1522` | Containers de formulário, cards e cabeçalhos |
| **Linhas / Bordas** | `#19273c` | Divisórias e bordas sutis (`border-[#19273c]`) |
| **Destaque / Ação** | `#10b981` (Emerald) | Botões de submissão, pills de status e ícones |
| **Aviso / Offline / Parcial** | `#f59e0b` (Amber) | Banners de aviso, dados em cache e entregas parciais |
| **Texto Primário** | `#f1f5f9` / `#ffffff` | Títulos e dados numéricos |
| **Texto Secundário**| `#94a3b8` / `#64748b` | Legendas, instruções e labels de formulário |

---

## 4. Pilares de Construção para Replicação no JHPCS

### 4.1. Cliente HTTP Resiliente (`lib/apiClient.ts`)
1. **Pre-flight Offline Check:** Verifica se `navigator.onLine === false` antes de tentar abrir socket. Se offline, lança erro tipado `NETWORK_OFFLINE`.
2. **Injeção de Contexto:** Adiciona os cabeçalhos:
   - `Authorization: Bearer <token>`
   - `X-Project-ID: <active_project_id>`
   - `X-Tenant-ID: <tenant_id>`
3. **Tratamento de Exceções de Rede:** Converte `Failed to fetch` em erro amigável que a interface pode capturar para acionar o cache local.

### 4.2. Fluxo Obrigatório de Sessão e Obra Ativa
No canteiro, nenhuma transação é órfã. O fluxo de navegação deve ser estritamente sequencial:
1. **`/login`:** Autentica operador e obtém o token JWT.
2. **`/selecionar-obra`:** Imediatamente após o login, o operador é direcionado para escolher em qual obra/canteiro está trabalhando hoje.
3. **Persistência de Contexto:** O ID da obra é salvo em `localStorage` (`@gadap:active_project_id` ou `@jhpcs:active_project_id`) e injetado no estado global (`AppContext`).
4. **Aplicação Liberada:** As demais páginas (recebimento, orçamentos, materiais, ponto) só podem ser acessadas após a validação da obra ativa.

### 4.3. Cache Local de Obras (`localStorage` / IndexedDB)
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

### 4.4. Módulos de Canteiro Implementados

1. **Logística & Recebimento de Cargas (`/logistica/pendentes` e `/logistica/conferir/[id]`):**
   - Lista pedidos em trânsito com previsão de chegada.
   - Conferência item a item com input numérico inteligente (`-` e `+`) pré-preenchido.
   - Geração automática do selo âmbar **"Entrega Parcial"** com cálculo de saldo faltante.
   - Upload de duas evidências: 1) Canhoto da NF assinado; 2) Foto da Carga física.
2. **Orçamentos Rápidos de Campo (`/orcamentos/novo`):**
   - Entrada de custo direto com seletor rápido de Markup (10%, 15%, 20%, 30%, 40%) e cálculo em tempo real.
   - Envio para fluxo de aprovação com a engenharia.
3. **Ponto Eletrônico Mobile (`/ponto`):**
   - Coleta de coordenadas GPS de alta precisão (`navigator.geolocation`).
   - Registro transmitido com o parâmetro `log_method: 'MOBILE_GPS'`.
4. **Diário de Obras & RDO (`/diario`):**
   - Registro de condições climáticas, efetivo em campo e fotos de avanço físico.

---

## 5. Checklist Rápido de Migração para `C:\JHPCS`

1. **Configuração de Estilo:**
   - Adicionar variáveis `--background: #060b13` e paleta navy/emerald em `globals.css`.
2. **Contexto Central & Device Detection:**
   - Criar `hooks/useDeviceDetection.ts`.
   - Criar `components/ResponsivePhotoCapture.tsx`.
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
