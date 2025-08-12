import { Router } from 'express';
import { db } from '../db';
import { tickets, users } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';

const router = Router();

// Endpoint para buscar notificações do usuário
router.get('/api/notifications', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId é obrigatório' });
    }

    // Buscar tickets atribuídos ao usuário que estão abertos
    const assignedTickets = await db
      .select({
        id: tickets.id,
        subject: tickets.subject,
        priority: tickets.priority,
        status: tickets.status,
        createdAt: tickets.createdAt,
        requesterName: tickets.requesterName,
        assignedTo: tickets.assignedTo
      })
      .from(tickets)
      .where(
        and(
          eq(tickets.assignedTo, userId),
          or(
            eq(tickets.status, 'open'),
            eq(tickets.status, 'in_progress'),
            eq(tickets.status, 'pending')
          )
        )
      )
      .orderBy(tickets.createdAt);

    // Gerar notificações baseadas nos tickets
    const notifications = assignedTickets.map(ticket => {
      const createdTime = new Date(ticket.createdAt);
      const now = new Date();
      const hoursPassed = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
      
      let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
      let type: 'ticket_assigned' | 'sla_warning' = 'ticket_assigned';
      
      // Determinar prioridade baseada no tempo
      if (hoursPassed > 4) {
        priority = 'critical';
        type = 'sla_warning';
      } else if (hoursPassed > 2) {
        priority = 'high';
      } else if (hoursPassed > 1) {
        priority = 'medium';
      }

      return {
        id: `ticket-${ticket.id}`,
        type,
        title: type === 'sla_warning' ? 'Alerta de SLA!' : 'Ticket Atribuído',
        message: `${ticket.subject} - ${ticket.requesterName || 'Cliente'}`,
        ticketId: ticket.id,
        timestamp: ticket.createdAt,
        read: false,
        priority
      };
    });

    res.json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Endpoint para buscar tickets atribuídos ao usuário
router.get('/api/tickets/assigned', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId é obrigatório' });
    }

    const assignedTickets = await db
      .select()
      .from(tickets)
      .where(
        and(
          eq(tickets.assignedTo, userId),
          or(
            eq(tickets.status, 'open'),
            eq(tickets.status, 'in_progress'),
            eq(tickets.status, 'pending')
          )
        )
      );

    res.json(assignedTickets);
  } catch (error) {
    console.error('Erro ao buscar tickets atribuídos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;