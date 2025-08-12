import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Target, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SLARule {
  id: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeHours: number;
  isActive: boolean;
  createdAt: string;
}

export default function SLAConfiguration() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSLA, setEditingSLA] = useState<SLARule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    timeHours: 24,
    isActive: true
  });

  const [slaType, setSlaType] = useState<'category' | 'department' | 'priority'>('category');

  // Buscar departamentos
  const { data: departments } = useQuery<any[]>({
    queryKey: ['/api/departments'],
  });

  // Buscar categorias
  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  // Buscar regras SLA do banco de dados
  const { data: slaRules, isLoading } = useQuery<any[]>({
    queryKey: ['/api/sla/rules'],
  });

  // Mutation para criar/atualizar SLA
  const saveSLAMutation = useMutation({
    mutationFn: async (data: Partial<SLARule>) => {
      const method = editingSLA ? 'PUT' : 'POST';
      const url = editingSLA ? `/api/sla/rules/${editingSLA.id}` : '/api/sla/rules';
      return apiRequest(url, method, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sla/rules'] });
      resetForm();
      toast({
        title: 'SLA salvo',
        description: 'Regra SLA foi salva com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar regra SLA.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar SLA
  const deleteSLAMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/sla/rules/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sla/rules'] });
      toast({
        title: 'SLA removido',
        description: 'Regra SLA foi removida com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao remover regra SLA.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      departmentId: '',
      category: '',
      priority: 'medium',
      timeHours: 24,
      isActive: true
    });
    setSlaType('category');
    setEditingSLA(null);
    setIsCreateModalOpen(false);
  };

  const handleEdit = (sla: SLARule) => {
    setEditingSLA(sla);
    setFormData({
      name: sla.name,
      departmentId: sla.departmentId || '',
      category: sla.category || '',
      priority: sla.priority,
      timeHours: sla.timeHours || 24,
      isActive: sla.isActive
    });
    
    // Determinar o tipo baseado nos campos preenchidos
    if (sla.departmentId && !sla.category) {
      setSlaType('department');
    } else if (sla.category && !sla.departmentId) {
      setSlaType('category');
    } else {
      setSlaType('priority');
    }
    
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação baseada no tipo de SLA
    if (slaType === 'category' && !formData.category) {
      toast({
        title: "Erro de validação",
        description: "Categoria é obrigatória para SLA por categoria",
        variant: "destructive",
      });
      return;
    }
    
    if (slaType === 'department' && !formData.departmentId) {
      toast({
        title: "Erro de validação", 
        description: "Departamento é obrigatório para SLA por departamento",
        variant: "destructive",
      });
      return;
    }
    
    if (slaType === 'priority' && !formData.priority) {
      toast({
        title: "Erro de validação", 
        description: "Prioridade é obrigatória para SLA por prioridade",
        variant: "destructive",
      });
      return;
    }
    
    // Preparar dados baseado no tipo de SLA
    const submitData = {
      name: formData.name,
      timeHours: formData.timeHours,
      isActive: formData.isActive,
      departmentId: slaType === 'department' ? formData.departmentId : null,
      category: slaType === 'category' ? formData.category : null,
      priority: slaType === 'priority' ? formData.priority : null
    };
    
    saveSLAMutation.mutate(submitData);
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };

    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      critical: 'Crítica',
    };

    return (
      <Badge className={colors[priority as keyof typeof colors]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  const formatTime = (hours: number) => {
    if (hours < 1) return `${hours * 60}min`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  };

  const getSLAType = (sla: SLARule) => {
    if (sla.departmentId && !sla.category) return 'Por Departamento';
    if (sla.category && !sla.departmentId) return 'Por Categoria';
    if (!sla.departmentId && !sla.category) return 'Por Prioridade';
    return 'Indefinido';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuração de SLAs</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure os acordos de nível de serviço por departamento, categoria e prioridade
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Regra SLA
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSLA ? 'Editar Regra SLA' : 'Nova Regra SLA'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Regra</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: SLA TI - Alta Prioridade"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slaType">Tipo de SLA</Label>
                <Select
                  value={slaType}
                  onValueChange={(value: 'category' | 'department' | 'priority') => setSlaType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="category">Por Categoria</SelectItem>
                    <SelectItem value="department">Por Departamento</SelectItem>
                    <SelectItem value="priority">Por Prioridade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {slaType === 'department' && (
                <div>
                  <Label htmlFor="departmentId">Departamento *</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => setFormData({...formData, departmentId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {slaType === 'category' && (
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {slaType === 'priority' && (
                <div>
                  <Label htmlFor="priority">Prioridade *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({...formData, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="timeHours">Tempo SLA (horas)</Label>
                <Input
                  id="timeHours"
                  type="number"
                  step="0.5"
                  min="1"
                  value={formData.timeHours}
                  onChange={(e) => setFormData({...formData, timeHours: parseFloat(e.target.value)})}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveSLAMutation.isPending}>
                  {saveSLAMutation.isPending ? 'Salvando...' : editingSLA ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Regras SLA Configuradas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Carregando regras SLA...</p>
              </div>
            ) : slaRules && slaRules.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Critério</TableHead>
                    <TableHead>Tempo SLA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slaRules.map((sla) => (
                    <TableRow key={sla.id}>
                      <TableCell className="font-medium">{sla.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getSLAType(sla)}</Badge>
                      </TableCell>
                      <TableCell>
                        {sla.departmentId && sla.departmentName && sla.departmentName}
                        {sla.category && sla.category}
                        {!sla.departmentId && !sla.category && getPriorityBadge(sla.priority)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4 text-green-500" />
                          <span>{formatTime(sla.timeHours)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sla.isActive ? 'default' : 'secondary'}>
                          {sla.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => handleEdit(sla)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-red-600 hover:text-red-700"
                            onClick={() => deleteSLAMutation.mutate(sla.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Settings className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Nenhuma regra SLA configurada
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira regra
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}