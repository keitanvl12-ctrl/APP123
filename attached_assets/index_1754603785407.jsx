import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import CompanyBranding from './components/CompanyBranding';
import SecurityIndicators from './components/SecurityIndicators';
import TenantSelector from './components/TenantSelector';
import Icon from '../../components/AppIcon';

const LoginAndAuthentication = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('login'); // 'login', 'forgot-password'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lastLoginTime] = useState(new Date('2025-08-06T14:30:00'));
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  // Mock credentials for different user roles
  const mockCredentials = {
    'admin@ticketflow.com': { password: 'admin123', role: 'Manager-Admin', redirect: '/user-management-console' },
    'agente@ticketflow.com': { password: 'agente123', role: 'Agent', redirect: '/support-agent-dashboard' },
    'supervisor@ticketflow.com': { password: 'super123', role: 'Attendant', redirect: '/kanban-board-view' }
  };

  useEffect(() => {
    // Check for saved tenant preference
    const savedTenant = localStorage.getItem('selectedTenant');
    if (savedTenant) {
      setSelectedTenant(JSON.parse(savedTenant));
    }

    // Clear any existing authentication
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
  }, []);

  const handleLogin = async (formData) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const credentials = mockCredentials?.[formData?.email?.toLowerCase()];
      
      if (!credentials || credentials?.password !== formData?.password) {
        setFailedAttempts(prev => prev + 1);
        setError('Email ou senha incorretos. Verifique suas credenciais.');
        return;
      }

      if (!selectedTenant) {
        setError('Selecione uma organização para continuar.');
        return;
      }

      // Simulate successful authentication
      const authToken = `jwt_${Date.now()}_${Math.random()?.toString(36)?.substr(2, 9)}`;
      
      // Store authentication data
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('userRole', credentials?.role);
      localStorage.setItem('userEmail', formData?.email);
      localStorage.setItem('selectedTenant', JSON.stringify(selectedTenant));
      
      if (formData?.rememberDevice) {
        localStorage.setItem('rememberDevice', 'true');
      }

      // Reset failed attempts on successful login
      setFailedAttempts(0);

      // Role-based redirect
      navigate(credentials?.redirect);

    } catch (err) {
      setError('Erro interno do servidor. Tente novamente em alguns minutos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setCurrentView('forgot-password');
    setError('');
    setPasswordResetSuccess(false);
  };

  const handleResetPassword = async (email) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if email exists in mock credentials
      if (!mockCredentials?.[email?.toLowerCase()]) {
        setError('Email não encontrado no sistema.');
        return;
      }

      setPasswordResetSuccess(true);
    } catch (err) {
      setError('Erro ao enviar email de recuperação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    setError('');
    setPasswordResetSuccess(false);
  };

  const handleTenantChange = (tenant) => {
    setSelectedTenant(tenant);
    if (tenant) {
      localStorage.setItem('selectedTenant', JSON.stringify(tenant));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Panel - Company Branding */}
        <div className="hidden lg:block">
          <div className="bg-card border border-border rounded-2xl shadow-enterprise-lg p-8">
            <CompanyBranding />
          </div>
        </div>

        {/* Right Panel - Authentication Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-card border border-border rounded-2xl shadow-enterprise-lg p-8 space-y-8">
            {/* Mobile Branding Header */}
            <div className="lg:hidden text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl mx-auto mb-4">
                <Icon name="Ticket" size={24} color="white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">TicketFlow Pro</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestão de Tickets</p>
            </div>

            {/* Tenant Selection */}
            {currentView === 'login' && (
              <TenantSelector
                selectedTenant={selectedTenant}
                onTenantChange={handleTenantChange}
                isLoading={isLoading}
              />
            )}

            {/* Authentication Forms */}
            <div className="space-y-6">
              {currentView === 'login' ? (
                <>
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h2>
                    <p className="text-muted-foreground">
                      Entre com suas credenciais corporativas para acessar o sistema
                    </p>
                  </div>

                  <LoginForm
                    onLogin={handleLogin}
                    onForgotPassword={handleForgotPassword}
                    isLoading={isLoading}
                    error={error}
                  />
                </>
              ) : (
                <ForgotPasswordForm
                  onBack={handleBackToLogin}
                  onResetPassword={handleResetPassword}
                  isLoading={isLoading}
                  success={passwordResetSuccess}
                />
              )}
            </div>

            {/* Security Indicators */}
            {currentView === 'login' && (
              <SecurityIndicators
                failedAttempts={failedAttempts}
                lastLoginTime={lastLoginTime}
                sessionTimeout={30}
              />
            )}

            {/* Help Section */}
            <div className="text-center space-y-2 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Problemas para acessar? Entre em contato com o suporte
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs">
                <a href="mailto:suporte@ticketflow.com" className="text-primary hover:text-primary/80 transition-enterprise">
                  suporte@ticketflow.com
                </a>
                <span className="text-muted-foreground">•</span>
                <a href="tel:+551133334444" className="text-primary hover:text-primary/80 transition-enterprise">
                  (11) 3333-4444
                </a>
              </div>
            </div>

            {/* Mock Credentials Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Icon name="Info" size={14} className="text-primary" />
                <span className="text-xs font-medium text-foreground">Credenciais de Demonstração</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div><strong>Admin:</strong> admin@ticketflow.com / admin123</div>
                <div><strong>Agente:</strong> agente@ticketflow.com / agente123</div>
                <div><strong>Supervisor:</strong> supervisor@ticketflow.com / super123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAndAuthentication;