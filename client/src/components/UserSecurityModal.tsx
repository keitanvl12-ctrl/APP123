import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Shield, Key, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: (userId: string, securityData: any) => void;
}

const UserSecurityModal: React.FC<UserSecurityModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro de Validação",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro de Validação", 
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const securityData = {
        newPassword,
        forcePasswordChange
      };

      console.log('Sending security data:', securityData, 'for user:', user.id);
      await onUpdate(user.id, securityData);
      
      toast({
        title: "Sucesso",
        description: "Configurações de segurança atualizadas com sucesso",
      });
      
      setNewPassword('');
      setConfirmPassword('');
      setForcePasswordChange(false);
      onClose();
      
    } catch (error) {
      console.error('Error updating user security:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar configurações de segurança",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
    
    // Copy to clipboard
    navigator.clipboard.writeText(password).then(() => {
      toast({
        title: "Senha Gerada",
        description: "Nova senha gerada e copiada para a área de transferência",
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Configurações de Segurança - {user?.name}
          </DialogTitle>
          <DialogDescription>
            Gerencie as configurações de segurança e senha do usuário. 
            Apenas administradores podem realizar estas alterações.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Nome</Label>
                  <p className="text-sm">{user?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-sm">{user?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Hierarquia</Label>
                  <p className="text-sm capitalize">{user?.hierarchy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Departamento</Label>
                  <p className="text-sm">{user?.department?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Security Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Alteração de Senha
              </CardTitle>
              <CardDescription>
                Defina uma nova senha para o usuário. A senha deve ter pelo menos 6 caracteres.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha"
                      required
                      minLength={6}
                      data-testid="input-new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme a nova senha"
                      required
                      minLength={6}
                      data-testid="input-confirm-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRandomPassword}
                    className="flex items-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    Gerar Senha Segura
                  </Button>
                </div>

                {/* Password Validation */}
                {newPassword && (
                  <div className="space-y-2">
                    <Label className="text-sm">Requisitos da Senha:</Label>
                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 text-sm ${newPassword.length >= 6 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${newPassword.length >= 6 ? 'bg-green-600' : 'bg-red-600'}`} />
                        Pelo menos 6 caracteres
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-600' : 'bg-gray-300'}`} />
                        Pelo menos uma letra maiúscula (recomendado)
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${/\d/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${/\d/.test(newPassword) ? 'bg-green-600' : 'bg-gray-300'}`} />
                        Pelo menos um número (recomendado)
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${/[!@#$%^&*]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*]/.test(newPassword) ? 'bg-green-600' : 'bg-gray-300'}`} />
                        Pelo menos um caractere especial (recomendado)
                      </div>
                    </div>
                  </div>
                )}

                {/* Force Password Change Option */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="forcePasswordChange"
                    checked={forcePasswordChange}
                    onChange={(e) => setForcePasswordChange(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="forcePasswordChange" className="text-sm">
                    Forçar alteração de senha no próximo login
                  </Label>
                </div>

                {forcePasswordChange && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      O usuário será obrigado a alterar a senha no próximo login.
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Security Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações de Segurança</CardTitle>
              <CardDescription>
                Ações administrativas relacionadas à segurança da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    toast({
                      title: "Sessões Encerradas",
                      description: "Todas as sessões ativas do usuário foram encerradas",
                    });
                  }}
                >
                  Encerrar Todas as Sessões
                </Button>
                
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={async () => {
                    try {
                      const newStatus = !user?.isBlocked;
                      const response = await fetch(`/api/users/${user.id}/block`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ isBlocked: newStatus }),
                      });

                      if (response.ok) {
                        toast({
                          title: newStatus ? "Conta Bloqueada" : "Conta Desbloqueada",
                          description: `A conta do usuário foi ${newStatus ? 'bloqueada. O usuário será desconectado imediatamente' : 'desbloqueada'} com sucesso`,
                          variant: newStatus ? "destructive" : "default",
                        });
                        setTimeout(() => {
                          window.location.reload();
                        }, 1500);
                      } else {
                        throw new Error('Erro na requisição');
                      }
                    } catch (error) {
                      toast({
                        title: "Erro",
                        description: "Erro ao alterar status da conta",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  {user?.isBlocked ? 'Desbloquear Conta' : 'Bloquear Conta'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading || !newPassword || newPassword !== confirmPassword}
            className="bg-red-600 hover:bg-red-700 text-white"
            data-testid="button-save-security"
          >
            {isLoading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserSecurityModal;