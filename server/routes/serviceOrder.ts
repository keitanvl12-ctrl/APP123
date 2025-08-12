import type { Express } from "express";
import { storage } from "../storage";
import { sendEmail } from "../sendgrid";

export function registerServiceOrderRoutes(app: Express) {
  // Send Service Order via email
  app.post("/api/service-order/send-email", async (req, res) => {
    try {
      const { ticketId, recipientEmail, pdfData } = req.body;
      
      if (!ticketId || !recipientEmail || !pdfData) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const ticket = await storage.getTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Send email with PDF attachment
      const emailSent = await sendEmail(process.env.SENDGRID_API_KEY!, {
        to: recipientEmail,
        from: "noreply@grupoopus.com.br", // Configure your verified sender
        subject: `Ordem de Serviço - ${ticket.ticketNumber}`,
        html: `
          <h2>Ordem de Serviço - ${ticket.ticketNumber}</h2>
          <p>Prezado(a),</p>
          <p>Segue em anexo a Ordem de Serviço referente ao chamado ${ticket.ticketNumber}.</p>
          <p><strong>Assunto:</strong> ${ticket.subject}</p>
          <p><strong>Status:</strong> Finalizado</p>
          <p><strong>Data de Resolução:</strong> ${ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
          <br>
          <p>Atenciosamente,<br>
          Grupo OPUS<br>
          Equipe de Suporte Técnico</p>
        `,
        // TODO: Attach PDF data
      });

      if (emailSent) {
        res.json({ success: true, message: "Ordem de Serviço enviada por email com sucesso" });
      } else {
        res.status(500).json({ message: "Falha ao enviar email" });
      }

    } catch (error) {
      console.error("Error sending service order email:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Generate Service Order data for a ticket
  app.get("/api/service-order/:ticketId", async (req, res) => {
    try {
      const { ticketId } = req.params;
      
      const ticket = await storage.getTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Return structured data for PDF generation
      const serviceOrderData = {
        orderNumber: ticket.ticketNumber,
        date: new Date().toLocaleDateString('pt-BR'),
        ticket: {
          id: ticket.id,
          number: ticket.ticketNumber,
          subject: ticket.subject,
          description: ticket.description,
          priority: ticket.priority,
          category: ticket.category,
          createdAt: ticket.createdAt,
          resolvedAt: ticket.resolvedAt,
          createdBy: ticket.createdBy,
          assignedTo: ticket.assignedTo,
        },
        finalizationData: {
          comment: ticket.finalizationComment,
          hoursSpent: ticket.hoursSpent,
          materialsUsed: ticket.materialsUsed,
          equipmentRemoved: ticket.equipmentRemoved,
          extraCharge: ticket.extraCharge,
          chargeType: ticket.chargeType,
        },
        company: {
          name: "Grupo OPUS",
          logo: "/assets/logo-opus.png"
        }
      };

      res.json(serviceOrderData);

    } catch (error) {
      console.error("Error generating service order data:", error);
      res.status(500).json({ message: "Erro ao gerar dados da Ordem de Serviço" });
    }
  });
}