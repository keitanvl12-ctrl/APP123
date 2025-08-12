import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ticketNumber: string;
  loading?: boolean;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  ticketNumber,
  loading = false
}: DeleteConfirmationDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  
  const isConfirmValid = confirmText === ticketNumber;

  const handleConfirm = () => {
    if (isConfirmValid) {
      onConfirm();
      setConfirmText('');
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Excluir Ticket
                </DialogTitle>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="w-6 h-6 p-0 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <DialogDescription className="text-sm text-gray-600 leading-relaxed">
            Esta ação não pode ser desfeita. O ticket{' '}
            <span className="font-semibold text-gray-900">{ticketNumber}</span>{' '}
            será permanentemente excluído do sistema, incluindo todos os seus comentários e anexos.
          </DialogDescription>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Trash2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Dados que serão perdidos:</p>
                <ul className="mt-1 space-y-1 list-disc list-inside text-xs">
                  <li>Informações do ticket e histórico</li>
                  <li>Comentários e atualizações</li>
                  <li>Anexos e documentos</li>
                  <li>Logs de SLA e atividades</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-input" className="text-sm font-medium text-gray-700">
              Para confirmar, digite <span className="font-mono font-bold text-red-600">{ticketNumber}</span>:
            </Label>
            <Input
              id="confirm-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Digite ${ticketNumber} para confirmar`}
              className="font-mono"
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter className="flex items-center space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmValid || loading}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Excluindo...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Trash2 className="w-4 h-4" />
                <span>Excluir Permanentemente</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}