# [CONTEXTO DO PROJETO: IssueKan — Orquestrador Trello ↔ GitHub Issues com IA]

> **🏛️ PROTOCOLOS GLOBAIS SSOT (Zero-Cópia):** As regras canônicas de Git Flow, Branches, Issues, Checklist Pré-Merge e Segurança de IA estão centralizadas em [`/home/jaspion/projetos/engineering-standards/`](file:///home/jaspion/projetos/engineering-standards/README.md) (`MANUAL-PROTOCOLOS.md`, `MANUAL-ISSUES.md`, `CHECKLIST-PRE-MERGE.md`, `RULES-IA-SECURITY.md`) e em [`/home/jaspion/projetos/AGENTS.md`](file:///home/jaspion/projetos/AGENTS.md).

## 1. Visão Geral
- **Projeto:** IssueKan — Plataforma Kanban e relé inteligente de sincronização bidirecional entre quadros Trello e GitHub Issues com refinamento via Google Gemini API.
- **Stack Tecnológica (Monorepo):**
  - **Backend (`backend/`):** NestJS, TypeORM, PostgreSQL, integração com APIs do Trello, GitHub e Google Gemini.
  - **Frontend (`frontend/`):** Angular (Standalone Components, Angular Material, Kanban UI).
  - **Infraestrutura:** Docker Compose (`docker-compose.yml`).

## 2. Diretrizes de Engenharia Local
- **Padrão Smart vs. Dumb Components (Frontend):** Páginas Smart gerenciam estado e serviços; componentes Dumb recebem `@Input()` / `input()` e emitem `@Output()` / `output()`.
- **Governança Zero-Cópia:** É proibido manter cópias locais de `MANUAL-PROTOCOLOS.md`, `MANUAL-ISSUES.md`, `CHECKLIST-PRE-MERGE.md` ou `RULES-IA-SECURITY.md` neste repositório.
