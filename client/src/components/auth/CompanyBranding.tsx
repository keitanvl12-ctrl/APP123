import React from 'react';
import Icon from '@/components/AppIcon';

export default function CompanyBranding() {
  return (
    <div className="text-center space-y-4">
      {/* Logo */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <Icon name="Ticket" size={24} className="text-white" />
        </div>
      </div>

      {/* Brand Name */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          TicketFlow Pro
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Sistema de Gestão de Tickets
        </p>
      </div>

      {/* Version & Environment */}
      <div className="flex items-center justify-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center">
          <Icon name="Globe" size={12} className="mr-1" />
          v2.1.0
        </span>
        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
        <span className="flex items-center">
          <Icon name="Shield" size={12} className="mr-1" />
          Produção
        </span>
      </div>
    </div>
  );
}