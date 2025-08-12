// Utilitários para verificação de permissões funcionais
import { usePermissions } from '@/hooks/usePermissions';

// Middleware para verificar permissões em rotas
export function requirePermission(permission: string) {
  return (Component: React.ComponentType) => {
    return function ProtectedComponent(props: any) {
      const { hasPermission, isAuthenticated } = usePermissions();
      
      if (!isAuthenticated) {
        return <div className="p-4 text-center">Você precisa estar logado para acessar esta página.</div>;
      }
      
      if (!hasPermission(permission)) {
        return <div className="p-4 text-center text-red-600">Você não tem permissão para acessar esta funcionalidade.</div>;
      }
      
      return <Component {...props} />;
    };
  };
}

// Middleware para verificar múltiplas permissões
export function requireAnyPermission(permissions: string[]) {
  return (Component: React.ComponentType) => {
    return function ProtectedComponent(props: any) {
      const { hasAnyPermission, isAuthenticated } = usePermissions();
      
      if (!isAuthenticated) {
        return <div className="p-4 text-center">Você precisa estar logado para acessar esta página.</div>;
      }
      
      if (!hasAnyPermission(permissions)) {
        return <div className="p-4 text-center text-red-600">Você não tem permissão para acessar esta funcionalidade.</div>;
      }
      
      return <Component {...props} />;
    };
  };
}

// Função para verificar permissão de acesso a tickets
export function canAccessTicket(userRole: string, userId: string, userDepartmentId: string | undefined, ticket: any): boolean {
  const { hasPermission } = usePermissions();
  
  // Admin pode acessar tudo
  if (hasPermission('tickets_view_all')) return true;
  
  // Pode ver tickets do departamento
  if (hasPermission('tickets_view_department') && ticket.requesterDepartmentId === userDepartmentId) return true;
  
  // Pode ver próprios tickets
  if (hasPermission('tickets_view_own') && ticket.createdBy === userId) return true;
  
  return false;
}

// Função para verificar permissão de edição de tickets
export function canEditTicket(userRole: string, userId: string, userDepartmentId: string | undefined, ticket: any): boolean {
  const { hasPermission } = usePermissions();
  
  // Admin pode editar tudo
  if (hasPermission('tickets_edit_all')) return true;
  
  // Pode editar tickets do departamento
  if (hasPermission('tickets_edit_department') && ticket.requesterDepartmentId === userDepartmentId) return true;
  
  // Pode editar próprios tickets
  if (hasPermission('tickets_edit_own') && ticket.createdBy === userId) return true;
  
  return false;
}

// Função para verificar se pode deletar ticket
export function canDeleteTicket(): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission('tickets_delete');
}

// Função para verificar se pode atribuir tickets
export function canAssignTickets(): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission('tickets_assign');
}

// Função para verificar se pode ser atribuído para tickets
export function canBeAssignedToTickets(): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission('tickets_be_assigned');
}

// Função para verificar se pode alterar status de tickets
export function canChangeTicketStatus(): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission('tickets_change_status');
}

// Função para verificar se pode alterar prioridade de tickets
export function canChangeTicketPriority(): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission('tickets_change_priority');
}

export default {
  requirePermission,
  requireAnyPermission,
  canAccessTicket,
  canEditTicket,
  canDeleteTicket,
  canAssignTickets,
  canBeAssignedToTickets,
  canChangeTicketStatus,
  canChangeTicketPriority
};