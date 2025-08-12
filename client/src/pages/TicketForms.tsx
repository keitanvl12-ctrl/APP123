import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, Eye, Settings } from 'lucide-react';

interface TicketForm {
  id: string;
  name: string;
  source: string;
  client: string;
  status: 'active' | 'inactive';
}

export default function TicketForms() {
  const [forms, setForms] = useState<TicketForm[]>([
    {
      id: '1',
      name: 'Formulário Padrão',
      source: 'Portal de Atendimento',
      client: '---',
      status: 'active'
    },
    {
      id: '2',
      name: 'Portal Cliente e Client',
      source: 'Portal Cliente e Client',
      client: '---',
      status: 'active'
    },
    {
      id: '3',
      name: 'Não Conformidade',
      source: 'Script',
      client: 'Sem Cliente',
      status: 'inactive'
    },
    {
      id: '4',
      name: 'Aterrela',
      source: 'Portal Cliente e Client',
      client: 'Aterrela',
      status: 'inactive'
    },
    {
      id: '5',
      name: 'Formulário Telos',
      source: 'Portal Cliente e Client',
      client: 'Telos',
      status: 'inactive'
    },
    {
      id: '6',
      name: 'Formulário Opus',
      source: 'Portal Cliente e Client',
      client: 'Grupo Opus',
      status: 'inactive'
    }
  ]);

  const [selectedForm, setSelectedForm] = useState<TicketForm | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? '✓' : '✗';
  };

  const totalPages = Math.ceil(forms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentForms = forms.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formulário de Abertura de Tickets</h1>
          <p className="text-gray-600 mt-1">Gerencie formulários personalizados para diferentes contextos</p>
        </div>
        <Button 
          onClick={() => setIsCreateMode(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Formulário
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label>Nome</Label>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="padrao">Padrão</SelectItem>
                  <SelectItem value="portal">Portal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Label>Onde</Label>
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="portal">Portal de Atendimento</SelectItem>
                  <SelectItem value="client">Portal Cliente e Client</SelectItem>
                  <SelectItem value="script">Script</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Forms Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Onde</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Cliente</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentForms.map((form) => (
                  <tr key={form.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{form.name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {form.source}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {form.client}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          form.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {getStatusIcon(form.status)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedForm(form)}
                          className="w-8 h-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-50"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Mostrando de {startIndex + 1} à {Math.min(endIndex, forms.length)} de {forms.length} itens
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ‹
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(i + 1)}
              className="w-8"
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            ›
          </Button>
        </div>
      </div>

      {/* Form Edit Modal */}
      {(selectedForm || isCreateMode) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {isCreateMode ? 'Novo Formulário' : 'Editar Formulário'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedForm(null);
                  setIsCreateMode(false);
                }}
              >
                ×
              </Button>
            </div>

            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Formulário</Label>
                <Input
                  id="name"
                  defaultValue={selectedForm?.name || ''}
                  placeholder="Digite o nome do formulário"
                />
              </div>

              <div>
                <Label htmlFor="source">Onde será usado</Label>
                <Select defaultValue={selectedForm?.source || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar local" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Portal de Atendimento">Portal de Atendimento</SelectItem>
                    <SelectItem value="Portal Cliente e Client">Portal Cliente e Client</SelectItem>
                    <SelectItem value="Script">Script</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="client">Cliente</Label>
                <Select defaultValue={selectedForm?.client || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="---">Geral (Todos)</SelectItem>
                    <SelectItem value="Aterrela">Aterrela</SelectItem>
                    <SelectItem value="Telos">Telos</SelectItem>
                    <SelectItem value="Grupo Opus">Grupo Opus</SelectItem>
                    <SelectItem value="Sem Cliente">Sem Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  defaultChecked={selectedForm?.status === 'active'}
                />
                <Label htmlFor="status">Formulário Ativo</Label>
              </div>

              <div className="border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Campos do Formulário
                </Button>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedForm(null);
                    setIsCreateMode(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {isCreateMode ? 'Criar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}