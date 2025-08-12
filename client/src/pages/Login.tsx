import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, Shield, Building2 } from 'lucide-react';
import { FaMicrosoft } from 'react-icons/fa';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular login
    setTimeout(() => {
      console.log('Login realizado:', formData);
      setIsLoading(false);
      // Aqui redirecionaria para o dashboard
    }, 2000);
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    // Aqui seria implementada a integração com Microsoft Graph API
    console.log('Login com Microsoft iniciado');
    
    setTimeout(() => {
      setIsLoading(false);
      // Redirecionaria após autenticação
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ 
           background: 'linear-gradient(135deg, #2c4257 0%, #6b8fb0 50%, #9db4c7 100%)',
           backgroundAttachment: 'fixed'
         }}>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo OPUS */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
               style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
            <Building2 className="w-8 h-8 text-opus-blue-dark" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TicketFlow Pro</h1>
          <p className="text-opus-gray-light">Grupo OPUS - Sistema de Tickets</p>
        </div>

        <Card className="backdrop-blur-md bg-white/95 border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-opus-blue-dark">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-gray-600">
              Acesse sua conta para gerenciar tickets e solicitações
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Login com Microsoft */}
            <Button
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-[#0078d4] to-[#106ebe] hover:from-[#106ebe] to-[#005a9e] text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaMicrosoft className="w-5 h-5 mr-3" />
              {isLoading ? 'Conectando...' : 'Entrar com Microsoft'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">ou continue com email</span>
              </div>
            </div>

            {/* Login tradicional */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-opus-blue-dark font-medium">
                  Email corporativo
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10 h-12 border-gray-200 focus:border-opus-blue-light focus:ring-opus-blue-light"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-opus-blue-dark font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-opus-blue-light focus:ring-opus-blue-light"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-opus-blue-dark transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-opus-blue-dark focus:ring-opus-blue-light" />
                  <span className="text-gray-600">Manter-me conectado</span>
                </label>
                <button type="button" className="text-opus-blue-dark hover:text-opus-blue-light font-medium">
                  Esqueceu a senha?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ 
                  background: 'linear-gradient(135deg, #2c4257 0%, #6b8fb0 100%)',
                  color: 'white'
                }}
              >
                {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
              </Button>
            </form>

            {/* Footer de segurança */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Conexão segura e protegida</span>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                © 2025 Grupo OPUS. Todos os direitos reservados.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Link de suporte */}
        <div className="text-center mt-6">
          <p className="text-white/80 text-sm">
            Precisa de ajuda? {' '}
            <button className="text-white font-medium hover:underline">
              Entre em contato com o suporte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}