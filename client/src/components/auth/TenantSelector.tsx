import React from 'react';
import Icon from '@/components/AppIcon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Tenant {
  id: string;
  name: string;
  location: string;
}

interface TenantSelectorProps {
  tenants: Tenant[];
  selectedTenant: string;
  onTenantChange: (tenantId: string) => void;
}

export default function TenantSelector({ tenants, selectedTenant, onTenantChange }: TenantSelectorProps) {
  const selectedTenantData = tenants.find(t => t.id === selectedTenant);

  const tenantOptions = tenants.map(tenant => ({
    value: tenant.id,
    label: tenant.name,
    description: tenant.location
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Icon name="Building2" size={16} className="text-slate-600 dark:text-slate-400" />
        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Selecionar Organização
        </h3>
      </div>

      <Select value={selectedTenant} onValueChange={onTenantChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma organização" />
        </SelectTrigger>
        <SelectContent>
          {tenantOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedTenantData && (
        <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {selectedTenantData.name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {selectedTenantData.location}
              </p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}