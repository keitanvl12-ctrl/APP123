import React from 'react';
import Icon from '../../../components/AppIcon';

const CompanyBranding = ({ companyName = "TicketFlow Pro", showHealthIndicator = true }) => {
  const currentYear = new Date()?.getFullYear();
  
  return (
    <div className="text-center space-y-6">
      {/* Logo and Brand */}
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-enterprise-lg">
            <Icon name="Ticket" size={32} color="white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{companyName}</h1>
          <p className="text-sm text-muted-foreground">Sistema Empresarial de Gestão de Tickets</p>
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <span>Edição Enterprise</span>
            <span>•</span>
            <span>v2.1.4</span>
          </div>
        </div>
      </div>

      {/* System Status Indicators */}
      {showHealthIndicator && (
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-4 text-xs">
            {/* System Health */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">Sistema Online</span>
            </div>
            
            {/* Security Status */}
            <div className="flex items-center space-x-2">
              <Icon name="Shield" size={12} className="text-success" />
              <span className="text-muted-foreground">Seguro</span>
            </div>
            
            {/* LDAP Integration */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span className="text-muted-foreground">LDAP Conectado</span>
            </div>
          </div>

          {/* Last Update */}
          <div className="text-xs text-muted-foreground">
            Última atualização: 07/08/2025 às 18:52
          </div>
        </div>
      )}

      {/* Security Features */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Icon name="Lock" size={14} className="text-primary" />
          <span className="text-xs font-medium text-foreground">Acesso Seguro</span>
        </div>
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <span>• Criptografia JWT</span>
          <span>• Auditoria Completa</span>
          <span>• Multi-empresa</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>© {currentYear} TicketFlow Pro. Todos os direitos reservados.</p>
        <p>Desenvolvido para excelência em atendimento ao cliente</p>
      </div>
    </div>
  );
};

export default CompanyBranding;