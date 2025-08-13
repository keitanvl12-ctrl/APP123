import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Subcategory {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

const Subcategories: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    isActive: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar subcategorias
  const { data: subcategories = [], isLoading } = useQuery({
    queryKey: ['/api/subcategories'],
    queryFn: async () => {
      const response = await fetch('/api/subcategories');
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      return response.json();
    }
  });

  // Buscar categorias para o formulário
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Criar subcategoria
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('/api/subcategories', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subcategories'] });
      resetForm();
      setIsCreateModalOpen(false);
      toast({
        title: "Sucesso",
        description: "Subcategoria criada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar subcategoria: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Atualizar subcategoria
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return await apiRequest(`/api/subcategories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subcategories'] });
      resetForm();
      setEditingSubcategory(null);
      toast({
        title: "Sucesso",
        description: "Subcategoria atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar subcategoria: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Deletar subcategoria
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/subcategories/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subcategories'] });
      toast({
        title: "Sucesso",
        description: "Subcategoria removida com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao remover subcategoria: " + error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      isActive: true
    });
  };

  const handleEdit = (subcategory: Subcategory) => {
    setFormData({
      name: subcategory.name,
      description: subcategory.description || '',
      categoryId: subcategory.categoryId,
      isActive: subcategory.isActive
    });
    setEditingSubcategory(subcategory);
    setIsCreateModalOpen(true); // Abrir o modal para edição
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.categoryId) {
      toast({
        title: "Erro",
        description: "Nome e categoria são obrigatórios!",
        variant: "destructive",
      });
      return;
    }

    if (editingSubcategory) {
      updateMutation.mutate({ id: editingSubcategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando subcategorias...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FolderOpen className="w-8 h-8 text-opus-blue-dark" />
            Gerenciamento de Subcategorias
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie as subcategorias vinculadas às categorias principais. Subcategorias determinam quais campos customizados aparecem nos formulários.
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            setEditingSubcategory(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingSubcategory(null); }} className="bg-opus-blue-dark hover:bg-opus-blue-dark/90">
              <Plus className="w-4 h-4 mr-2" />
              Nova Subcategoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSubcategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="categoryId">Categoria Principal *</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="name">Nome da Subcategoria *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Bug de Interface, Acesso a Sistemas..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional da subcategoria"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingSubcategory(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-opus-blue-dark hover:bg-opus-blue-dark/90"
                >
                  {editingSubcategory ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Subcategorias */}
      <div className="grid gap-4">
        {subcategories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nenhuma subcategoria encontrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Crie sua primeira subcategoria para organizar melhor os tickets.
              </p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-opus-blue-dark hover:bg-opus-blue-dark/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Subcategoria
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subcategories.map((subcategory: Subcategory) => {
              const categoryName = categories.find((cat: Category) => cat.id === subcategory.categoryId)?.name || 'Categoria não encontrada';
              
              return (
                <Card key={subcategory.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="truncate">{subcategory.name}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(subcategory)}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/50"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(subcategory.id)}
                          className="hover:bg-red-50 dark:hover:bg-red-900/50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Categoria:</span>
                        <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                          {categoryName}
                        </span>
                      </div>
                      
                      {subcategory.description && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-600 dark:text-gray-400">Descrição:</span>
                          <p className="mt-1 text-gray-700 dark:text-gray-300">{subcategory.description}</p>
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          subcategory.isActive 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                            : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                        }`}>
                          {subcategory.isActive ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Informações sobre campos customizados */}
      <Card className="border-l-4 border-l-opus-blue-dark">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            💡 Como funcionam as subcategorias?
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>Departamento</strong> → <strong>Categoria</strong> → <strong>Subcategoria</strong> (estrutura hierárquica)</li>
            <li>• Quando o usuário seleciona uma subcategoria, aparecem os campos customizados específicos</li>
            <li>• Configure os campos customizados na seção "Campos Customizáveis" e vincule às subcategorias</li>
            <li>• Cada subcategoria pode ter seus próprios formulários de perguntas específicas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Subcategories;