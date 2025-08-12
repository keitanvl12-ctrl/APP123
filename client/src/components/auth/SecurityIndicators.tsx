import React from 'react';
import Icon from '@/components/AppIcon';

export default function SecurityIndicators() {
  const indicators = [
    {
      icon: 'Lock',
      text: 'Conexão Segura SSL',
      status: 'active'
    },
    {
      icon: 'Shield',
      text: 'Autenticação 2FA Disponível',
      status: 'available'
    },
    {
      icon: 'Server',
      text: 'Servidor: São Paulo',
      status: 'info'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
        Indicadores de Segurança
      </h3>
      
      <div className="space-y-2">
        {indicators.map((indicator, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${
              indicator.status === 'active' ? 'bg-green-500' :
              indicator.status === 'available' ? 'bg-blue-500' :
              'bg-slate-400'
            }`} />
            <Icon 
              name={indicator.icon as any} 
              size={12} 
              className="text-slate-500 dark:text-slate-400" 
            />
            <span className="text-slate-600 dark:text-slate-400">
              {indicator.text}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Última verificação: {new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  );
}