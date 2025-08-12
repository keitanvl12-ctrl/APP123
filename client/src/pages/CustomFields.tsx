import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';

interface CustomField {
  id: string;
  name: string;
  type: 'texto' | 'lista' | 'data' | 'checkbox' | 'numero' | 'email' | 'telefone';
  display: boolean;
  visualize: boolean;
  required: boolean;
  defaultValue?: string;
  options?: string[];
  order: number;
}

export default function CustomFields() {
  const [fields, setFields] = useState<CustomField[]>([
    {
      id: '1',
      name: 'Assunto',
      type: 'texto',
      display: true,
      visualize: true,
      required: true,
      defaultValue: '',
      order: 1
    },
    {
      id: '2',
      name: 'Descrição',
      type: 'texto',
      display: true,
      visualize: true,
      required: true,
      defaultValue: '',
      order: 2
    },
    {
      id: '3',
      name: 'Anexo',
      type: 'texto',
      display: true,
      visualize: false,
      required: false,
      defaultValue: '',
      order: 3
    },
    {
      id: '4',
      name: 'Contato',
      type: 'texto',
      display: true,
      visualize: true,
      required: true,
      defaultValue: '',
      order: 4
    },
    {
      id: '5',
      name: 'Contato Email',
      type: 'email',
      display: true,
      visualize: true,
      required: true,
      defaultValue: '',
      order: 5
    },
    {
      id: '6',
      name: 'Contato Telefone',
      type: 'telefone',
      display: true,
      visualize: false,
      required: false,
      defaultValue: '',
      order: 6
    },
    {
      id: '7',
      name: 'Dispositivo',
      type: 'lista',
      display: true,
      visualize: false,
      required: false,
      defaultValue: 'Selecione uma opção',
      options: ['Desktop', 'Laptop', 'Tablet', 'Smartphone'],
      order: 7
    }
  ]);

  const [selectedField, setSelectedField] = useState<CustomField | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'texto': return '📝';
      case 'lista': return '📋';
      case 'data': return '📅';
      case 'checkbox': return '☑️';
      case 'numero': return '🔢';
      case 'email': return '📧';
      case 'telefone': return '📞';
      default: return '📝';
    }
  };

  const getStatusIcon = (enabled: boolean) => {
    return enabled ? '✓' : '○';
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'text-green-600' : 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuração de campos</h1>
          <p className="text-gray-600 mt-1">Configure os campos customizáveis dos formulários</p>
        </div>
        <Button 
          onClick={() => setIsCreateMode(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar campo customizável
        </Button>
      </div>

      {/* Fields Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Campos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Campo</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Disponível</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Visualizar</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Obrigatório</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Default</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {fields
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                  <tr key={field.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        <span className="text-lg">{getFieldTypeIcon(field.type)}</span>
                        <div>
                          <div className="font-medium text-gray-900">{field.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{field.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-sm font-bold ${
                        field.display ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {getStatusIcon(field.display)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-sm font-bold ${
                        field.visualize ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {getStatusIcon(field.visualize)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-sm font-bold ${
                        field.required ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {getStatusIcon(field.required)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {field.defaultValue || '---'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedField(field)}
                          className="w-8 h-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
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

      {/* Field Edit Modal */}
      {(selectedField || isCreateMode) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {isCreateMode ? 'Novo Campo' : 'Editar Campo'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedField(null);
                  setIsCreateMode(false);
                }}
              >
                ×
              </Button>
            </div>

            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Campo</Label>
                <Input
                  id="name"
                  defaultValue={selectedField?.name || ''}
                  placeholder="Digite o nome do campo"
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo do Campo</Label>
                <Select defaultValue={selectedField?.type || 'texto'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="texto">📝 Texto</SelectItem>
                    <SelectItem value="lista">📋 Lista de Seleção</SelectItem>
                    <SelectItem value="data">📅 Data</SelectItem>
                    <SelectItem value="checkbox">☑️ Checkbox</SelectItem>
                    <SelectItem value="numero">🔢 Número</SelectItem>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="telefone">📞 Telefone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="defaultValue">Valor Padrão</Label>
                <Input
                  id="defaultValue"
                  defaultValue={selectedField?.defaultValue || ''}
                  placeholder="Digite o valor padrão (opcional)"
                />
              </div>

              {(selectedField?.type === 'lista' || (!selectedField && isCreateMode)) && (
                <div>
                  <Label htmlFor="options">Opções (para lista de seleção)</Label>
                  <Input
                    id="options"
                    defaultValue={selectedField?.options?.join(', ') || ''}
                    placeholder="Digite as opções separadas por vírgula"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="display"
                    defaultChecked={selectedField?.display !== false}
                  />
                  <Label htmlFor="display">Disponível</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="visualize"
                    defaultChecked={selectedField?.visualize !== false}
                  />
                  <Label htmlFor="visualize">Visualizar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="required"
                    defaultChecked={selectedField?.required === true}
                  />
                  <Label htmlFor="required">Obrigatório</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedField(null);
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