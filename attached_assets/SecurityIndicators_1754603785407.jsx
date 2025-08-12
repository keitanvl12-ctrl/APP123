import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SecurityIndicators = ({ failedAttempts = 0, lastLoginTime, sessionTimeout = 30 }) => {
  const [timeRemaining, setTimeRemaining] = useState(sessionTimeout * 60);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 300) { // 5 minutes warning
          setShowTimeoutWarning(true);
        }
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const formatLastLogin = (timestamp) => {
    if (!timestamp) return 'Primeiro acesso';
    const date = new Date(timestamp);
    return date?.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Session Timeout Warning */}
      {showTimeoutWarning && (
        <div className="flex items-center space-x-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <Icon name="Clock" size={16} className="text-warning" />
          <div className="flex-1">
            <p className="text-sm font-medium text-warning">Sessão expirando em breve</p>
            <p className="text-xs text-warning/80">Tempo restante: {formatTime(timeRemaining)}</p>
          </div>
        </div>
      )}

      {/* Failed Attempts Warning */}
      {failedAttempts > 0 && (
        <div className="flex items-center space-x-2 p-3 bg-error/10 border border-error/20 rounded-lg">
          <Icon name="AlertTriangle" size={16} className="text-error" />
          <div className="flex-1">
            <p className="text-sm font-medium text-error">
              {failedAttempts === 1 ? 'Tentativa de login inválida' : `${failedAttempts} tentativas inválidas`}
            </p>
            <p className="text-xs text-error/80">
              {failedAttempts >= 3 ? 'Conta será bloqueada após 5 tentativas' : 'Verifique suas credenciais'}
            </p>
          </div>
        </div>
      )}

      {/* Account Lockout Warning */}
      {failedAttempts >= 4 && (
        <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <Icon name="ShieldAlert" size={16} className="text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Atenção: Bloqueio iminente</p>
            <p className="text-xs text-destructive/80">
              Mais 1 tentativa incorreta bloqueará sua conta por 15 minutos
            </p>
          </div>
        </div>
      )}

      {/* Security Information */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={16} className="text-primary" />
          <span className="text-sm font-medium text-foreground">Informações de Segurança</span>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          {/* Last Login */}
          <div className="flex items-center justify-between">
            <span>Último acesso:</span>
            <span className="font-medium">{formatLastLogin(lastLoginTime)}</span>
          </div>

          {/* Encryption Status */}
          <div className="flex items-center justify-between">
            <span>Criptografia:</span>
            <div className="flex items-center space-x-1">
              <Icon name="Lock" size={12} className="text-success" />
              <span className="font-medium text-success">Ativa (AES-256)</span>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="flex items-center justify-between">
            <span>Auditoria:</span>
            <div className="flex items-center space-x-1">
              <Icon name="FileText" size={12} className="text-success" />
              <span className="font-medium text-success">Habilitada</span>
            </div>
          </div>

          {/* Session Management */}
          <div className="flex items-center justify-between">
            <span>Sessão segura:</span>
            <div className="flex items-center space-x-1">
              <Icon name="CheckCircle" size={12} className="text-success" />
              <span className="font-medium text-success">JWT Ativo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Indicators */}
      <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Icon name="Award" size={12} className="text-primary" />
          <span>ISO 27001</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Shield" size={12} className="text-primary" />
          <span>LGPD</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="CheckCircle" size={12} className="text-primary" />
          <span>SOC 2</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityIndicators;