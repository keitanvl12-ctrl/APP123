import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pause, X } from 'lucide-react';
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
      <DialogContent className="sm:max-w-md" aria-describedby="pause-ticket-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <Pause className="w-5 h-5" />
            {ticket.ticketNumber} - Pausar Ticket
          </DialogTitle>
          <DialogDescription id="pause-ticket-description">
            {ticket.subject}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Motivo da Pausa */}
          <div className="space-y-2">
            <Label htmlFor="pause-reason">Motivo da pausa *</Label>
            <Select value={pauseReason} onValueChange={setPauseReason} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
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
          <div className="space-y-2">
            <Label htmlFor="pause-details">Detalhes (opcional)</Label>
            <Textarea
              id="pause-details"
              placeholder="Descreva detalhes específicos sobre o motivo da pausa..."
              value={pauseDetails}
              onChange={(e) => setPauseDetails(e.target.value)}
              rows={3}
            />
          </div>

          {/* Previsão de Retorno */}
          <div className="space-y-2">
            <Label htmlFor="estimated-hours">Previsão de retorno (em horas)</Label>
            <Input
              id="estimated-hours"
              type="number"
              placeholder="Ex: 24, 48, 72..."
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              min="1"
            />
          </div>

          <DialogFooter className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isSubmitting}
            >
              <Pause className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Pausando...' : 'Pausar Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PauseTicketModal;