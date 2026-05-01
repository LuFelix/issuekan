# Context Architecture — IssueKan

## 1) Resumo da Arquitetura Atual

## Backend (NestJS)
- **Stack principal:** NestJS 11 + PostgreSQL.
- **ORM identificado:** **TypeORM** (`@nestjs/typeorm` + `typeorm` no `package.json`).
- **Conexão com banco:** configurada em `backend/src/app.module.ts` com `TypeOrmModule.forRootAsync` e `ConfigService`.
  - Variáveis usadas: `DB_TYPE`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`.
  - `entities: [__dirname + '/**/*.entity{.ts,.js}']`.
  - `synchronize: true` (adequado para MVP, revisar para produção).
- **Estrutura de autenticação/autorização:**
  - `backend/src/auth/strategies/jwt.strategy.ts` → JWT Bearer via `passport-jwt` usando `JWT_SECRET`.
  - `backend/src/auth/guards/jwt-auth.guard.ts` → `AuthGuard('jwt')`.
  - `backend/src/auth/guards/roles.guard.ts` → valida roles com metadata + `Reflector`.
  - Decorators:
    - `@Public()` em `decorators/public.decorator.ts`
    - `@Roles(...)` em `decorators/roles.decorator.ts`
  - `AuthController` com endpoints de `login`, `register`, `verify-email`, `google`.
- **Arquitetura de pastas (backend):**
  - `src/auth`, `src/users`, `src/roles`, `src/seeds`, `src/shared`.
  - Organização por domínio/módulo, sem camada “core” formalizada separada.

## Frontend (Angular)
- **Versão Angular:** 20.x (`@angular/core ^20.0.0`, CLI/build 20.x).
- **Paradigma:** **Standalone Components** (não baseado em NgModules como padrão principal).
  - Evidência: `bootstrapApplication(...)` em `src/main.ts` e componentes `standalone: true`.
- **Estrutura de pastas relevante:**
  - `src/app/features`
    - `auth/login/*`, `auth/register/*`
    - `users/pages/*` (dashboard, users, profile)
    - `admin/components/*`
    - `shared/models/*`
  - `src/app/core`
    - `guards` (`auth-guard`, `role-guard`, `permission.guard`)
    - `interceptor/auth-interceptor.ts`
    - `services/auth.service.ts` (JWT + permissões + estado reativo)
- **Bibliotecas de UI já instaladas:**
  - **Angular Material** (`@angular/material`) + **CDK**.
  - Tema prebuilt ativo em `angular.json`: `@angular/material/prebuilt-themes/azure-blue.css`.
  - **Tailwind ainda não instalado**.

---

## 2) Plano de Encaixe Consolidado (Master PRD + Diretrizes Atualizadas)

## 2.1 Backend — Módulo `relay` com TypeORM e segurança de webhooks

### Diretriz confirmada
- **Continuar com TypeORM** (não instalar Prisma).

### Ponto de encaixe
- Criar módulo em `backend/src/relay`.

### Estrutura sugerida
- `backend/src/relay/relay.module.ts`
- `backend/src/relay/controllers/`
  - `trello-webhook.controller.ts` → `POST /webhooks/trello`
  - `github-webhook.controller.ts` → `POST /webhooks/github`
  - (opcional) `ideation.controller.ts` para fluxo NL → Trello
- `backend/src/relay/services/`
  - `relay.service.ts` (orquestração)
  - `trello.service.ts`, `github.service.ts`, `gemini.service.ts`
- `backend/src/relay/entities/`
  - `relay-link.entity.ts` (**mapeamento Trello <-> GitHub**)
  - `relay-log.entity.ts` (telemetria/histórico)
- `backend/src/relay/dto/` e `interfaces/` para payloads de webhook

### Segurança e autenticação dos webhooks
- Rotas de webhook devem ser **públicas para JWT** (não exigir sessão do usuário).
- Aplicar **guardas próprias de assinatura**:
  - GitHub: validar `x-hub-signature-256` com HMAC SHA-256.
  - Trello: validar assinatura/token conforme mecanismo oficial configurado.
- Resultado: endpoint público em termos de JWT, porém autenticado por assinatura criptográfica.

### Integração sem quebrar o que existe
- Registrar `RelayModule` no `AppModule` sem alterar o fluxo atual de `AuthModule`, `UsersModule` e login.

---

## 2.2 Frontend — Tema Dark/Light + Tailwind sem conflito com Material

### Diretriz visual
- Tema base: **Dracula/Dark** (estética terminal/minimalista).
- **Obrigatório** prever tema **Light**.

### Ponto de encaixe do SCSS
- Usar `docs/scss/standard-scss.scss` como base (já com sintaxe corrigida).
- Refatorar variáveis para escopo por atributo:
  - `html[data-theme='dark'] { ...tokens dark... }`
  - `html[data-theme='light'] { ...tokens light... }`
- Manter tokens CSS custom properties para consumo gradual dos componentes.

### Tailwind no Angular
- Instalar e configurar Tailwind no frontend.
- Ajustar `tailwind.config` para coexistência com Angular Material:
  - Avaliar desativar `preflight` (`corePlugins: { preflight: false }`) **ou**
  - adotar `prefix` para utilitários Tailwind em áreas sensíveis.
- Incluir diretivas Tailwind no pipeline global de estilos sem remover Material de imediato.

### Estratégia de adoção gradual (sem quebrar login)
1. Primeira onda: aplicar novo tema no shell autenticado (`/app`) — `MainLayout`, `Header`, `SideNav`, dashboard.
2. Preservar tela de login atual inicialmente (sem regressão visual/funcional).
3. Expandir para login e páginas públicas apenas após validação de estabilidade.

---

## 3) Sequência Recomendada de Execução Técnica (próxima fase)

1. **Frontend foundation**
   - Configurar Tailwind + escopos `data-theme` dark/light.
   - Integrar tokens de tema ao `styles.scss`.
2. **Frontend aplicação incremental**
   - Aplicar no layout autenticado primeiro, mantendo login intacto.
3. **Backend relay foundation**
   - Criar módulo `relay` com entidades TypeORM (`relay-link`, `relay-log`).
4. **Webhook security**
   - Implementar guards de assinatura para GitHub/Trello e rotas públicas de webhook.
5. **Observers PRD**
   - Implementar observer Trello→GitHub e GitHub→Trello com persistência de mapeamento.

---

## 4) Conclusão Arquitetural

O projeto já está com base sólida de autenticação, autorização e infraestrutura para evolução. O encaixe ideal é:
- **Backend:** novo domínio `relay` em TypeORM, com segurança por assinatura nos webhooks.
- **Frontend:** theming por escopo (`data-theme`) + Tailwind configurado para coexistir com Angular Material, iniciando pelo layout autenticado para evitar quebra no fluxo de login.
