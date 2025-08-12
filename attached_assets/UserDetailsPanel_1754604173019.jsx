import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const UserDetailsPanel = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    departamento: user?.departamento || '',
    funcao: user?.funcao || '',
    status: user?.status || 'Ativo',
    avatar: user?.avatar || '',
    assinatura: user?.assinatura || '',
    permissoes: user?.permissoes || []
  });

  const [activeTab, setActiveTab] = useState('perfil');

  const departamentoOptions = [
    { value: 'TI', label: 'Tecnologia da Informação' },
    { value: 'Suporte', label: 'Suporte Técnico' },
    { value: 'Vendas', label: 'Vendas' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'RH', label: 'Recursos Humanos' },
    { value: 'Financeiro', label: 'Financeiro' }
  ];

  const funcaoOptions = [
    { value: 'Administrador', label: 'Administrador' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Atendente', label: 'Atendente' },
    { value: 'Usuário', label: 'Usuário' }
  ];

  const statusOptions = [
    { value: 'Ativo', label: 'Ativo' },
    { value: 'Inativo', label: 'Inativo' },
    { value: 'Suspenso', label: 'Suspenso' },
    { value: 'Pendente', label: 'Pendente' }
  ];

  const permissoesDisponiveis = [
    { id: 'tickets_criar', label: 'Criar Tickets', categoria: 'Tickets' },
    { id: 'tickets_editar', label: 'Editar Tickets', categoria: 'Tickets' },
    { id: 'tickets_excluir', label: 'Excluir Tickets', categoria: 'Tickets' },
    { id: 'tickets_atribuir', label: 'Atribuir Tickets', categoria: 'Tickets' },
    { id: 'usuarios_visualizar', label: 'Visualizar Usuários', categoria: 'Usuários' },
    { id: 'usuarios_criar', label: 'Criar Usuários', categoria: 'Usuários' },
    { id: 'usuarios_editar', label: 'Editar Usuários', categoria: 'Usuários' },
    { id: 'usuarios_excluir', label: 'Excluir Usuários', categoria: 'Usuários' },
    { id: 'relatorios_visualizar', label: 'Visualizar Relatórios', categoria: 'Relatórios' },
    { id: 'relatorios_exportar', label: 'Exportar Relatórios', categoria: 'Relatórios' },
    { id: 'configuracoes_sistema', label: 'Configurações do Sistema', categoria: 'Sistema' },
    { id: 'auditoria_logs', label: 'Logs de Auditoria', categoria: 'Sistema' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissaoChange = (permissaoId, checked) => {
    setFormData(prev => ({
      ...prev,
      permissoes: checked 
        ? [...prev?.permissoes, permissaoId]
        : prev?.permissoes?.filter(p => p !== permissaoId)
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: 'User' },
    { id: 'permissoes', label: 'Permissões', icon: 'Shield' },
    { id: 'atividade', label: 'Atividade', icon: 'Activity' }
  ];

  const categorias = [...new Set(permissoesDisponiveis.map(p => p.categoria))];

  return (
    <div className="bg-card border border-border rounded-lg shadow-enterprise-lg h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          {user ? 'Editar Usuário' : 'Novo Usuário'}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          iconName="X"
          iconSize={16}
        />
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-enterprise ${
              activeTab === tab?.id
                ? 'border-b-2 border-primary text-primary' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab?.icon} size={16} />
            <span>{tab?.label}</span>
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'perfil' && (
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image
                  src={formData?.avatar}
                  alt="Avatar do usuário"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-2 -right-2 w-8 h-8"
                  iconName="Camera"
                  iconSize={14}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Foto do Perfil</h3>
                <p className="text-xs text-muted-foreground">Clique no ícone para alterar</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome Completo"
                type="text"
                value={formData?.nome}
                onChange={(e) => handleInputChange('nome', e?.target?.value)}
                required
              />
              <Input
                label="E-mail"
                type="email"
                value={formData?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                required
              />
              <Input
                label="Telefone"
                type="tel"
                value={formData?.telefone}
                onChange={(e) => handleInputChange('telefone', e?.target?.value)}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={formData?.status}
                onChange={(value) => handleInputChange('status', value)}
              />
            </div>

            {/* Department and Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Departamento"
                options={departamentoOptions}
                value={formData?.departamento}
                onChange={(value) => handleInputChange('departamento', value)}
                searchable
              />
              <Select
                label="Função"
                options={funcaoOptions}
                value={formData?.funcao}
                onChange={(value) => handleInputChange('funcao', value)}
              />
            </div>

            {/* Digital Signature */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Assinatura Digital
              </label>
              <div className="border border-border rounded-lg p-4 bg-muted/50">
                {formData?.assinatura ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon name="FileSignature" size={16} className="text-success" />
                      <span className="text-sm text-foreground">Assinatura configurada</span>
                    </div>
                    <Button variant="outline" size="xs">Alterar</Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Icon name="FileSignature" size={24} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Nenhuma assinatura configurada</p>
                    <Button variant="outline" size="sm">Configurar Assinatura</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'permissoes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Matriz de Permissões</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="xs">Copiar de Usuário</Button>
                <Button variant="outline" size="xs">Aplicar Template</Button>
              </div>
            </div>

            {categorias?.map((categoria) => (
              <div key={categoria} className="space-y-3">
                <h4 className="text-sm font-medium text-foreground border-b border-border pb-2">
                  {categoria}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {permissoesDisponiveis?.filter(p => p?.categoria === categoria)?.map((permissao) => (
                      <Checkbox
                        key={permissao?.id}
                        label={permissao?.label}
                        checked={formData?.permissoes?.includes(permissao?.id)}
                        onChange={(e) => handlePermissaoChange(permissao?.id, e?.target?.checked)}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'atividade' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Histórico de Atividades</h3>
            
            <div className="space-y-3">
              {[
                {
                  acao: 'Login realizado',
                  data: '07/08/2025 18:30',
                  ip: '192.168.1.100',
                  dispositivo: 'Chrome - Windows'
                },
                {
                  acao: 'Ticket #1234 atualizado',
                  data: '07/08/2025 16:45',
                  ip: '192.168.1.100',
                  dispositivo: 'Chrome - Windows'
                },
                {
                  acao: 'Perfil atualizado',
                  data: '06/08/2025 14:20',
                  ip: '192.168.1.100',
                  dispositivo: 'Chrome - Windows'
                }
              ]?.map((atividade, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">{atividade?.acao}</p>
                    <p className="text-xs text-muted-foreground">{atividade?.dispositivo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{atividade?.data}</p>
                    <p className="text-xs text-muted-foreground">{atividade?.ip}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-foreground">Controles de Segurança</h4>
                  <div className="mt-2 space-y-2">
                    <Button variant="outline" size="xs" iconName="Key" iconPosition="left">
                      Forçar Redefinição de Senha
                    </Button>
                    <Button variant="outline" size="xs" iconName="LogOut" iconPosition="left">
                      Encerrar Todas as Sessões
                    </Button>
                    <Button variant="destructive" size="xs" iconName="Lock" iconPosition="left">
                      Bloquear Conta
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-end space-x-2 p-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="default" onClick={handleSave} iconName="Save" iconPosition="left">
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default UserDetailsPanel;