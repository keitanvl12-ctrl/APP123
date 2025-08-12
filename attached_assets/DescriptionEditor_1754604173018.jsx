import React, { useState, useRef } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DescriptionEditor = ({ 
  formData, 
  onFormChange, 
  errors, 
  templates 
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef(null);

  const handleDescriptionChange = (value) => {
    onFormChange('description', value);
  };

  const insertTemplate = (template) => {
    const currentDescription = formData?.description || '';
    const newDescription = currentDescription + (currentDescription ? '\n\n' : '') + template?.content;
    handleDescriptionChange(newDescription);
    setShowTemplates(false);
  };

  const formatText = (format) => {
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
    <div className={`bg-card rounded-lg border border-border shadow-enterprise ${isFullscreen ? 'fixed inset-4 z-50' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-6 p-6 pb-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-success/10 rounded-lg">
            <Icon name="FileText" size={20} className="text-success" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Descrição do Problema</h2>
            <p className="text-sm text-muted-foreground">Descreva detalhadamente o problema ou solicitação</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            iconName="FileTemplate"
            iconPosition="left"
            iconSize={16}
          >
            Templates
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Icon name={isFullscreen ? "Minimize2" : "Maximize2"} size={16} />
          </Button>
        </div>
      </div>
      <div className="px-6 pb-6">
        {/* Formatting Toolbar */}
        <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-t-lg border border-b-0 border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('bold')}
            iconName="Bold"
            iconSize={16}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('italic')}
            iconName="Italic"
            iconSize={16}
          />
          <div className="w-px h-6 bg-border"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('list')}
            iconName="List"
            iconSize={16}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('code')}
            iconName="Code"
            iconSize={16}
          />
          <div className="w-px h-6 bg-border"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertCurrentDateTime}
            iconName="Clock"
            iconSize={16}
          />
        </div>

        {/* Templates Dropdown */}
        {showTemplates && (
          <div className="absolute z-10 mt-1 w-80 bg-popover border border-border rounded-lg shadow-enterprise-lg">
            <div className="p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Templates Disponíveis</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {templates?.map((template) => (
                  <button
                    key={template?.id}
                    onClick={() => insertTemplate(template)}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-enterprise"
                  >
                    <div className="font-medium text-sm text-foreground">{template?.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{template?.description}</div>
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
            placeholder="Descreva detalhadamente o problema, incluindo:\n• Passos para reproduzir o erro\n• Mensagens de erro (se houver)\n• Impacto no trabalho\n• Tentativas de solução já realizadas"
            className={`w-full border border-t-0 border-border rounded-b-lg p-4 text-sm text-foreground bg-input placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none ${
              isFullscreen ? 'h-96' : 'h-48'
            } ${errors?.description ? 'border-error' : ''}`}
            required
          />
          
          {/* Character Counter */}
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            {(formData?.description || '')?.length} caracteres
          </div>
        </div>

        {errors?.description && (
          <p className="text-sm text-error mt-2">{errors?.description}</p>
        )}

        {/* Description Guidelines */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start space-x-3">
            <Icon name="Lightbulb" size={16} className="text-accent mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Dicas para uma boa descrição:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
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
};

export default DescriptionEditor;