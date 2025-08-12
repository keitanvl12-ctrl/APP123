import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface Client {
  ws: WebSocket;
  userId?: string;
  departmentId?: string;
  role?: string;
}

class TicketWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<Client> = new Set();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    
    this.wss.on('connection', (ws: WebSocket, req) => {
      console.log('Nova conexão WebSocket estabelecida');
      
      const client: Client = { ws };
      this.clients.add(client);

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          
          // Registrar informações do cliente
          if (data.type === 'register') {
            client.userId = data.userId;
            client.departmentId = data.departmentId;
            client.role = data.role;
            console.log(`Cliente registrado: ${client.userId} (${client.role})`);
          }
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      });

      ws.on('close', () => {
        console.log('Conexão WebSocket fechada');
        this.clients.delete(client);
      });

      ws.on('error', (error) => {
        console.error('Erro WebSocket:', error);
        this.clients.delete(client);
      });
    });
  }

  // Broadcast para todos os clientes
  broadcastUpdate(type: string, data: any) {
    const message = JSON.stringify({ type, data, timestamp: new Date() });
    
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  // Broadcast para clientes específicos baseado em departamento
  broadcastToDepartment(departmentId: string, type: string, data: any) {
    const message = JSON.stringify({ type, data, timestamp: new Date() });
    
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN && 
          (client.departmentId === departmentId || client.role === 'administrador')) {
        client.ws.send(message);
      }
    });
  }

  // Broadcast para usuário específico
  broadcastToUser(userId: string, type: string, data: any) {
    const message = JSON.stringify({ type, data, timestamp: new Date() });
    
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN && client.userId === userId) {
        client.ws.send(message);
      }
    });
  }

  // Notificar sobre mudanças em tickets
  notifyTicketChange(ticket: any, changeType: 'created' | 'updated' | 'deleted') {
    this.broadcastUpdate('ticket_change', {
      ticket,
      changeType,
      affectedDepartments: [
        ticket.department_id,
        ticket.requester_department_id,
        ticket.responsible_department_id
      ].filter(Boolean)
    });
  }

  // Notificar sobre mudanças em SLA
  notifySLAChange(ticketId: string, slaData: any) {
    this.broadcastUpdate('sla_change', {
      ticketId,
      slaData
    });
  }

  // Notificar sobre mudanças no dashboard
  notifyDashboardUpdate() {
    this.broadcastUpdate('dashboard_update', {
      message: 'Dashboard data updated'
    });
  }
}

let wsServer: TicketWebSocketServer | null = null;

export function initWebSocketServer(server: Server): TicketWebSocketServer {
  if (!wsServer) {
    wsServer = new TicketWebSocketServer(server);
  }
  return wsServer;
}

export function getWebSocketServer(): TicketWebSocketServer | null {
  return wsServer;
}