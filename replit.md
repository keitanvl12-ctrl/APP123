# Overview

TicketFlow Pro is a comprehensive, full-stack ticket management system developed with React and Node.js. It offers a robust platform for managing support tickets, team members, and performance analytics. Key capabilities include real-time data visualization, efficient ticket workflow, advanced enterprise features like workflow approvals, custom forms, and SLA management. The project aims to provide a professional, branded solution for ticket management, enhancing operational efficiency and customer satisfaction.

# User Preferences

Preferred communication style: Simple, everyday language.
Language: Sistema completo traduzido para português brasileiro (interface, formulários, dados de exemplo).
Design preference: Clean, minimalist interface design - avoid excessive visual elements, colors, and decorative components. Manter o design original do Kanban com cards limpos e organizados, sem alterações visuais drásticas.

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
- **Authentication**: Session-based authentication with PostgreSQL session store, role-based access control (Colaborador, Supervisor, Administrador).
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