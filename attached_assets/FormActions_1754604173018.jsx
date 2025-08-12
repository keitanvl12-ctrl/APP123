import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FormActions = ({ 
  onSubmit, 
  onSaveDraft, 
  onCancel, 
  isSubmitting, 
  isDraftSaving, 
  formData,
  hasUnsavedChanges 
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSubmit();
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      onCancel();
    }
  };

  const confirmCancel = () => {
    setShowConfirmDialog(false);
    onCancel();
  };

  const getEstimatedSLA = () => {
    if (formData?.customSla) return `${formData?.customSla}h`;
    
    switch (formData?.priority) {
      case 'critical': return '1h';
      case 'high': return '4h';
      case 'medium': return '8h';
      case 'low': return '24h';
      default: return '8h';
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg border border-border p-6 shadow-enterprise">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              <Icon name="Send" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Finalizar Chamado</h2>
              <p className="text-sm text-muted-foreground">Revise as informações e crie o ticket</p>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Resumo do Chamado</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Solicitante:</span>
              <span className="ml-2 text-foreground font-medium">
                {formData?.requesterName || 'Não informado'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Prioridade:</span>
              <span className="ml-2 text-foreground font-medium">
                {formData?.priority ? 
                  ['low', 'medium', 'high', 'critical']?.includes(formData?.priority) ? 
                    { low: 'Baixa', medium: 'Média', high: 'Alta', critical: 'Crítica' }?.[formData?.priority] 
                    : 'Média' :'Média'
                }
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Categoria:</span>
              <span className="ml-2 text-foreground font-medium">
                {formData?.category || 'Não selecionada'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">SLA Estimado:</span>
              <span className="ml-2 text-foreground font-medium">
                {getEstimatedSLA()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Anexos:</span>
              <span className="ml-2 text-foreground font-medium">
                {(formData?.attachments || [])?.length} arquivo(s)
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Mesa:</span>
              <span className="ml-2 text-foreground font-medium">
                {formData?.serviceDesk || 'Atribuição automática'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            variant="default"
            size="lg"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || isDraftSaving}
            iconName="Send"
            iconPosition="left"
            iconSize={18}
            className="flex-1 sm:flex-none"
          >
            {isSubmitting ? 'Criando Chamado...' : 'Criar Chamado'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onSaveDraft}
            loading={isDraftSaving}
            disabled={isSubmitting || isDraftSaving}
            iconName="Save"
            iconPosition="left"
            iconSize={18}
            className="flex-1 sm:flex-none"
          >
            {isDraftSaving ? 'Salvando...' : 'Salvar Rascunho'}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={handleCancel}
            disabled={isSubmitting || isDraftSaving}
            iconName="X"
            iconPosition="left"
            iconSize={18}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
        </div>

        {/* Additional Options */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="ghost"
              size="sm"
              iconName="Copy"
              iconPosition="left"
              iconSize={16}
              className="justify-start"
            >
              Criar Similar
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              iconName="FileTemplate"
              iconPosition="left"
              iconSize={16}
              className="justify-start"
            >
              Salvar como Template
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              iconName="Eye"
              iconPosition="left"
              iconSize={16}
              className="justify-start"
            >
              Visualizar
            </Button>
          </div>
        </div>

        {/* Auto-save Indicator */}
        {hasUnsavedChanges && (
          <div className="mt-4 flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="AlertCircle" size={16} className="text-warning" />
            <span>Alterações não salvas detectadas</span>
          </div>
        )}
      </div>
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4 shadow-enterprise-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-warning/10 rounded-lg">
                <Icon name="AlertTriangle" size={20} className="text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Confirmar Cancelamento</h3>
                <p className="text-sm text-muted-foreground">Você tem alterações não salvas</p>
              </div>
            </div>
            
            <p className="text-sm text-foreground mb-6">
              Tem certeza que deseja cancelar? Todas as informações preenchidas serão perdidas.
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmCancel}
                iconName="Trash2"
                iconPosition="left"
                iconSize={16}
                className="flex-1"
              >
                Sim, Cancelar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1"
              >
                Continuar Editando
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormActions;