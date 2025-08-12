import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const TicketCard = ({ 
  ticket, 
  onEdit, 
  onSelect, 
  isSelected, 
  canDrag = true,
  showGhost = false 
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'ticket',
    item: { id: ticket?.id, status: ticket?.status },
    canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-error text-error-foreground';
      case 'High': return 'bg-warning text-warning-foreground';
      case 'Medium': return 'bg-accent text-accent-foreground';
      case 'Low': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSLAStatus = (slaPercentage) => {
    if (slaPercentage >= 90) return { color: 'text-error', bg: 'bg-error/10', pulse: true };
    if (slaPercentage >= 70) return { color: 'text-warning', bg: 'bg-warning/10', pulse: false };
    return { color: 'text-success', bg: 'bg-success/10', pulse: false };
  };

  const slaStatus = getSLAStatus(ticket?.slaPercentage);
  const isOverdue = ticket?.slaPercentage >= 90;

  return (
    <div
      ref={drag}
      className={`
        bg-card border border-border rounded-lg p-4 shadow-enterprise cursor-pointer
        transition-all duration-200 hover:shadow-enterprise-lg
        ${isDragging ? 'opacity-50 rotate-2 scale-105' : ''}
        ${showGhost ? 'opacity-30 border-dashed' : ''}
        ${isSelected ? 'ring-2 ring-primary' : ''}
        ${isOverdue ? 'border-error animate-pulse' : ''}
        ${!canDrag ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
      `}
      onClick={() => onEdit(ticket)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e?.stopPropagation();
              onSelect(ticket?.id, e?.target?.checked);
            }}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
          />
          <span className="text-sm font-mono text-muted-foreground">#{ticket?.id}</span>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket?.priority)}`}>
          {ticket?.priority}
        </div>
      </div>
      {/* Subject */}
      <h3 className="font-medium text-sm text-foreground mb-2 line-clamp-2 leading-tight">
        {ticket?.subject}
      </h3>
      {/* Requester */}
      <div className="flex items-center space-x-2 mb-3">
        <Image
          src={ticket?.requester?.avatar}
          alt={ticket?.requester?.name}
          className="w-6 h-6 rounded-full object-cover"
        />
        <span className="text-xs text-muted-foreground truncate">
          {ticket?.requester?.name}
        </span>
      </div>
      {/* SLA Timer */}
      <div className={`flex items-center space-x-2 mb-3 p-2 rounded-md ${slaStatus?.bg}`}>
        <Icon 
          name="Clock" 
          size={14} 
          className={`${slaStatus?.color} ${slaStatus?.pulse ? 'animate-pulse' : ''}`} 
        />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className={`text-xs font-medium ${slaStatus?.color}`}>
              SLA: {ticket?.slaRemaining}
            </span>
            <span className={`text-xs ${slaStatus?.color}`}>
              {ticket?.slaPercentage}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                ticket?.slaPercentage >= 90 ? 'bg-error' :
                ticket?.slaPercentage >= 70 ? 'bg-warning' : 'bg-success'
              }`}
              style={{ width: `${Math.min(ticket?.slaPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
      {/* Assigned Agent */}
      {ticket?.assignedAgent && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src={ticket?.assignedAgent?.avatar}
              alt={ticket?.assignedAgent?.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-xs text-muted-foreground truncate">
              {ticket?.assignedAgent?.name}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {ticket?.hasAttachments && (
              <Icon name="Paperclip" size={12} className="text-muted-foreground" />
            )}
            {ticket?.commentCount > 0 && (
              <div className="flex items-center space-x-1">
                <Icon name="MessageCircle" size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{ticket?.commentCount}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Quick Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="xs"
            iconName="Play"
            iconSize={12}
            onClick={(e) => {
              e?.stopPropagation();
              // Handle play action
            }}
            className="text-success hover:text-success hover:bg-success/10"
          />
          <Button
            variant="ghost"
            size="xs"
            iconName="Pause"
            iconSize={12}
            onClick={(e) => {
              e?.stopPropagation();
              // Handle pause action
            }}
            className="text-warning hover:text-warning hover:bg-warning/10"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(ticket?.updatedAt)?.toLocaleDateString('pt-BR')}
        </span>
      </div>
    </div>
  );
};

export default TicketCard;