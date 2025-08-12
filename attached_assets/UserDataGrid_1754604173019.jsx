import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const UserDataGrid = ({ 
  users, 
  selectedUsers, 
  onUserSelect, 
  onSelectAll, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  sortConfig,
  onSort 
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const columns = [
    { key: 'select', label: '', width: '50px', sortable: false },
    { key: 'avatar', label: '', width: '60px', sortable: false },
    { key: 'id', label: 'ID', width: '80px', sortable: true },
    { key: 'nome', label: 'Nome', width: 'auto', sortable: true },
    { key: 'email', label: 'E-mail', width: 'auto', sortable: true },
    { key: 'departamento', label: 'Departamento', width: '150px', sortable: true },
    { key: 'funcao', label: 'Função', width: '120px', sortable: true },
    { key: 'status', label: 'Status', width: '100px', sortable: true },
    { key: 'ultimoAcesso', label: 'Último Acesso', width: '140px', sortable: true },
    { key: 'actions', label: 'Ações', width: '120px', sortable: false }
  ];

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

  const getSortIcon = (columnKey) => {
    if (sortConfig?.key !== columnKey) return 'ArrowUpDown';
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const isAllSelected = users?.length > 0 && selectedUsers?.length === users?.length;
  const isIndeterminate = selectedUsers?.length > 0 && selectedUsers?.length < users?.length;

  return (
    <div className="bg-card border border-border rounded-lg shadow-enterprise overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Users" size={16} />
          <h3 className="text-sm font-semibold text-foreground">
            Lista de Usuários ({users?.length})
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="xs"
            iconName="Download"
            iconPosition="left"
          >
            Exportar
          </Button>
          <Button
            variant="outline"
            size="xs"
            iconName="Upload"
            iconPosition="left"
          >
            Importar CSV
          </Button>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns?.map((column) => (
                <th
                  key={column?.key}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  style={{ width: column?.width }}
                >
                  {column?.key === 'select' ? (
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={(e) => onSelectAll(e?.target?.checked)}
                    />
                  ) : column?.sortable ? (
                    <button
                      onClick={() => onSort(column?.key)}
                      className="flex items-center space-x-1 hover:text-foreground transition-enterprise"
                    >
                      <span>{column?.label}</span>
                      <Icon name={getSortIcon(column?.key)} size={12} />
                    </button>
                  ) : (
                    column?.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((user) => (
              <tr
                key={user?.id}
                className={`transition-enterprise hover:bg-muted/50 ${
                  selectedUsers?.includes(user?.id) ? 'bg-primary/5' : ''
                }`}
                onMouseEnter={() => setHoveredRow(user?.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Select */}
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedUsers?.includes(user?.id)}
                    onChange={(e) => onUserSelect(user?.id, e?.target?.checked)}
                  />
                </td>

                {/* Avatar */}
                <td className="px-4 py-3">
                  <div className="relative">
                    <Image
                      src={user?.avatar}
                      alt={user?.nome}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
                      user?.status === 'Ativo' ? 'bg-success' : 'bg-error'
                    }`}></div>
                  </div>
                </td>

                {/* ID */}
                <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                  #{user?.id}
                </td>

                {/* Nome */}
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">{user?.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      Criado em {user?.dataCriacao}
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground">{user?.email}</div>
                  <div className="text-xs text-muted-foreground">{user?.telefone}</div>
                </td>

                {/* Departamento */}
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Icon name="Building" size={12} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{user?.departamento}</span>
                  </div>
                </td>

                {/* Função */}
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.funcao)}`}>
                    {user?.funcao}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user?.status)}`}>
                    {user?.status}
                  </span>
                </td>

                {/* Último Acesso */}
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground">{user?.ultimoAcesso}</div>
                  <div className="text-xs text-muted-foreground">
                    {user?.sessaoAtiva ? 'Online' : 'Offline'}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className={`flex items-center space-x-1 transition-opacity ${
                    hoveredRow === user?.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                      iconName="Edit"
                      iconSize={14}
                      className="w-8 h-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleStatus(user)}
                      iconName={user?.status === 'Ativo' ? 'UserX' : 'UserCheck'}
                      iconSize={14}
                      className="w-8 h-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(user)}
                      iconName="Trash2"
                      iconSize={14}
                      className="w-8 h-8 text-error hover:text-error"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Empty State */}
      {users?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum usuário encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Não há usuários que correspondam aos filtros aplicados.
          </p>
          <Button variant="outline" iconName="UserPlus" iconPosition="left">
            Adicionar Primeiro Usuário
          </Button>
        </div>
      )}
      {/* Footer */}
      {users?.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/25">
          <div className="text-sm text-muted-foreground">
            {selectedUsers?.length > 0 && (
              <span>{selectedUsers?.length} usuário(s) selecionado(s)</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Mostrando {users?.length} usuários
            </span>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="xs" iconName="ChevronLeft" disabled />
              <Button variant="outline" size="xs">1</Button>
              <Button variant="outline" size="xs" iconName="ChevronRight" disabled />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDataGrid;