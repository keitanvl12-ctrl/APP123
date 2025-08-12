import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ForgotPasswordForm = ({ onBack, onResetPassword, isLoading, success }) => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleInputChange = (value) => {
    setEmail(value);
    if (validationError) {
      setValidationError('');
    }
  };

  const validateEmail = () => {
    if (!email) {
      setValidationError('Email é obrigatório');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(email)) {
      setValidationError('Formato de email inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateEmail()) {
      onResetPassword(email);
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter') {
      handleSubmit(e);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mx-auto">
          <Icon name="CheckCircle" size={32} className="text-success" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Email Enviado!</h3>
          <p className="text-sm text-muted-foreground">
            Instruções para redefinir sua senha foram enviadas para <strong>{email}</strong>
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Não recebeu o email? Verifique sua caixa de spam ou tente novamente em alguns minutos.
          </p>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            iconName="ArrowLeft"
            iconPosition="left"
            iconSize={16}
            className="transition-enterprise"
          >
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto">
          <Icon name="Key" size={24} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Recuperar Senha</h3>
        <p className="text-sm text-muted-foreground">
          Digite seu email corporativo para receber instruções de recuperação
        </p>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Corporativo"
          type="email"
          placeholder="seu.email@empresa.com"
          value={email}
          onChange={(e) => handleInputChange(e?.target?.value)}
          error={validationError}
          required
          disabled={isLoading}
          onKeyPress={handleKeyPress}
          className="transition-enterprise"
        />

        <div className="space-y-3">
          <Button
            type="submit"
            variant="default"
            size="lg"
            fullWidth
            loading={isLoading}
            iconName="Send"
            iconPosition="right"
            iconSize={16}
            className="transition-enterprise"
          >
            {isLoading ? 'Enviando...' : 'Enviar Instruções'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            fullWidth
            onClick={onBack}
            iconName="ArrowLeft"
            iconPosition="left"
            iconSize={16}
            className="transition-enterprise"
          >
            Voltar ao Login
          </Button>
        </div>
      </form>
      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Problemas para acessar? Entre em contato com o suporte técnico
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;