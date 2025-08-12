import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const UserCard = ({ user, onEdit, onDelete, onToggleStatus, isSelected, onSelect }) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo': return 'bg-success text-success-foreground';
      case 'Inativo': return 'bg-error text-error-foreground';
      case 'Suspenso': return 'bg-warning text-warning-foreground';
      case 'Pendente': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrador': return 'bg-primary text-primary-foreground';
      case 'Supervisor': return 'bg-accent text-accent-foreground';
      case 'Atendente': return 'bg-secondary text-secondary-foreground';
      case 'Usuário': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div 
      className={`bg-card border border-border rounded-lg p-4 transition-enterprise hover:shadow-enterprise-lg ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-4">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect(user?.id, e?.target?.checked)}
            className="mt-1"
          />
          <div className="relative">
            <Image
              src={user?.avatar}
              alt={user?.nome}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
              user?.status === 'Ativo' ? 'bg-success' : 'bg-error'
            }`}></div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground truncate">{user?.nome}</h3>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.departamento}</p>
            </div>
            
            <div className="flex flex-col items-end space-y-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user?.status)}`}>
                {user?.status}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.funcao)}`}>
                {user?.funcao}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>ID: {user?.id}</span>
              <span>Criado: {user?.dataCriacao}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Calendar" size={12} />
              <span>Último acesso: {user?.ultimoAcesso}</span>
            </div>
          </div>

          {showActions && (
            <div className="mt-3 flex items-center space-x-2">
              <Button
                variant="outline"
                size="xs"
                iconName="Edit"
                iconPosition="left"
                iconSize={12}
                onClick={() => onEdit(user)}
              >
                Editar
              </Button>
              <Button
                variant={user?.status === 'Ativo' ? 'warning' : 'success'}
                size="xs"
                iconName={user?.status === 'Ativo' ? 'UserX' : 'UserCheck'}
                iconPosition="left"
                iconSize={12}
                onClick={() => onToggleStatus(user)}
              >
                {user?.status === 'Ativo' ? 'Suspender' : 'Ativar'}
              </Button>
              <Button
                variant="destructive"
                size="xs"
                iconName="Trash2"
                iconPosition="left"
                iconSize={12}
                onClick={() => onDelete(user)}
              >
                Excluir
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;