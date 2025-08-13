/**
 * Business Hours Calculator for SLA Management
 * Handles business hours calculations for São Paulo timezone (America/Sao_Paulo)
 * Working hours: Monday to Friday, 8:00 AM to 6:00 PM
 */

export interface BusinessHoursConfig {
  startHour: number; // 8 = 8:00 AM
  endHour: number;   // 18 = 6:00 PM
  timezone: string;  // 'America/Sao_Paulo'
  workingDays: number[]; // [1,2,3,4,5] = Monday to Friday
}

export const defaultBusinessHours: BusinessHoursConfig = {
  startHour: 8,
  endHour: 18,
  timezone: 'America/Sao_Paulo',
  workingDays: [1, 2, 3, 4, 5] // Monday = 1, Sunday = 0
};

/**
 * Check if a given date/time is within business hours
 */
export function isWithinBusinessHours(date: Date, config: BusinessHoursConfig = defaultBusinessHours): boolean {
  // Convert to São Paulo timezone
  const utcTime = new Date(date.getTime());
  const saoPauloTime = new Date(utcTime.toLocaleString("en-US", { timeZone: config.timezone }));
  const dayOfWeek = saoPauloTime.getDay();
  const hour = saoPauloTime.getHours();
  
  // Check if it's a working day
  const isWorkingDay = config.workingDays.includes(dayOfWeek);
  
  // Check if it's within working hours
  const isWorkingHour = hour >= config.startHour && hour < config.endHour;
  
  console.log(`🕒 Checking business hours for ${saoPauloTime.toLocaleString('pt-BR', { timeZone: config.timezone })}: Day ${dayOfWeek}, Hour ${hour} - ${isWorkingDay && isWorkingHour ? 'WITHIN' : 'OUTSIDE'} business hours`);
  
  return isWorkingDay && isWorkingHour;
}

/**
 * Get next business hour start time
 */
export function getNextBusinessHourStart(date: Date, config: BusinessHoursConfig = defaultBusinessHours): Date {
  const current = new Date(date);
  
  while (!isWithinBusinessHours(current, config)) {
    const saoPauloTime = new Date(current.toLocaleString("en-US", { timeZone: config.timezone }));
    const dayOfWeek = saoPauloTime.getDay();
    const hour = saoPauloTime.getHours();
    
    if (config.workingDays.includes(dayOfWeek)) {
      // Same day, but outside hours
      if (hour < config.startHour) {
        // Before work starts - jump to start time
        current.setHours(config.startHour, 0, 0, 0);
        break;
      } else {
        // After work ends - go to next day
        current.setDate(current.getDate() + 1);
        current.setHours(config.startHour, 0, 0, 0);
      }
    } else {
      // Weekend or non-working day - go to next day
      current.setDate(current.getDate() + 1);
      current.setHours(config.startHour, 0, 0, 0);
    }
  }
  
  return current;
}

/**
 * Calculate effective business hours between two dates
 * Only counts time during business hours
 */
export function calculateBusinessHours(startDate: Date, endDate: Date, config: BusinessHoursConfig = defaultBusinessHours): number {
  if (startDate >= endDate) return 0;
  
  let effectiveHours = 0;
  let current = new Date(startDate);
  const end = new Date(endDate);
  
  console.log(`📊 Calculando horas úteis entre ${startDate.toLocaleString('pt-BR')} e ${endDate.toLocaleString('pt-BR')}`);
  
  while (current < end) {
    const nextHour = new Date(current);
    nextHour.setHours(current.getHours() + 1, 0, 0, 0);
    
    // If this hour segment is within business hours
    if (isWithinBusinessHours(current, config)) {
      const segmentEnd = nextHour > end ? end : nextHour;
      const segmentHours = (segmentEnd.getTime() - current.getTime()) / (1000 * 60 * 60);
      effectiveHours += segmentHours;
      
      console.log(`⏰ Hora útil contabilizada: ${current.toLocaleString('pt-BR')} - ${segmentEnd.toLocaleString('pt-BR')} = ${segmentHours.toFixed(2)}h`);
    }
    
    current = nextHour;
  }
  
  console.log(`✅ Total de horas úteis: ${effectiveHours.toFixed(2)}h`);
  return effectiveHours;
}

/**
 * Calculate remaining business hours for SLA
 */
export function calculateRemainingBusinessHours(
  createdAt: Date, 
  slaHours: number, 
  pausedAt?: Date | null,
  config: BusinessHoursConfig = defaultBusinessHours
): { remainingHours: number, effectiveHours: number, deadline: Date } {
  const now = new Date();
  let effectiveEndTime = pausedAt ? new Date(pausedAt) : now;
  
  // Calculate effective hours used so far (only business hours)
  const effectiveHours = calculateBusinessHours(createdAt, effectiveEndTime, config);
  
  // Calculate remaining hours
  const remainingHours = Math.max(0, slaHours - effectiveHours);
  
  // Calculate deadline (when SLA will expire in business hours)
  let deadline = new Date(createdAt);
  let hoursToAdd = slaHours;
  
  while (hoursToAdd > 0) {
    if (isWithinBusinessHours(deadline, config)) {
      const hoursUntilEndOfDay = config.endHour - deadline.getHours();
      const hoursToAddThisSegment = Math.min(hoursToAdd, hoursUntilEndOfDay);
      
      deadline.setHours(deadline.getHours() + hoursToAddThisSegment);
      hoursToAdd -= hoursToAddThisSegment;
    } else {
      // Move to next business hour
      deadline = getNextBusinessHourStart(deadline, config);
    }
  }
  
  console.log(`⏰ SLA criado em: ${createdAt.toLocaleString('pt-BR')}`);
  console.log(`⏰ Horas efetivas usadas: ${effectiveHours.toFixed(2)}h de ${slaHours}h`);
  console.log(`⏰ Horas restantes: ${remainingHours.toFixed(2)}h`);
  console.log(`⏰ Prazo final (horário útil): ${deadline.toLocaleString('pt-BR')}`);
  
  return {
    remainingHours,
    effectiveHours,
    deadline
  };
}