import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CustomField {
  id: string;
  categoryId: string;
  departmentId: string;
  name: string;
  type: 'text' | 'select' | 'textarea' | 'number' | 'email' | 'tel' | 'date';
  required: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  departmentId: string;
  isActive: boolean;
}

interface Department {
  id: string;
  name: string;
  isActive: boolean;
}

export default function CustomFieldsManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [fieldForm, setFieldForm] = useState({
    name: '',
    type: 'text' as 'text' | 'select' | 'textarea' | 'number' | 'email' | 'tel' | 'date',
    required: false,
    placeholder: '',
    options: [] as string[],
    categoryId: '',
    departmentId: '',
    order: 1
  });
  
  const { toast } = useToast();

  // Fetch all custom fields
  const { data: customFields = [], refetch: refetchFields } = useQuery<CustomField[]>({
    queryKey: ["/api/custom-fields"],
  });

  // Fetch all categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch all departments
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  // Create custom field mutation
  const createFieldMutation = useMutation({
    mutationFn: async (fieldData: typeof fieldForm) => {
      const response = await apiRequest("/api/custom-fields", "POST", fieldData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Campo customizado criado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
      resetForm();
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar campo", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Update custom field mutation
  const updateFieldMutation = useMutation({
    mutationFn: async ({ id, ...fieldData }: { id: string } & Partial<CustomField>) => {
      const cleanData = {
        ...fieldData,
        options: fieldData.options && fieldData.options.length > 0 ? fieldData.options : null
      };
      return apiRequest(`/api/custom-fields/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(cleanData)
      });
    },
    onSuccess: () => {
      toast({ title: "Campo customizado atualizado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
      resetForm();
      setIsOpen(false);
      setEditingField(null);
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast({ 
        title: "Erro ao atualizar campo", 
        description: error.message || "Falha ao atualizar",
        variant: "destructive" 
      });
    }
  });

  // Delete custom field mutation
  const deleteFieldMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/custom-fields/${id}`, "DELETE");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Campo customizado excluído!" });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao excluir campo", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const resetForm = () => {
    setFieldForm({
      name: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: [],
      categoryId: '',
      departmentId: '',
      order: 1
    });
  };

  const handleEdit = (field: CustomField) => {
    setEditingField(field);
    setFieldForm({
      name: field.name,
      type: field.type,
      required: field.required,
      placeholder: field.placeholder || '',
      options: field.options || [],
      categoryId: field.categoryId,
      departmentId: field.departmentId,
      order: field.order
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fieldForm.categoryId) {
      toast({ 
        title: "Erro", 
        description: "Por favor, selecione uma categoria",
        variant: "destructive" 
      });
      return;
    }

    if (!fieldForm.departmentId) {
      toast({ 
        title: "Erro", 
        description: "Por favor, selecione um departamento",
        variant: "destructive" 
      });
      return;
    }

    if (editingField) {
      updateFieldMutation.mutate({ id: editingField.id, ...fieldForm });
    } else {
      createFieldMutation.mutate(fieldForm);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...fieldForm.options];
    newOptions[index] = value;
    setFieldForm(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setFieldForm(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const removeOption = (index: number) => {
    const newOptions = fieldForm.options.filter((_, i) => i !== index);
    setFieldForm(prev => ({ ...prev, options: newOptions }));
  };

  // Group fields by department and category
  const fieldsByDepartment = customFields.reduce((acc, field) => {
    const department = departments.find(d => d.id === field.departmentId);
    const category = categories.find(c => c.id === field.categoryId);
    
    const departmentName = department?.name || 'Departamento Desconhecido';
    const categoryName = category?.name || 'Categoria Desconhecida';
    
    if (!acc[departmentName]) acc[departmentName] = {};
    if (!acc[departmentName][categoryName]) acc[departmentName][categoryName] = [];
    
    acc[departmentName][categoryName].push(field);
    return acc;
  }, {} as Record<string, Record<string, CustomField[]>>);

  const filteredFields = selectedCategory && selectedCategory !== "all"
    ? customFields.filter(field => field.categoryId === selectedCategory)
    : customFields;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Campos Customizados</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Configure campos específicos para diferentes categorias de tickets</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingField(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Campo
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingField ? 'Editar Campo Customizado' : 'Criar Campo Customizado'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="department">Departamento *</Label>
                  <Select 
                    value={fieldForm.departmentId} 
                    onValueChange={(value) => setFieldForm(prev => ({ ...prev, departmentId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select 
                    value={fieldForm.categoryId} 
                    onValueChange={(value) => setFieldForm(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="type">Tipo de Campo *</Label>
                  <Select 
                    value={fieldForm.type} 
                    onValueChange={(value: 'text' | 'select' | 'textarea' | 'number' | 'email' | 'tel' | 'date') => setFieldForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="textarea">Área de Texto</SelectItem>
                      <SelectItem value="select">Lista de Opções</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="tel">Telefone</SelectItem>
                      <SelectItem value="date">Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="name">Nome do Campo *</Label>
                <Input
                  id="name"
                  value={fieldForm.name}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Número do Patrimônio"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="placeholder">Texto de Ajuda</Label>
                <Input
                  id="placeholder"
                  value={fieldForm.placeholder}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, placeholder: e.target.value }))}
                  placeholder="Ex: Digite o número do patrimônio do equipamento"
                />
              </div>

              {fieldForm.type === 'select' && (
                <div>
                  <Label>Opções da Lista</Label>
                  <div className="space-y-2">
                    {fieldForm.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Opção ${index + 1}`}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addOption}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Opção
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={fieldForm.required}
                  onCheckedChange={(checked) => setFieldForm(prev => ({ ...prev, required: checked }))}
                />
                <Label htmlFor="required">Campo obrigatório</Label>
              </div>
              
              <div>
                <Label htmlFor="order">Ordem de Exibição</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={fieldForm.order}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createFieldMutation.isPending || updateFieldMutation.isPending}>
                  {editingField ? 'Atualizar' : 'Criar'} Campo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Label>Categoria:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fields List */}
      <div className="space-y-6">
        {Object.entries(fieldsByDepartment).map(([departmentName, departmentCategories]) => (
          <Card key={departmentName} className="border-l-4 border-blue-500">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                {departmentName}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {Object.entries(departmentCategories).map(([categoryName, categoryFields]) => (
                <div key={categoryName} className="border-b last:border-b-0">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">{categoryName}</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {categoryFields.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h5 className="font-medium text-gray-900 dark:text-gray-100">
                              {field.name}
                            </h5>
                            <Badge variant="secondary">{field.type}</Badge>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                          {field.placeholder && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {field.placeholder}
                            </p>
                          )}
                          {field.options && field.options.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {field.options.map((option, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(field)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteFieldMutation.mutate(field.id)}
                            disabled={deleteFieldMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {customFields.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Nenhum campo customizado configurado</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Crie campos específicos para diferentes categorias de tickets para coletar informações mais detalhadas.
              </p>
              <Button onClick={() => setIsOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Campo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}