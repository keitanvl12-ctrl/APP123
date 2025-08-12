import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, Save, X, Settings, Palette, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface StatusConfig {
  id: string;
  name: string;
  value: string;
  color: string;
  order: number;
  isActive: boolean;
  isDefault: boolean;
}

interface PriorityConfig {
  id: string;
  name: string;
  value: string;
  color: string;
  slaHours: number;
  order: number;
  isActive: boolean;
  isDefault: boolean;
}

export default function ConfigurationPage() {
  const [statusEditModal, setStatusEditModal] = useState<{ isOpen: boolean; status: StatusConfig | null }>({
    isOpen: false,
    status: null
  });
  const [priorityEditModal, setPriorityEditModal] = useState<{ isOpen: boolean; priority: PriorityConfig | null }>({
    isOpen: false,
    priority: null
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar configurações
  const { data: statusConfigs = [], isLoading: statusLoading } = useQuery<StatusConfig[]>({
    queryKey: ['/api/config/status'],
  });

  const { data: priorityConfigs = [], isLoading: priorityLoading } = useQuery<PriorityConfig[]>({
    queryKey: ['/api/config/priority'],
  });

  // Mutations para status
  const updateStatusMutation = useMutation({
    mutationFn: async (status: StatusConfig) => {
      const response = await fetch(`/api/config/status/${status.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config/status'] });
      setStatusEditModal({ isOpen: false, status: null });
      toast({
        title: 'Status atualizado',
        description: 'Configuração de status salva com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status.',
        variant: 'destructive',
      });
    },
  });

  const createStatusMutation = useMutation({
    mutationFn: async (status: Omit<StatusConfig, 'id'>) => {
      const response = await fetch('/api/config/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status),
      });
      if (!response.ok) throw new Error('Failed to create status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config/status'] });
      setStatusEditModal({ isOpen: false, status: null });
      toast({
        title: 'Status criado',
        description: 'Novo status criado com sucesso.',
      });
    },
  });

  const deleteStatusMutation = useMutation({
    mutationFn: async (statusId: string) => {
      const response = await fetch(`/api/config/status/${statusId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config/status'] });
      toast({
        title: 'Status removido',
        description: 'Status removido com sucesso.',
      });
    },
  });

  // Mutations para prioridades
  const updatePriorityMutation = useMutation({
    mutationFn: async (priority: PriorityConfig) => {
      const response = await fetch(`/api/config/priority/${priority.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priority),
      });
      if (!response.ok) throw new Error('Failed to update priority');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config/priority'] });
      setPriorityEditModal({ isOpen: false, priority: null });
      toast({
        title: 'Prioridade atualizada',
        description: 'Configuração de prioridade salva com sucesso.',
      });
    },
  });

  const createPriorityMutation = useMutation({
    mutationFn: async (priority: Omit<PriorityConfig, 'id'>) => {
      const response = await fetch('/api/config/priority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priority),
      });
      if (!response.ok) throw new Error('Failed to create priority');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config/priority'] });
      setPriorityEditModal({ isOpen: false, priority: null });
      toast({
        title: 'Prioridade criada',
        description: 'Nova prioridade criada com sucesso.',
      });
    },
  });

  const deletePriorityMutation = useMutation({
    mutationFn: async (priorityId: string) => {
      const response = await fetch(`/api/config/priority/${priorityId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete priority');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config/priority'] });
      toast({
        title: 'Prioridade removida',
        description: 'Prioridade removida com sucesso.',
      });
    },
  });

  const getColorPreview = (color: string) => (
    <div
      className="w-6 h-6 rounded-full border border-gray-300"
      style={{ backgroundColor: color }}
    />
  );

  const colorOptions = [
    { value: '#dc2626', label: 'Vermelho', preview: '#dc2626' },
    { value: '#f59e0b', label: 'Laranja', preview: '#f59e0b' },
    { value: '#eab308', label: 'Amarelo', preview: '#eab308' },
    { value: '#10b981', label: 'Verde', preview: '#10b981' },
    { value: '#3b82f6', label: 'Azul', preview: '#3b82f6' },
    { value: '#8b5cf6', label: 'Roxo', preview: '#8b5cf6' },
    { value: '#6b7280', label: 'Cinza', preview: '#6b7280' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Configurações do Sistema
        </h1>
        <p className="text-gray-600 mt-2">
          Gerencie status, prioridades e outras configurações do sistema de tickets.
        </p>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status">Status de Tickets</TabsTrigger>
          <TabsTrigger value="priority">Prioridades</TabsTrigger>
        </TabsList>

        {/* Status Configuration */}
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Configurações de Status
              </CardTitle>
              <Dialog open={statusEditModal.isOpen} onOpenChange={(open) => 
                setStatusEditModal({ isOpen: open, status: open ? statusEditModal.status : null })
              }>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setStatusEditModal({ 
                      isOpen: true, 
                      status: {
                        id: '',
                        name: '',
                        value: '',
                        color: '#3b82f6',
                        order: statusConfigs.length + 1,
                        isActive: true,
                        isDefault: false
                      }
                    })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Status
                  </Button>
                </DialogTrigger>
                <StatusEditModal
                  status={statusEditModal.status}
                  onSave={(status) => {
                    if (status.id) {
                      updateStatusMutation.mutate(status);
                    } else {
                      const { id, ...newStatus } = status;
                      createStatusMutation.mutate(newStatus);
                    }
                  }}
                  colorOptions={colorOptions}
                />
              </Dialog>
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <div>Carregando...</div>
              ) : (
                <div className="space-y-3">
                  {statusConfigs
                    .sort((a, b) => a.order - b.order)
                    .map((status) => (
                    <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getColorPreview(status.color)}
                        <div>
                          <div className="font-medium">{status.name}</div>
                          <div className="text-sm text-gray-500">Valor: {status.value}</div>
                        </div>
                        <div className="flex gap-2">
                          {status.isDefault && (
                            <Badge variant="secondary">Padrão</Badge>
                          )}
                          {!status.isActive && (
                            <Badge variant="outline">Inativo</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStatusEditModal({ isOpen: true, status })}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteStatusMutation.mutate(status.id)}
                          disabled={status.isDefault}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Priority Configuration */}
        <TabsContent value="priority" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Configurações de Prioridade
              </CardTitle>
              <Dialog open={priorityEditModal.isOpen} onOpenChange={(open) => 
                setPriorityEditModal({ isOpen: open, priority: open ? priorityEditModal.priority : null })
              }>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setPriorityEditModal({ 
                      isOpen: true, 
                      priority: {
                        id: '',
                        name: '',
                        value: '',
                        color: '#3b82f6',
                        slaHours: 24,
                        order: priorityConfigs.length + 1,
                        isActive: true,
                        isDefault: false
                      }
                    })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Prioridade
                  </Button>
                </DialogTrigger>
                <PriorityEditModal
                  priority={priorityEditModal.priority}
                  onSave={(priority) => {
                    if (priority.id) {
                      updatePriorityMutation.mutate(priority);
                    } else {
                      const { id, ...newPriority } = priority;
                      createPriorityMutation.mutate(newPriority);
                    }
                  }}
                  colorOptions={colorOptions}
                />
              </Dialog>
            </CardHeader>
            <CardContent>
              {priorityLoading ? (
                <div>Carregando...</div>
              ) : (
                <div className="space-y-3">
                  {priorityConfigs
                    .sort((a, b) => a.order - b.order)
                    .map((priority) => (
                    <div key={priority.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getColorPreview(priority.color)}
                        <div>
                          <div className="font-medium">{priority.name}</div>
                          <div className="text-sm text-gray-500">
                            Valor: {priority.value} • SLA: {priority.slaHours}h
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {priority.isDefault && (
                            <Badge variant="secondary">Padrão</Badge>
                          )}
                          {!priority.isActive && (
                            <Badge variant="outline">Inativo</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPriorityEditModal({ isOpen: true, priority })}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePriorityMutation.mutate(priority.id)}
                          disabled={priority.isDefault}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Modal para edição de status
function StatusEditModal({ 
  status, 
  onSave, 
  colorOptions 
}: { 
  status: StatusConfig | null; 
  onSave: (status: StatusConfig) => void; 
  colorOptions: Array<{ value: string; label: string; preview: string }>;
}) {
  const [editedStatus, setEditedStatus] = useState<StatusConfig | null>(status);

  React.useEffect(() => {
    setEditedStatus(status);
  }, [status]);

  if (!editedStatus) return null;

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>
          {editedStatus.id ? 'Editar Status' : 'Novo Status'}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="statusName">Nome</Label>
          <Input
            id="statusName"
            value={editedStatus.name}
            onChange={(e) => setEditedStatus({ ...editedStatus, name: e.target.value })}
            placeholder="Ex: Em Andamento"
          />
        </div>
        <div>
          <Label htmlFor="statusValue">Valor (identificador)</Label>
          <Input
            id="statusValue"
            value={editedStatus.value}
            onChange={(e) => setEditedStatus({ ...editedStatus, value: e.target.value })}
            placeholder="Ex: in_progress"
          />
        </div>
        <div>
          <Label htmlFor="statusColor">Cor</Label>
          <Select
            value={editedStatus.color}
            onValueChange={(value) => setEditedStatus({ ...editedStatus, color: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {colorOptions.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color.preview }}
                    />
                    {color.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="statusOrder">Ordem</Label>
          <Input
            id="statusOrder"
            type="number"
            value={editedStatus.order}
            onChange={(e) => setEditedStatus({ ...editedStatus, order: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="statusActive"
            checked={editedStatus.isActive}
            onCheckedChange={(checked) => setEditedStatus({ ...editedStatus, isActive: checked })}
          />
          <Label htmlFor="statusActive">Ativo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="statusDefault"
            checked={editedStatus.isDefault}
            onCheckedChange={(checked) => setEditedStatus({ ...editedStatus, isDefault: checked })}
          />
          <Label htmlFor="statusDefault">Padrão</Label>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => onSave(editedStatus)}
            disabled={!editedStatus.name || !editedStatus.value}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

// Modal para edição de prioridade
function PriorityEditModal({ 
  priority, 
  onSave, 
  colorOptions 
}: { 
  priority: PriorityConfig | null; 
  onSave: (priority: PriorityConfig) => void; 
  colorOptions: Array<{ value: string; label: string; preview: string }>;
}) {
  const [editedPriority, setEditedPriority] = useState<PriorityConfig | null>(priority);

  React.useEffect(() => {
    setEditedPriority(priority);
  }, [priority]);

  if (!editedPriority) return null;

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>
          {editedPriority.id ? 'Editar Prioridade' : 'Nova Prioridade'}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="priorityName">Nome</Label>
          <Input
            id="priorityName"
            value={editedPriority.name}
            onChange={(e) => setEditedPriority({ ...editedPriority, name: e.target.value })}
            placeholder="Ex: Alta"
          />
        </div>
        <div>
          <Label htmlFor="priorityValue">Valor (identificador)</Label>
          <Input
            id="priorityValue"
            value={editedPriority.value}
            onChange={(e) => setEditedPriority({ ...editedPriority, value: e.target.value })}
            placeholder="Ex: high"
          />
        </div>
        <div>
          <Label htmlFor="priorityColor">Cor</Label>
          <Select
            value={editedPriority.color}
            onValueChange={(value) => setEditedPriority({ ...editedPriority, color: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {colorOptions.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color.preview }}
                    />
                    {color.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="prioritySla">SLA (horas)</Label>
          <Input
            id="prioritySla"
            type="number"
            value={editedPriority.slaHours}
            onChange={(e) => setEditedPriority({ ...editedPriority, slaHours: parseInt(e.target.value) || 24 })}
          />
        </div>
        <div>
          <Label htmlFor="priorityOrder">Ordem</Label>
          <Input
            id="priorityOrder"
            type="number"
            value={editedPriority.order}
            onChange={(e) => setEditedPriority({ ...editedPriority, order: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="priorityActive"
            checked={editedPriority.isActive}
            onCheckedChange={(checked) => setEditedPriority({ ...editedPriority, isActive: checked })}
          />
          <Label htmlFor="priorityActive">Ativo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="priorityDefault"
            checked={editedPriority.isDefault}
            onCheckedChange={(checked) => setEditedPriority({ ...editedPriority, isDefault: checked })}
          />
          <Label htmlFor="priorityDefault">Padrão</Label>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => onSave(editedPriority)}
            disabled={!editedPriority.name || !editedPriority.value}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}