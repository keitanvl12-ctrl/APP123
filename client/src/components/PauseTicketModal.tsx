import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pause, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PauseTicketModalProps {
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
  onPause: (pauseData: { reason: string; details?: string; estimatedHours?: string }) => void;
}

const PAUSE_REASONS = [
  "Aguardando resposta do cliente",
  "Dependência de terceiros",
  "Aguardando aprovação",
  "Falta de informações",
  "Problemas técnicos",
  "Aguardando recursos",
  "Outros"
];

const PauseTicketModal: React.FC<PauseTicketModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onPause
}) => {
  const [pauseReason, setPauseReason] = useState('');
  const [pauseDetails, setPauseDetails] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pauseReason) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um motivo para pausar o ticket.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onPause({
        reason: pauseReason,
        details: pauseDetails,
        estimatedHours: estimatedHours
      });

      // Reset form
      setPauseReason('');
      setPauseDetails('');
      setEstimatedHours('');
      
      toast({
        title: "Ticket Pausado",
        description: "O ticket foi pausado com sucesso.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível pausar o ticket. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPauseReason('');
    setPauseDetails('');
    setEstimatedHours('');
    onClose();
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" aria-describedby="pause-ticket-description">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <Pause className="w-6 h-6 text-orange-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Pausar Ticket {ticket.ticketNumber}
          </DialogTitle>
          <DialogDescription id="pause-ticket-description" className="text-sm text-gray-600 mt-2">
            {ticket.subject}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                <strong>Importante:</strong> Ao pausar este ticket, o contagem do SLA será interrompida pelo período informado na previsão de retorno.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Motivo da Pausa */}
          <div className="space-y-3">
            <Label htmlFor="pause-reason" className="text-sm font-semibold text-gray-900">
              Motivo da pausa *
            </Label>
            <Select value={pauseReason} onValueChange={setPauseReason} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o motivo da pausa" />
              </SelectTrigger>
              <SelectContent>
                {PAUSE_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Detalhes Adicionais */}
          <div className="space-y-3">
            <Label htmlFor="pause-details" className="text-sm font-semibold text-gray-900">
              Detalhes adicionais (opcional)
            </Label>
            <Textarea
              id="pause-details"
              placeholder="Descreva detalhes específicos sobre o motivo da pausa..."
              value={pauseDetails}
              onChange={(e) => setPauseDetails(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Previsão de Retorno */}
          <div className="space-y-3">
            <Label htmlFor="estimated-hours" className="text-sm font-semibold text-gray-900">
              Previsão de retorno (em horas) *
            </Label>
            <div className="relative">
              <Input
                id="estimated-hours"
                type="number"
                placeholder="Ex: 24, 48, 72..."
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                min="1"
                max="720"
                className="pr-16"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">horas</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Durante este período, o SLA ficará pausado e não será contabilizado
            </p>
          </div>

          <DialogFooter className="flex gap-3 justify-end pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
              disabled={isSubmitting || !pauseReason || !estimatedHours}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Pausando...
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar Ticket
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PauseTicketModal;