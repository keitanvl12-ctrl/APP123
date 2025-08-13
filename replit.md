# Overview

TicketFlow Pro is a comprehensive, full-stack ticket management system developed with React and Node.js. It offers a robust platform for managing support tickets, team members, and performance analytics. Key capabilities include real-time data visualization, efficient ticket workflow, advanced enterprise features like workflow approvals, custom forms, and SLA management. The project aims to provide a professional, branded solution for ticket management, enhancing operational efficiency and customer satisfaction.

# User Preferences

Preferred communication style: Simple, everyday language.
Language: Sistema completo traduzido para português brasileiro (interface, formulários, dados de exemplo).
Design preference: Clean, minimalist interface design - avoid excessive visual elements, colors, and decorative components. Manter o design original do Kanban com cards limpos e organizados, sem alterações visuais drásticas.
Authentication: Real permissions system based on user's actual function/role in database, not simulation/testing mode. System should fetch permissions from database based on authenticated user's role.

# Recent Major Achievement

## Conectividade Frontend-Backend - TOTALMENTE CORRIGIDA ✅
**Data:** 13 de agosto de 2025

A conectividade entre frontend e backend foi completamente restaurada e está operacional:

### Problema Diagnosticado e Resolvido
- **Issue Principal**: Conflitos entre múltiplas implementações do useAuth causando falha no envio de tokens JWT
- **Sintomas**: Login funcionava mas APIs retornavam "No token provided in authorization header"
- **Root Cause**: App.tsx tinha implementação própria de useAuth conflitando com hooks/useAuth.tsx

### Correções Implementadas
✅ **Remoção de código duplicado de autenticação no App.tsx**
✅ **Uso consistente do AuthProvider e useAuth hook centralizado**  
✅ **JWT tokens sendo enviados corretamente nos headers Authorization Bearer**
✅ **Middleware de verificação JWT funcionando perfeitamente**
✅ **Usuários admin com acesso automático a todas permissões**
✅ **APIs retornando dados reais do PostgreSQL (8 tickets, 5 usuários)**

### Testes de Conectividade Confirmados
- Login: ✅ Autenticação bem-sucedida com JWT válido
- API Tickets: ✅ Retornando 8 tickets do banco com SLA calculado
- API Users: ✅ Retornando 5 usuários com roles corretos
- Middleware: ✅ Permissões verificadas e aplicadas corretamente

### Status: Frontend-Backend 100% Conectado e Operacional

## Sistema de Funções e Permissões - TOTALMENTE FUNCIONAL ✅
**Data:** 12 de agosto de 2025

O sistema de funções e permissões está 100% funcional e operacional:

### Sistema de Permissões Completo - 37 Permissões Implementadas
**Usuários (6 permissões):**
- Visualizar, Criar, Editar, Deletar Usuários
- Gerenciar Funções e Departamentos de Usuários

**Tickets (14 permissões):**  
- Criar Tickets, Ver Próprios/Departamento/Todos Tickets
- Editar Próprios/Departamento/Todos Tickets, Deletar Tickets
- Atribuir, Ser Responsável, Alterar Status/Prioridade
- Adicionar Comentários

**Departamentos (5 permissões):**
- Visualizar, Criar, Editar, Deletar, Gerenciar Departamentos

**Relatórios (5 permissões):**
- Ver Básicos/Departamento/Todos, Exportar, Criar Personalizados

**Sistema (6 permissões):**
- Administração, Gerenciar Funções/Configurações/SLA
- Visualizar Logs, Backup/Restauração

### Funcionalidades Implementadas e Testadas
✅ **Botão "Salvar Permissões" 100% funcional**
✅ **Criação dinâmica de funções com interface administrativa**
✅ **Middleware de permissões ativo nos endpoints críticos**
✅ **Controle funcional baseado nas permissões marcadas no formulário**
✅ **Sistema de exclusão de funções customizadas**
✅ **10 permissões salvas e funcionais para Administrador**

### Arquitetura Técnica Final
- Pool PostgreSQL direto para operações CRUD de permissões
- Sistema de "clear + assign" para atualização de permissões
- IDs de permissões com prefixo "perm_" para compatibilidade
- Middleware requirePermission() aplicado nos endpoints principais
- Controle funcional: usuários sem permissão recebem 401 Unauthorized

### Status: Sistema Operacional e Totalmente Funcional
- ✅ Botão "Salvar Permissões" 100% funcional com mapeamento dinâmico
- ✅ Sistema de mapeamento de códigos de permissões automatizado via SQL
- ✅ Endpoints protegidos retornando 401 para usuários sem permissão
- ✅ Interface administrativa completa para gerenciamento de funções
- ✅ Middleware de permissões ativo e testado nos endpoints críticos
- ✅ Formulário de edição começa sempre desmarcado - usuário seleciona permissões desejadas

# System Architecture

## Frontend Architecture
- **Frameworks**: React 18 with TypeScript, Vite for build, Redux Toolkit for global state, TanStack Query for server state.
- **Routing**: Wouter for lightweight client-side routing.
- **UI/UX**: Radix UI primitives with shadcn/ui for consistent design, TailwindCSS for styling and responsiveness.
- **Data Visualization**: Recharts for analytics dashboards.
- **Form Management**: React Hook Form with Zod resolvers.
- **Design Principles**: Mobile-first, responsive design, consistent layout system with sidebar and top bar.
- **Branding**: Integrated Grupo OPUS visual identity with custom color palette and logo.

## Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Database ORM**: Drizzle ORM with PostgreSQL.
- **API Design**: RESTful endpoints with consistent error handling.
- **Authentication**: JWT-based authentication with centralized AuthProvider, role-based access control (admin, supervisor, atendente, solicitante) with granular permission system.
- **Real-time Updates**: WebSocket integration for instant notifications and data synchronization.

## Data Layer
- **Database**: PostgreSQL with Drizzle schema definitions.
- **Schema**: Structured tables for users, tickets, comments, attachments with foreign key relationships.
- **Validation**: Zod schemas for runtime type checking.
- **Migrations**: Drizzle Kit for schema migrations.

## System Design Choices
- **User Hierarchy**: Three-tier system (Colaborador, Supervisor, Administrador) with granular permissions and department-based access control.
- **Workflow Management**: Sequential approval system, dynamic form builder with configurable fields, hierarchical category management with SLA configuration.
- **Reporting & Analytics**: Comprehensive reporting system with real-time filters, including SLA monitoring, aging analysis, daily volume, and performance metrics.
- **Professional Service Order**: Generation of professional PDF service orders with branding, SLA calculations, and complete ticket history.
- **Dashboard Integration**: Clickable dashboard cards for direct navigation to filtered ticket views.
- **Performance**: Optimized data queries and chart rendering.
- **Localization**: Full system translation to Brazilian Portuguese.

# External Dependencies

## Frontend Libraries
- **React Ecosystem**: React 18, React DOM, React Hook Form.
- **State Management**: Redux Toolkit, TanStack React Query.
- **UI Framework**: Radix UI components, shadcn/ui, Lucide React icons.
- **Styling**: TailwindCSS, class-variance-authority, clsx.
- **Charts**: Recharts.
- **Animation**: Framer Motion.

## Backend Dependencies
- **Server**: Express.js.
- **Database**: Drizzle ORM, @neondatabase/serverless (for PostgreSQL).
- **Session Store**: connect-pg-simple (for PostgreSQL session management).
- **Utilities**: date-fns, nanoid.

## Development Tools
- **Build**: Vite.
- **Database**: Drizzle Kit.
- **Code Quality**: TypeScript.
- **Runtime**: tsx.