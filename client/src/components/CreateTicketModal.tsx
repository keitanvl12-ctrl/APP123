import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload } from "lucide-react";
import { insertTicketSchema } from "@shared/schema";
import type { InsertTicket, User, Department, Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
}

export default function CreateTicketModal({ isOpen, onClose }: CreateTicketModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isOpen,
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
    enabled: isOpen,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories/department", selectedDepartment],
    enabled: isOpen && !!selectedDepartment,
  });

  // Fetch custom fields for selected category
  const { data: customFields = [] } = useQuery<CustomField[]>({
    queryKey: ["/api/custom-fields/category", selectedCategoryId],
    enabled: isOpen && !!selectedCategoryId,
  });

  const form = useForm<InsertTicket>({
    resolver: zodResolver(insertTicketSchema.extend({
      subject: insertTicketSchema.shape.subject.min(1, "Assunto é obrigatório").max(100, "Assunto deve ter menos de 100 caracteres"),
      description: insertTicketSchema.shape.description.min(10, "Descrição deve ter pelo menos 10 caracteres"),
    })),
    defaultValues: {
      subject: "",
      description: "",
      priority: "medium",
      category: "",
      responsibleDepartmentId: "",
      requesterDepartmentId: "",
      assignedTo: null,
    },
  });

  // Debug logging
  console.log("Debug - Selected category ID:", selectedCategoryId);
  console.log("Debug - Custom fields:", customFields);
  console.log("Debug - Query enabled:", isOpen && !!selectedCategoryId);

  // Reset category when department changes
  useEffect(() => {
    if (selectedDepartment) {
      form.setValue("category", "");
      setSelectedCategoryId("");
    }
  }, [selectedDepartment, form]);

  // Simular usuário logado (pegar usuário admin com departamento)
  const currentUser = users?.find(u => u.role === 'admin') || users?.[0];

  const createTicketMutation = useMutation({
    mutationFn: async (data: InsertTicket) => {
      // In a real app, createdBy would come from authenticated user
      if (!currentUser) {
        throw new Error("Usuário não encontrado");
      }

      const ticketData = { 
        ...data, 
        createdBy: currentUser.id,
        requesterDepartmentId: currentUser.departmentId || null,
      };
      const response = await apiRequest("/api/tickets", "POST", ticketData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Ticket criado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      form.reset();
      setSelectedFiles([]);
      setSelectedDepartment("");
      setSelectedCategoryId("");
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar ticket",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    form.reset();
    setSelectedFiles([]);
    setSelectedDepartment("");
    setSelectedCategoryId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Novo Ticket
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Preencha os campos abaixo para criar seu ticket
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createTicketMutation.mutate(data))} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Assunto */}
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assunto *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite o assunto do ticket" 
                        className="focus:ring-primary focus:border-primary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Linha com Nome e E-mail */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    placeholder="Digite seu nome completo"
                    className="focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    className="focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Digite seu telefone"
                  className="focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Linha com Departamentos */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requesterDepartmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento Solicitante *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedDepartment(value);
                          form.setValue("category", ""); // Reset category when department changes
                          setSelectedCategoryId("");
                        }} 
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="focus:ring-primary focus:border-primary">
                            <SelectValue placeholder="Selecione o departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments?.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsibleDepartmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento Responsável *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="focus:ring-primary focus:border-primary">
                            <SelectValue placeholder="Selecione o departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments?.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Categoria */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCategoryId(value);
                      }} 
                      value={field.value || ""}
                      disabled={!selectedDepartment}
                    >
                      <FormControl>
                        <SelectTrigger className="focus:ring-primary focus:border-primary">
                          <SelectValue 
                            placeholder={
                              !selectedDepartment 
                                ? "Selecione um departamento primeiro" 
                                : "Selecione a categoria"
                            } 
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {selectedDepartment && categories?.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Nenhuma categoria disponível para este departamento
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* DEBUG - Sempre mostrar para testar */}
              <div className="mt-4 p-4 border-2 border-red-500 bg-red-50 dark:bg-red-900/20" style={{ backgroundColor: 'red', color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                <h4 className="text-red-700 font-bold" style={{ color: 'white' }}>🚨 DEBUG INFO - TESTE 🚨</h4>
                <p style={{ color: 'white' }}>Selected Department: {selectedDepartment || "NONE"}</p>
                <p style={{ color: 'white' }}>Selected Category ID: {selectedCategoryId || "NONE"}</p>
                <p style={{ color: 'white' }}>Custom Fields Count: {customFields?.length || 0}</p>
                <p style={{ color: 'white', fontSize: '12px' }}>Custom Fields: {JSON.stringify(customFields, null, 2)}</p>
                <p style={{ color: 'yellow', fontWeight: 'bold' }}>Modal está funcionando: SIM</p>
              </div>

              {/* TESTE - Força mostrar campos */}
              <div className="mt-4 p-4 bg-green-100 border-2 border-green-500">
                <h4 className="text-green-700 font-bold">TESTE FORÇADO - Campos de Bug de Sistema:</h4>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Passos para Reproduzir *</Label>
                    <Textarea placeholder="Descreva os passos detalhados para reproduzir o bug" rows={3} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Versão do Sistema *</Label>
                    <Input placeholder="Ex: v2.1.0" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Navegador</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o navegador" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chrome">Chrome</SelectItem>
                        <SelectItem value="firefox">Firefox</SelectItem>
                        <SelectItem value="safari">Safari</SelectItem>
                        <SelectItem value="edge">Edge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Campos Customizados - Aparece quando categoria é selecionada */}
              {selectedCategoryId && customFields && customFields.length > 0 && (
                <div className="mt-4 space-y-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Informações Específicas da Categoria
                  </h4>
                  {customFields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <div key={field.id}>
                        {field.type === 'text' && (
                          <div className="space-y-2">
                            <Label htmlFor={`custom_${field.id}`} className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {field.name}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Input
                              id={`custom_${field.id}`}
                              placeholder={field.placeholder || `Digite ${field.name.toLowerCase()}`}
                              className="w-full focus:ring-primary focus:border-primary"
                            />
                          </div>
                        )}
                        
                        {field.type === 'textarea' && (
                          <div className="space-y-2">
                            <Label htmlFor={`custom_${field.id}`} className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {field.name}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Textarea
                              id={`custom_${field.id}`}
                              placeholder={field.placeholder || `Digite ${field.name.toLowerCase()}`}
                              rows={3}
                              className="w-full focus:ring-primary focus:border-primary"
                            />
                          </div>
                        )}

                        {field.type === 'select' && field.options && (
                          <div className="space-y-2">
                            <Label htmlFor={`custom_${field.id}`} className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {field.name}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Select>
                              <SelectTrigger className="focus:ring-primary focus:border-primary">
                                <SelectValue placeholder={field.placeholder || `Selecione ${field.name.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options.map((option, idx) => (
                                  <SelectItem key={idx} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {/* Prioridade */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="focus:ring-primary focus:border-primary">
                          <SelectValue placeholder="Selecionar prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva detalhadamente o problema ou solicitação..."
                        className="min-h-[100px] focus:ring-primary focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Anexos */}
              <div>
                <Label>Anexos</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                        Clique para selecionar arquivos ou arraste aqui
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG, TXT, XLS, XLSX (máx. 10MB cada)
                    </p>
                  </div>
                </div>

                {/* Lista de arquivos selecionados */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium">Arquivos selecionados:</Label>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={createTicketMutation.isPending}
              >
                {createTicketMutation.isPending ? "Criando..." : "Criar Ticket"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}