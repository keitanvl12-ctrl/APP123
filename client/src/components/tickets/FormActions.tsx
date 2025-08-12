import React from 'react';
import Button from '@/components/Button';
import Icon from '@/components/AppIcon';

interface FormActionsProps {
  onSubmit: () => void;
  onSaveDraft: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isDraftSaving: boolean;
  formData: any;
  hasUnsavedChanges: boolean;
}

export default function FormActions({
  onSubmit,
  onSaveDraft,
  onCancel,
  isSubmitting,
  isDraftSaving,
  formData,
  hasUnsavedChanges
}: FormActionsProps) {
  const getFormCompleteness = () => {
    const requiredFields = [
      'requesterName', 'requesterEmail', 'client', 'unit', 'department',
      'category', 'subject', 'ticketType', 'priority', 'description', 'serviceDesk'
    ];
    
    const filledFields = requiredFields?.filter(field => formData?.[field] && formData?.[field]?.toString()?.trim());
    return {
      filled: filledFields?.length,
      total: requiredFields?.length,
      percentage: Math.round((filledFields?.length / requiredFields?.length) * 100)
    };
  };

  const completeness = getFormCompleteness();
  const canSubmit = completeness?.percentage === 100 && !isSubmitting;
  const canSaveDraft = hasUnsavedChanges && !isDraftSaving && !isSubmitting;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <Icon name="CheckCircle" size={20} className="text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Finalizar Chamado
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Revise as informações e crie o chamado ou salve como rascunho
          </p>
        </div>
      </div>

      {/* Form Completeness Indicator */}
      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Progresso do Formulário
          </h4>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {completeness?.filled}/{completeness?.total} campos obrigatórios
          </span>
        </div>
        
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              completeness?.percentage === 100 
                ? 'bg-green-600' 
                : completeness?.percentage >= 70 
                ? 'bg-blue-600' 
                : completeness?.percentage >= 40 
                ? 'bg-yellow-600' 
                : 'bg-red-600'
            }`}
            style={{ width: `${completeness?.percentage}%` }}
          ></div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
          <Icon 
            name={completeness?.percentage === 100 ? "CheckCircle" : "AlertCircle"} 
            size={16} 
            className={completeness?.percentage === 100 ? "text-green-600" : "text-orange-600"} 
          />
          <span>
            {completeness?.percentage === 100 
              ? "Formulário completo - pronto para envio" 
              : `${completeness?.percentage}% preenchido - ${completeness?.total - completeness?.filled} campos restantes`
            }
          </span>
        </div>
      </div>

      {/* Quick Validation Summary */}
      {completeness?.percentage < 100 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <Icon name="AlertTriangle" size={16} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                Campos Obrigatórios Pendentes:
              </h4>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                {!formData?.requesterName && <div>• Nome do solicitante</div>}
                {!formData?.requesterEmail && <div>• E-mail do solicitante</div>}
                {!formData?.client && <div>• Cliente</div>}
                {!formData?.unit && <div>• Unidade</div>}
                {!formData?.department && <div>• Departamento</div>}
                {!formData?.category && <div>• Categoria</div>}
                {!formData?.subject && <div>• Assunto</div>}
                {!formData?.ticketType && <div>• Tipo do chamado</div>}
                {!formData?.priority && <div>• Prioridade</div>}
                {!formData?.description?.trim() && <div>• Descrição do problema</div>}
                {!formData?.serviceDesk && <div>• Mesa de atendimento</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <Icon name="AlertCircle" size={16} className="text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Alterações não salvas
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Você tem alterações pendentes. Salve como rascunho para não perder o progresso.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Primary Actions */}
        <div className="flex-1 flex gap-3">
          <Button
            onClick={onSubmit}
            disabled={!canSubmit}
            size="lg"
            className={`flex-1 ${canSubmit ? '' : 'opacity-50 cursor-not-allowed'}`}
            iconName={isSubmitting ? "Loader2" : "Send"}
            iconPosition="left"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">
                  <Icon name="Loader2" size={16} />
                </span>
                Criando Chamado...
              </>
            ) : (
              'Criar Chamado'
            )}
          </Button>

          <Button
            onClick={onSaveDraft}
            disabled={!canSaveDraft}
            variant="secondary"
            size="lg"
            className={`flex-1 ${canSaveDraft ? '' : 'opacity-50 cursor-not-allowed'}`}
            iconName={isDraftSaving ? "Loader2" : "Save"}
            iconPosition="left"
          >
            {isDraftSaving ? (
              <>
                <span className="animate-spin">
                  <Icon name="Loader2" size={16} />
                </span>
                Salvando...
              </>
            ) : (
              'Salvar Rascunho'
            )}
          </Button>
        </div>

        {/* Cancel Button */}
        <Button
          onClick={onCancel}
          variant="ghost"
          size="lg"
          disabled={isSubmitting || isDraftSaving}
          iconName="X"
          iconPosition="left"
          className="sm:w-auto"
        >
          Cancelar
        </Button>
      </div>

      {/* Additional Information */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={14} />
            <span>
              {formData?.autoAssign 
                ? 'Será atribuído automaticamente' 
                : formData?.assignedOperator 
                ? 'Atribuído a operador específico' 
                : 'Aguardará distribuição manual'
              }
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Icon name={formData?.emailNotification !== false ? "Mail" : "MailX"} size={14} />
            <span>
              {formData?.emailNotification !== false 
                ? 'E-mail será enviado ao solicitante' 
                : 'Sem notificação por e-mail'
              }
            </span>
          </div>
        </div>
        
        {formData?.attachments?.length > 0 && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            <Icon name="Paperclip" size={14} />
            <span>
              {formData?.attachments?.length} arquivo(s) anexado(s)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}