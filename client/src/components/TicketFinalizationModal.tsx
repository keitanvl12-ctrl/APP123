import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Ticket, Comment } from '@/../../shared/schema';

interface TicketFinalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  comments?: Comment[];
}

interface FinalizationData {
  resolutionComment: string;
  equipmentRetired: string;
  materialsUsed: string;
}

function TicketFinalizationModal({ isOpen, onClose, ticket, comments }: TicketFinalizationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [finalizationData, setFinalizationData] = useState<FinalizationData>({
    resolutionComment: '',
    equipmentRetired: '',
    materialsUsed: ''
  });

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
      
      // Se ticket tem pausedAt definido (novo sistema de pausa)
      if (ticket.pausedAt && ticket.status === 'on_hold') {
        const pausedAtTime = new Date(ticket.pausedAt).getTime();
        pausedTime = now.getTime() - pausedAtTime;
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
        title: "❌ Campo obrigatório",
        description: "O comentário de resolução é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Usar o endpoint específico de finalização
      const finalizationPayload = {
        status: 'resolved',
        finalizationData: {
          comment: finalizationData.resolutionComment,
          hoursSpent: calculateWorkedHours(),
          equipmentRemoved: finalizationData.equipmentRetired,
          materialsUsed: finalizationData.materialsUsed,
        },
        progress: 100
      };

      console.log('🎯 Enviando dados de finalização:', finalizationPayload);

      const response = await apiRequest(`/api/tickets/${ticket.id}/finalize`, 'PATCH', finalizationPayload);
      
      console.log('✅ Resposta da finalização:', response);

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            Finalizar Ticket {ticket.ticketNumber}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-2">
            Documente a resolução e finalize o atendimento
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Comentário de Resolução */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4 4z" />
              </svg>
              Comentário de Resolução *
            </Label>
            <Textarea
              value={finalizationData.resolutionComment}
              onChange={(e) => setFinalizationData({
                ...finalizationData,
                resolutionComment: e.target.value
              })}
              placeholder="Descreva detalhadamente como o problema foi resolvido, quais passos foram tomados e qual foi o resultado final..."
              className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Tempo Trabalhado */}
          <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900">Tempo trabalhado</p>
                  <p className="text-sm text-gray-600">Calculado automaticamente</p>
                </div>
              </div>
              <span className="text-3xl font-mono font-bold text-blue-700 bg-white px-4 py-2 rounded-lg shadow-sm border">
                {calculateWorkedHours()}
              </span>
            </div>
          </div>

          {/* Equipamentos e Materiais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 border border-orange-200 rounded-xl bg-orange-50">
              <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Equipamentos Retirados
              </Label>
              <Textarea
                value={finalizationData.equipmentRetired}
                onChange={(e) => setFinalizationData({
                  ...finalizationData,
                  equipmentRetired: e.target.value
                })}
                placeholder="Ex: Monitor Dell 24&quot;, Teclado mecânico, Mouse óptico..."
                className="min-h-[100px] resize-none border-orange-200 bg-white focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-3 p-4 border border-purple-200 rounded-xl bg-purple-50">
              <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Materiais Utilizados
              </Label>
              <Textarea
                value={finalizationData.materialsUsed}
                onChange={(e) => setFinalizationData({
                  ...finalizationData,
                  materialsUsed: e.target.value
                })}
                placeholder="Ex: Cabo HDMI 2m, Parafusos M3, Pasta térmica..."
                className="min-h-[100px] resize-none border-purple-200 bg-white focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
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
              className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Finalizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TicketFinalizationModal;