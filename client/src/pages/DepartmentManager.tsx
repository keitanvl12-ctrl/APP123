import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';

interface Department {
  id: string;
  name: string;
  description?: string;
  isRequester: boolean;
  isResponsible: boolean;
  createdAt: string;
}

interface DepartmentFormData {
  name: string;
  description: string;
  isRequester: boolean;
  isResponsible: boolean;
}

export default function DepartmentManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    description: '',
    isRequester: true,
    isResponsible: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  // Buscar departamentos
  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ['/api/departments']
  });

  // Não usar mutation - fazer request direto no handleSubmit

  // Função para deletar departamento
  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este departamento?')) {
      try {
        const response = await fetch(`/api/departments/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Erro ao deletar departamento');
        
        queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
        alert('Departamento deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar departamento:', error);
        alert('Erro ao deletar departamento. Tente novamente.');
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      isRequester: true, 
      isResponsible: true 
    });
    setEditingDepartment(null);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      isRequester: department.isRequester || true,
      isResponsible: department.isResponsible || true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let response;
      
      if (editingDepartment) {
        // Editando departamento existente
        response = await fetch(`/api/departments/${editingDepartment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Criando novo departamento
        response = await fetch('/api/departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar departamento');
      }
      
      // Aguardar um pouco para garantir que a resposta foi processada
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Recarregar dados e fechar modal
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      setIsModalOpen(false);
      resetForm();
      
      alert(editingDepartment ? 'Departamento atualizado com sucesso!' : 'Departamento criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar departamento:', error);
      alert(`Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            Gerenciar Departamentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure departamentos responsáveis e solicitantes
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-add-department"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Departamento
        </Button>
      </div>

      {/* Seção de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-blue-600 dark:text-blue-400">
              Departamentos Responsáveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Departamentos que <strong>atendem</strong> e resolvem chamados. Aparecem na lista "Departamento Responsável" ao criar ticket.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600 dark:text-green-400">
              Departamentos Solicitantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Usuários destes departamentos podem <strong>criar</strong> chamados. Campo "Departamento Solicitante" é preenchido automaticamente.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Departamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department: Department) => (
          <Card key={department.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            {/* Barra colorida superior no padrão OPUS */}
            <div className="h-1 bg-gradient-to-r from-opus-blue-dark to-opus-blue-light"></div>
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {department.name}
                  </CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    {department.isRequester && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Solicitante
                      </Badge>
                    )}
                    {department.isResponsible && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        Responsável
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(department)}
                    data-testid={`button-edit-${department.id}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(department.id)}
                    data-testid={`button-delete-${department.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {department.description && (
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {department.description}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {departments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Nenhum departamento cadastrado
            </p>
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Departamento
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {editingDepartment ? 'Editar Departamento' : 'Novo Departamento'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Departamento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: Tecnologia da Informação"
                  required
                  data-testid="input-department-name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Descrição opcional do departamento"
                  rows={3}
                  data-testid="input-department-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isRequester}
                      onChange={(e) => setFormData(prev => ({ ...prev, isRequester: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pode Solicitar
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Usuários deste departamento podem criar chamados</p>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isResponsible}
                      onChange={(e) => setFormData(prev => ({ ...prev, isResponsible: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pode Atender
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Departamento pode receber e resolver chamados</p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-save-department"
                >
                  {isSubmitting ? 'Salvando...' : (editingDepartment ? 'Salvar' : 'Criar')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}