import React from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/AppIcon';
import Button from '@/components/Button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocation } from 'wouter';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSwitchToForgot: () => void;
}

export default function LoginForm({ onSwitchToForgot }: LoginFormProps) {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Simular login por 1 segundo
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Login data:', data);
      setLocation('/');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Field */}
      <div>
        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
          Email
        </label>
        <Input
          {...register('email', {
            required: 'Email é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido'
            }
          })}
          type="email"
          placeholder="seu@email.com"
          disabled={isLoading}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 block">
          Senha
        </label>
        <div className="relative">
          <Input
            {...register('password', {
              required: 'Senha é obrigatória',
              minLength: {
                value: 6,
                message: 'Senha deve ter pelo menos 6 caracteres'
              }
            })}
            type={showPassword ? 'text' : 'password'}
            placeholder="Digite sua senha"
            disabled={isLoading}
            className={errors.password ? 'border-red-500' : ''}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            disabled={isLoading}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            {...register('rememberMe')}
            disabled={isLoading}
          />
          <label htmlFor="rememberMe" className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Lembrar de mim
          </label>
        </div>
        <button
          type="button"
          onClick={onSwitchToForgot}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          disabled={isLoading}
        >
          Esqueci minha senha
        </button>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full"
        disabled={isLoading}
        iconName={isLoading ? 'Loader2' : 'LogIn'}
        iconPosition="left"
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>

      {/* Demo Credentials */}
      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600">
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">
          Credenciais de demonstração:
        </p>
        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
          <p><strong>Email:</strong> admin@ticketflow.com</p>
          <p><strong>Senha:</strong> admin123</p>
        </div>
      </div>
    </form>
  );
}