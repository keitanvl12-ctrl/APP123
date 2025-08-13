import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn, Mail, Lock, Building2, Shield } from 'lucide-react';
import { FaMicrosoft } from 'react-icons/fa';
import OpusLogo from '@assets/Logo Grupo OPUS - azul escuro.azul claro1_1754938736660.png';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const currentUser = localStorage.getItem('currentUser');
    
    if (token && currentUser) {
      setLocation('/');
    }
  }, [setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login bem-sucedido, dados recebidos:', data);
        
        // Store authentication data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo(a), ${data.user.name}!`,
        });

        console.log('Redirecionando para dashboard...');
        
        // Force page reload after successful login to reinitialize auth state
        window.location.href = '/';
      } else {
        toast({
          title: "Erro no login",
          description: data.message || "Credenciais inválidas",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Erro de conexão com o servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = () => {
    toast({
      title: "Login com Microsoft",
      description: "Funcionalidade em desenvolvimento. Use as credenciais de teste por enquanto.",
    });
  };

  const demoAccounts = [
    {
      role: 'Administrador',
      email: 'admin@empresa.com',
      password: 'admin123',
      color: 'text-purple-600',
      icon: Shield,
      description: 'Acesso total ao sistema'
    },
    {
      role: 'Supervisor',
      email: 'maria.santos@empresa.com', 
      password: 'maria123',
      color: 'text-blue-600',
      icon: Building2,
      description: 'Gerencia departamentos'
    },
    {
      role: 'Colaborador',
      email: 'ana.costa@empresa.com',
      password: 'ana123',
      color: 'text-green-600',
      icon: LogIn,
      description: 'Usuário padrão'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c4257] via-[#3a5267] to-[#6b8fb0] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center gap-8">
        
        {/* Left Side - Branding */}
        <div className="flex-1 text-center lg:text-left text-white space-y-6">
          <div className="flex justify-center lg:justify-start">
            <img 
              src={OpusLogo} 
              alt="Grupo OPUS" 
              className="h-16 w-auto filter brightness-0 invert" 
            />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold">
              TicketFlow Pro
            </h1>
            <p className="text-xl text-blue-100">
              Sistema Avançado de Gestão de Tickets
            </p>
            <p className="text-blue-200 max-w-md mx-auto lg:mx-0">
              Controle total sobre seus tickets de suporte com workflow inteligente e análises avançadas.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <Shield className="h-8 w-8 text-blue-200 mb-2" />
              <h3 className="font-semibold text-white">Segurança</h3>
              <p className="text-sm text-blue-200">Controle de acesso por hierarquia</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <Building2 className="h-8 w-8 text-blue-200 mb-2" />
              <h3 className="font-semibold text-white">Multi-departamental</h3>
              <p className="text-sm text-blue-200">Gestão por setores</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <LogIn className="h-8 w-8 text-blue-200 mb-2" />
              <h3 className="font-semibold text-white">Analytics</h3>
              <p className="text-sm text-blue-200">Relatórios em tempo real</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Acesso ao Sistema
              </CardTitle>
              <CardDescription>
                Entre com suas credenciais para continuar
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@opus.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      data-testid="input-password"
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

                <Button 
                  type="submit" 
                  className="w-full bg-[#2c4257] hover:bg-[#1e2e3a] text-white"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                  <LogIn className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Ou continue com</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleMicrosoftLogin}
                data-testid="button-microsoft-login"
              >
                <FaMicrosoft className="mr-2 h-4 w-4 text-blue-600" />
                Acessar com Microsoft
              </Button>

              {/* Demo Accounts */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contas para Demonstração:</h3>
                <div className="space-y-2">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.email}
                      onClick={() => {
                        setEmail(account.email);
                        setPassword(account.password);
                      }}
                      className="w-full text-left p-2 rounded border hover:bg-white hover:shadow-sm transition-all"
                      data-testid={`button-demo-${account.role.toLowerCase()}`}
                    >
                      <div className="flex items-center space-x-3">
                        <account.icon className={`h-4 w-4 ${account.color}`} />
                        <div>
                          <div className={`font-medium text-sm ${account.color}`}>
                            {account.role}
                          </div>
                          <div className="text-xs text-gray-500">{account.description}</div>
                          <div className="text-xs text-gray-400">{account.email}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-white/80">
              © 2025 Grupo OPUS. Sistema desenvolvido para uso interno.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;