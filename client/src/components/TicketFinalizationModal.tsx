import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle, Clock, FileText, AlertTriangle, XCircle, AlertCircle
} from 'lucide-react';

interface TicketFinalizationModalProps {
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
  comments?: any[];
  users?: any[];
}

export function TicketFinalizationModal({ 
  ticket, 
  isOpen, 
  onClose, 
  comments = [], 
  users = [] 
}: TicketFinalizationModalProps) {
  const [finalizationData, setFinalizationData] = useState({
    resolutionComment: '',
    equipmentRetired: '',
    materialsUsed: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Função para calcular horas trabalhadas (tempo ativo - tempo pausado)
  const calculateWorkedHours = () => {
    if (!ticket.createdAt) return '0:00';
    
    const createdAt = new Date(ticket.createdAt);
    const now = new Date();
    
    // Calcular tempo total em milissegundos
    let totalActiveTime = now.getTime() - createdAt.getTime();
    
    // Se há comentários, verificar tempos de pausa
    if (comments && comments.length > 0) {
      let pausedTime = 0;
      let pauseStart = null;
      
      // Ordenar comentários por data
      const sortedComments = [...comments].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      for (const comment of sortedComments) {
        const commentTime = new Date(comment.createdAt).getTime();
        
        // Detectar início de pausa
        if (comment.content.includes('PAUSADO') || comment.content.includes('PAUSA')) {
          pauseStart = commentTime;
        }
        
        // Detectar fim de pausa
        if ((comment.content.includes('RETOMADO') || comment.content.includes('REABERTO')) && pauseStart) {
          pausedTime += commentTime - pauseStart;
          pauseStart = null;
        }
      }
      
      // Se ainda está pausado
      if (ticket.status === 'on_hold' && pauseStart) {
        pausedTime += now.getTime() - pauseStart;
      }
      
      totalActiveTime -= pausedTime;
    }
    
    // Converter para horas e minutos
    const hours = Math.floor(totalActiveTime / (1000 * 60 * 60));
    const minutes = Math.floor((totalActiveTime % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleFinalize = async () => {
    if (!finalizationData.resolutionComment.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O comentário de resolução é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Criar comentário detalhado de finalização
      const workedHours = calculateWorkedHours();
      const finalizationComment = `🔧 FINALIZAÇÃO DO TICKET

**Resolução:** ${finalizationData.resolutionComment}

**Tempo Trabalhado:** ${workedHours} (tempo efetivo, excluindo pausas)

${finalizationData.equipmentRetired ? `**Equipamentos Retirados:**
${finalizationData.equipmentRetired}

` : ''}${finalizationData.materialsUsed ? `**Materiais Utilizados:**
${finalizationData.materialsUsed}

` : ''}**Data de Finalização:** ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
**Técnico:** ${users?.find(u => u.id === ticket.assignedTo)?.name || 'Sistema'}`;

      // Adicionar comentário de finalização
      await apiRequest(`/api/tickets/${ticket.id}/comments`, 'POST', {
        content: finalizationComment
      });

      // Atualizar status para resolvido
      await apiRequest(`/api/tickets/${ticket.id}`, 'PATCH', {
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      });

      toast({
        title: "✅ Ticket finalizado!",
        description: "O ticket foi finalizado com sucesso.",
      });

      // Atualizar caches e interface
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets', ticket.id, 'comments'] });

      // Limpar dados e fechar modal
      setFinalizationData({
        resolutionComment: '',
        equipmentRetired: '',
        materialsUsed: ''
      });

      onClose();
      
      // Recarregar página para atualizar dados
      setTimeout(() => window.location.reload(), 500);
      
    } catch (error) {
      console.error('Erro ao finalizar ticket:', error);
      toast({
        title: "❌ Erro ao finalizar",
        description: "Ocorreu um erro ao finalizar o ticket. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-medium">
            Finalizar Ticket {ticket.ticketNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Comentário de Resolução */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Comentário de Resolução *
            </Label>
            <Textarea
              value={finalizationData.resolutionComment}
              onChange={(e) => setFinalizationData({
                ...finalizationData,
                resolutionComment: e.target.value
              })}
              placeholder="Descreva como o problema foi resolvido..."
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          {/* Tempo Trabalhado */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Tempo trabalhado</p>
                <p className="text-xs text-gray-500">Calculado automaticamente</p>
              </div>
              <span className="text-lg font-mono font-semibold">
                {calculateWorkedHours()}
              </span>
            </div>
          </div>

          {/* Equipamentos e Materiais */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Equipamentos Retirados
              </Label>
              <Textarea
                value={finalizationData.equipmentRetired}
                onChange={(e) => setFinalizationData({
                  ...finalizationData,
                  equipmentRetired: e.target.value
                })}
                placeholder="Lista de equipamentos..."
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Materiais Utilizados
              </Label>
              <Textarea
                value={finalizationData.materialsUsed}
                onChange={(e) => setFinalizationData({
                  ...finalizationData,
                  materialsUsed: e.target.value
                })}
                placeholder="Lista de materiais..."
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                setFinalizationData({
                  resolutionComment: '',
                  equipmentRetired: '',
                  materialsUsed: ''
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleFinalize}
              disabled={!finalizationData.resolutionComment.trim()}
            >
              Finalizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TicketFinalizationModal;