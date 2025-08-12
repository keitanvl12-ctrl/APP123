import React, { useState, useRef } from 'react';
import Button from '@/components/Button';
import Icon from '@/components/AppIcon';

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
}

interface DescriptionEditorProps {
  formData: any;
  onFormChange: (field: string, value: any) => void;
  errors: any;
  templates: Template[];
}

export default function DescriptionEditor({
  formData,
  onFormChange,
  errors,
  templates
}: DescriptionEditorProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDescriptionChange = (value: string) => {
    onFormChange('description', value);
  };

  const insertTemplate = (template: Template) => {
    const currentDescription = formData?.description || '';
    const newDescription = currentDescription + (currentDescription ? '\n\n' : '') + template?.content;
    handleDescriptionChange(newDescription);
    setShowTemplates(false);
  };

  const formatText = (format: string) => {
    const textarea = textareaRef?.current;
    if (!textarea) return;

    const start = textarea?.selectionStart;
    const end = textarea?.selectionEnd;
    const selectedText = textarea?.value?.substring(start, end);
    const beforeText = textarea?.value?.substring(0, start);
    const afterText = textarea?.value?.substring(end);

    let formattedText = selectedText;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'list':
        formattedText = selectedText?.split('\n')?.map(line => `• ${line}`)?.join('\n');
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      default:
        break;
    }

    const newValue = beforeText + formattedText + afterText;
    handleDescriptionChange(newValue);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start, start + formattedText?.length);
    }, 0);
  };

  const insertCurrentDateTime = () => {
    const now = new Date();
    const dateTime = now?.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const currentDescription = formData?.description || '';
    const newDescription = currentDescription + (currentDescription ? '\n\n' : '') + `[${dateTime}] `;
    handleDescriptionChange(newDescription);
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${isFullscreen ? 'fixed inset-4 z-50' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-6 p-6 pb-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Icon name="FileText" size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Descrição do Problema
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Descreva detalhadamente o problema ou solicitação
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            iconName="FileTemplate"
            iconPosition="left"
          >
            Templates
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            iconName={isFullscreen ? "Minimize2" : "Maximize2"}
            iconPosition="left"
          />
        </div>
      </div>
      
      <div className="px-6 pb-6">
        {/* Formatting Toolbar */}
        <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-t-lg border border-b-0 border-slate-200 dark:border-slate-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('bold')}
            iconName="Bold"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('italic')}
            iconName="Italic"
          />
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('list')}
            iconName="List"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('code')}
            iconName="Code"
          />
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertCurrentDateTime}
            iconName="Clock"
          />
        </div>

        {/* Templates Dropdown */}
        {showTemplates && (
          <div className="absolute z-10 mt-1 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
            <div className="p-4">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                Templates Disponíveis
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {templates?.map((template) => (
                  <button
                    key={template?.id}
                    onClick={() => insertTemplate(template)}
                    className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                      {template?.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {template?.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Text Editor */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={formData?.description || ''}
            onChange={(e) => handleDescriptionChange(e?.target?.value)}
            placeholder="Descreva detalhadamente o problema, incluindo:&#10;• Passos para reproduzir o erro&#10;• Mensagens de erro (se houver)&#10;• Impacto no trabalho&#10;• Tentativas de solução já realizadas"
            className={`w-full border border-t-0 border-slate-200 dark:border-slate-700 rounded-b-lg p-4 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              isFullscreen ? 'h-96' : 'h-48'
            } ${errors?.description ? 'border-red-500' : ''}`}
            required
          />
          
          {/* Character Counter */}
          <div className="absolute bottom-3 right-3 text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded">
            {(formData?.description || '')?.length} caracteres
          </div>
        </div>

        {errors?.description && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            {errors?.description}
          </p>
        )}

        {/* Description Guidelines */}
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
          <div className="flex items-start space-x-3">
            <Icon name="Lightbulb" size={16} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                Dicas para uma boa descrição:
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Seja específico sobre o problema ou necessidade</li>
                <li>• Inclua capturas de tela quando relevante</li>
                <li>• Mencione quando o problema começou</li>
                <li>• Descreva o impacto no seu trabalho</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}