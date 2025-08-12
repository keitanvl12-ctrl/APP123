import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const LoginForm = ({ onLogin, onForgotPassword, isLoading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberDevice: false
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors?.[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData?.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      errors.email = 'Formato de email inválido';
    }
    
    if (!formData?.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData?.password?.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onLogin(formData);
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div>
        <Input
          label="Email Corporativo"
          type="email"
          placeholder="seu.email@empresa.com"
          value={formData?.email}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={validationErrors?.email}
          required
          disabled={isLoading}
          onKeyPress={handleKeyPress}
          className="transition-enterprise"
        />
      </div>
      {/* Password Field */}
      <div className="relative">
        <Input
          label="Senha"
          type={showPassword ? "text" : "password"}
          placeholder="Digite sua senha"
          value={formData?.password}
          onChange={(e) => handleInputChange('password', e?.target?.value)}
          error={validationErrors?.password}
          required
          disabled={isLoading}
          onKeyPress={handleKeyPress}
          className="transition-enterprise pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-enterprise"
          disabled={isLoading}
        >
          <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
        </button>
      </div>
      {/* Remember Device */}
      <div className="flex items-center justify-between">
        <Checkbox
          label="Lembrar este dispositivo"
          checked={formData?.rememberDevice}
          onChange={(e) => handleInputChange('rememberDevice', e?.target?.checked)}
          disabled={isLoading}
          size="sm"
        />
        
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-primary hover:text-primary/80 transition-enterprise"
          disabled={isLoading}
        >
          Esqueceu a senha?
        </button>
      </div>
      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-error/10 border border-error/20 rounded-lg">
          <Icon name="AlertCircle" size={16} className="text-error" />
          <span className="text-sm text-error">{error}</span>
        </div>
      )}
      {/* Login Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        iconName="LogIn"
        iconPosition="right"
        iconSize={18}
        className="transition-enterprise"
      >
        {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
      </Button>
    </form>
  );
};

export default LoginForm;