import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, RefreshCw } from 'lucide-react';

interface UserSelectorProps {
  onUserChange?: (userId: string, userRole: string) => void;
}

export default function UserSelector({ onUserChange }: UserSelectorProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Configurar interceptor global de fetch na inicialização
    const testUserId = localStorage.getItem('test-user-id');
    const testUserRole = localStorage.getItem('test-user-role');
    
    if (testUserId && testUserRole) {
      const originalFetch = window.fetch;
      window.fetch = function(input, init = {}) {
        const headers = new Headers(init.headers);
        headers.set('x-test-user-id', testUserId);
        headers.set('x-test-user-role', testUserRole);
        
        return originalFetch(input, {
          ...init,
          headers
        });
      };
    }
    
    // Buscar lista de usuários
    fetch('/api/users', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setUsers(data || []);
        
        // Usar usuário salvo no localStorage ou admin como padrão
        let defaultUser;
        if (testUserId) {
          defaultUser = data.find((u: any) => u.id === testUserId);
        }
        if (!defaultUser) {
          defaultUser = data.find((u: any) => u.role === 'admin' || u.role === 'administrador');
        }
        
        if (defaultUser) {
          setSelectedUser(defaultUser.id);
          setCurrentUser(defaultUser);
        }
      })
      .catch(err => console.error('Erro ao buscar usuários:', err));
  }, []);

  const handleUserChange = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(userId);
      setCurrentUser(user);
      
      // Salvar no localStorage para persistência
      localStorage.setItem('test-user-id', userId);
      localStorage.setItem('test-user-role', user.role);
      
      // Configurar interceptor global para incluir headers nas requisições
      const originalFetch = window.fetch;
      window.fetch = function(input, init = {}) {
        const headers = new Headers(init.headers);
        headers.set('x-test-user-id', userId);
        headers.set('x-test-user-role', user.role);
        
        return originalFetch(input, {
          ...init,
          headers
        });
      };
      
      onUserChange?.(userId, user.role);
      
      // Recarregar página para aplicar novo usuário
      window.location.reload();
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
      case 'administrador': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      case 'atendente': return 'Atendente';
      case 'solicitante': return 'Solicitante';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
      case 'administrador': return 'text-red-600 bg-red-50';
      case 'supervisor': return 'text-orange-600 bg-orange-50';
      case 'atendente': return 'text-blue-600 bg-blue-50';
      case 'solicitante': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (users.length === 0) return null;

  return (
    <Card className="mb-4 border-dashed border-2 border-blue-300 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center text-blue-700">
          <User className="w-4 h-4 mr-2" />
          Simulador de Usuário (Desenvolvimento)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Select value={selectedUser} onValueChange={handleUserChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar usuário para simular" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center space-x-2">
                      <span>{user.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {currentUser && (
            <div className="text-sm">
              <span className="text-gray-600">Usuário atual: </span>
              <span className="font-medium">{currentUser.name}</span>
              <span className={`ml-2 text-xs px-2 py-1 rounded ${getRoleColor(currentUser.role)}`}>
                {getRoleLabel(currentUser.role)}
              </span>
            </div>
          )}
        </div>
        
        <p className="text-xs text-blue-600 mt-2">
          ⚠️ Este seletor é apenas para desenvolvimento e testes. 
          Permite simular diferentes perfis de usuário para validar as permissões.
        </p>
      </CardContent>
    </Card>
  );
}