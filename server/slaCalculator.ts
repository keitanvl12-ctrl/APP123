import { format, differenceInMinutes, addMinutes } from 'date-fns';

export interface SLACalculationResult {
  responseTime: string;
  resolutionTime: string;
  hoursElapsed: string;
  minutesElapsed: number;
  status: string;
  isCompliant: boolean;
  pausedTime: string;
  effectiveTime: string;
  slaDeadline: string;
}

export interface PauseRecord {
  id: string;
  ticketId: string;
  pausedAt: string;
  resumedAt?: string;
  expectedReturnAt?: string;
  reason: string;
  pausedBy: string;
}

export function calculateSLA(
  ticket: any,
  slaRule: any,
  pauseRecords: PauseRecord[] = []
): SLACalculationResult | null {
  if (!slaRule) return null;

  const createdAt = new Date(ticket.createdAt);
  const now = new Date();
  const resolvedAt = ticket.resolvedAt ? new Date(ticket.resolvedAt) : null;
  
  // Calculate end time for SLA calculation
  const endTime = resolvedAt || now;
  
  // Calculate total paused time in minutes
  let totalPausedMinutes = 0;
  
  pauseRecords.forEach(pause => {
    const pausedAt = new Date(pause.pausedAt);
    let resumedAt: Date;
    
    if (pause.resumedAt) {
      resumedAt = new Date(pause.resumedAt);
    } else if (pause.expectedReturnAt) {
      // If still paused, use expected return time or current time, whichever is smaller
      const expectedReturn = new Date(pause.expectedReturnAt);
      resumedAt = expectedReturn < now ? expectedReturn : now;
    } else {
      // If no expected return time, consider paused until now
      resumedAt = now;
    }
    
    // Only count pause time if it's within the ticket's active period
    const effectivePauseStart = pausedAt > createdAt ? pausedAt : createdAt;
    const effectivePauseEnd = resumedAt < endTime ? resumedAt : endTime;
    
    if (effectivePauseEnd > effectivePauseStart) {
      totalPausedMinutes += differenceInMinutes(effectivePauseEnd, effectivePauseStart);
    }
  });
  
  // Calculate total elapsed time in minutes
  const totalElapsedMinutes = differenceInMinutes(endTime, createdAt);
  
  // Calculate effective time (elapsed - paused)
  const effectiveMinutes = totalElapsedMinutes - totalPausedMinutes;
  
  // Convert SLA times from hours to minutes
  const responseTimeLimitMinutes = slaRule.responseTime * 60;
  const resolutionTimeLimitMinutes = slaRule.resolutionTime * 60;
  
  // Determine SLA compliance
  const slaLimitMinutes = ticket.status === 'resolved' ? resolutionTimeLimitMinutes : responseTimeLimitMinutes;
  const isCompliant = effectiveMinutes <= slaLimitMinutes;
  
  // Calculate SLA deadline
  const slaDeadline = addMinutes(createdAt, slaLimitMinutes + totalPausedMinutes);
  
  // Format times
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}min`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  };
  
  return {
    responseTime: `${slaRule.responseTime}h`,
    resolutionTime: `${slaRule.resolutionTime}h`,
    hoursElapsed: formatTime(totalElapsedMinutes),
    minutesElapsed: effectiveMinutes,
    status: isCompliant ? 'Dentro do SLA' : 'Fora do SLA',
    isCompliant,
    pausedTime: formatTime(totalPausedMinutes),
    effectiveTime: formatTime(effectiveMinutes),
    slaDeadline: format(slaDeadline, 'dd/MM/yyyy HH:mm')
  };
}

export function getSLAStatus(ticket: any, slaRule: any, pauseRecords: PauseRecord[] = []): string {
  const calculation = calculateSLA(ticket, slaRule, pauseRecords);
  return calculation?.status || 'SLA não definido';
}

export function isSLACompliant(ticket: any, slaRule: any, pauseRecords: PauseRecord[] = []): boolean {
  const calculation = calculateSLA(ticket, slaRule, pauseRecords);
  return calculation?.isCompliant ?? false;
}