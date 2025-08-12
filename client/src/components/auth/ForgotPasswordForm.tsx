import React from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/AppIcon';
import Button from '@/components/Button';
import { Input } from '@/components/ui/input';

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

export default function ForgotPasswordForm({ onSwitchToLogin }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // Simular envio de email por 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Password reset requested for:', data.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
          <Icon name="Mail" size={24} className="text-green-600 dark:text-green-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Email enviado!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={onSwitchToLogin}
            className="w-full"
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Voltar ao Login
          </Button>
          
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Não recebeu o email? Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Esqueceu sua senha?
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Digite seu email e enviaremos instruções para redefinir sua senha.
        </p>
      </div>

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

      {/* Actions */}
      <div className="space-y-3">
        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full"
          disabled={isLoading}
          iconName={isLoading ? 'Loader2' : 'Mail'}
          iconPosition="left"
        >
          {isLoading ? 'Enviando...' : 'Enviar Instruções'}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onSwitchToLogin}
          className="w-full"
          disabled={isLoading}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Voltar ao Login
        </Button>
      </div>
    </form>
  );
}