import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TestModal({ isOpen, onClose }: TestModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>TESTE - Modal Funcionando</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 p-4">
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-3">Categorização</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Departamento *</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ti">TI</SelectItem>
                    <SelectItem value="rh">RH</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Categoria *</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cat1">Categoria 1</SelectItem>
                    <SelectItem value="cat2">Categoria 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Button onClick={onClose} className="w-full">
            Fechar Teste
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}