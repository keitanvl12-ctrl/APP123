import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Download, 
  Printer, 
  Mail, 
  FileText, 
  Clock, 
  User, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Building,
  Tag,
  MessageSquare,
  Paperclip,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ServiceOrderModalProps {
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
  finalizationData?: any;
}

export default function ServiceOrderModal({ ticket, isOpen, onClose, finalizationData }: ServiceOrderModalProps) {
  const [emailAddress, setEmailAddress] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch ticket comments
  const { data: comments } = useQuery<any[]>({
    queryKey: ['/api/tickets', ticket.id, 'comments'],
    enabled: isOpen && !!ticket.id,
  });

  // Fetch users for assignments
  const { data: users } = useQuery<any[]>({
    queryKey: ['/api/users'],
    enabled: isOpen,
  });

  // Fetch SLA rules
  const { data: slaRules } = useQuery<any[]>({
    queryKey: ['/api/sla/rules'],
    enabled: isOpen,
  });

  // Fetch status and priority configs
  const { data: statusConfigs } = useQuery<any[]>({
    queryKey: ['/api/config/status'],
    enabled: isOpen,
  });

  const { data: priorityConfigs } = useQuery<any[]>({
    queryKey: ['/api/config/priority'],
    enabled: isOpen,
  });

  // Get user names
  const getAssignedUser = () => {
    return users?.find(u => u.id === ticket.assignedTo)?.name || 'Não atribuído';
  };

  const getCreatedByUser = () => {
    return users?.find(u => u.id === ticket.createdBy)?.name || 'Sistema';
  };

  // Get SLA information with proper pause handling
  const getSLAInfo = () => {
    const rule = slaRules?.find(r => r.priority === ticket.priority);
    if (!rule) return null;

    const createdAt = new Date(ticket.createdAt);
    let endTime = new Date();
    
    // If ticket is resolved, use resolution time
    if (ticket.resolvedAt) {
      endTime = new Date(ticket.resolvedAt);
    }
    
    // Calculate total elapsed time in minutes
    const totalElapsedMinutes = Math.floor((endTime.getTime() - createdAt.getTime()) / (1000 * 60));
    
    // TODO: Fetch pause records and calculate paused time
    // For now, assume no paused time - this will be enhanced when pause system is implemented
    const pausedMinutes = 0;
    const effectiveMinutes = totalElapsedMinutes - pausedMinutes;
    
    // Convert to hours for display
    const effectiveHours = Math.floor(effectiveMinutes / 60);
    const remainingMinutes = effectiveMinutes % 60;
    
    // Determine which SLA to use (response vs resolution)
    const isResolved = ticket.status === 'resolved';
    const slaLimitHours = isResolved ? rule.resolutionTime : rule.responseTime;
    const slaLimitMinutes = slaLimitHours * 60;
    
    const isCompliant = effectiveMinutes <= slaLimitMinutes;
    
    // Format time display
    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours === 0) return `${mins}min`;
      if (mins === 0) return `${hours}h`;
      return `${hours}h ${mins}min`;
    };
    
    return {
      responseTime: `${rule.responseTime}h`,
      resolutionTime: `${rule.resolutionTime}h`,
      hoursElapsed: formatTime(effectiveMinutes),
      totalElapsed: formatTime(totalElapsedMinutes),
      pausedTime: formatTime(pausedMinutes),
      status: isCompliant ? 'Dentro do SLA' : 'Fora do SLA',
      isCompliant,
      slaType: isResolved ? 'Resolução' : 'Resposta',
      slaLimit: `${slaLimitHours}h`
    };
  };

  // Get status and priority display names
  const getStatusDisplay = () => {
    const config = statusConfigs?.find(s => s.value === ticket.status);
    return config?.name || ticket.status;
  };

  const getPriorityDisplay = () => {
    const config = priorityConfigs?.find(p => p.value === ticket.priority);
    return config?.name || ticket.priority;
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = 20;

      // Header with OPUS Logo
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(44, 66, 87); // OPUS Blue
      pdf.text('GRUPO OPUS', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 8;
      pdf.setFontSize(14);
      pdf.setTextColor(107, 143, 176);
      pdf.text('ORDEM DE SERVIÇO', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      
      // Service Order Header
      pdf.setFillColor(44, 66, 87);
      pdf.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
      
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`OS Nº: ${ticket.ticketNumber || 'N/A'}`, margin + 5, yPosition + 5);
      pdf.text(`Data: ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`, pageWidth - margin - 5, yPosition + 5, { align: 'right' });
      
      yPosition += 15;

      // Ticket Information Section
      pdf.setFontSize(14);
      pdf.setTextColor(44, 66, 87);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMAÇÕES DO CHAMADO', margin, yPosition);
      yPosition += 10;

      const addInfoField = (label: string, value: string, isFullWidth: boolean = false) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${label}:`, margin, yPosition);
        
        pdf.setFont('helvetica', 'normal');
        const valueText = value || 'N/A';
        const maxWidth = isFullWidth ? pageWidth - margin * 2 - 5 : (pageWidth - margin * 2) / 2 - 10;
        const lines = pdf.splitTextToSize(valueText, maxWidth);
        pdf.text(lines, margin + 35, yPosition);
        
        yPosition += Math.max(lines.length * 4, 6);
      };

      // Basic Information
      addInfoField('Número', ticket.ticketNumber || 'N/A');
      addInfoField('Assunto', ticket.subject || 'N/A', true);
      addInfoField('Descrição', ticket.description || 'N/A', true);
      
      yPosition += 5;
      
      // Status and Priority in same line
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Status:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(getStatusDisplay(), margin + 35, yPosition);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Prioridade:', pageWidth / 2, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(getPriorityDisplay(), pageWidth / 2 + 35, yPosition);
      
      yPosition += 8;

      // People Information
      addInfoField('Solicitante', getCreatedByUser());
      addInfoField('Responsável', getAssignedUser());
      
      yPosition += 5;

      // Dates
      addInfoField('Abertura', ticket.createdAt ? format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A');
      if (ticket.resolvedAt) {
        addInfoField('Resolução', format(new Date(ticket.resolvedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }));
      }

      yPosition += 10;

      // SLA Information
      const slaInfo = getSLAInfo();
      if (slaInfo) {
        pdf.setFontSize(14);
        pdf.setTextColor(44, 66, 87);
        pdf.setFont('helvetica', 'bold');
        pdf.text('INFORMAÇÕES DE SLA', margin, yPosition);
        yPosition += 10;

        addInfoField('SLA Resposta', slaInfo.responseTime);
        addInfoField('SLA Resolução', slaInfo.resolutionTime);
        addInfoField('Tipo SLA Aplicado', `${slaInfo.slaType} (${slaInfo.slaLimit})`);
        addInfoField('Tempo Total', slaInfo.totalElapsed);
        addInfoField('Tempo Pausado', slaInfo.pausedTime);
        addInfoField('Tempo Efetivo', slaInfo.hoursElapsed);
        addInfoField('Status SLA', slaInfo.status);
        
        yPosition += 10;
      }

      // Comments/History Section
      if (comments && comments.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(44, 66, 87);
        pdf.setFont('helvetica', 'bold');
        pdf.text('HISTÓRICO DE ATENDIMENTO', margin, yPosition);
        yPosition += 10;

        comments.forEach((comment: any, index: number) => {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 20;
          }

          const commentDate = format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR });
          const commentUser = comment.user?.name || 'Sistema';
          
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.text(`${index + 1}. ${commentDate} - ${commentUser}`, margin, yPosition);
          yPosition += 5;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          const commentLines = pdf.splitTextToSize(comment.content, pageWidth - margin * 2 - 10);
          pdf.text(commentLines, margin + 5, yPosition);
          yPosition += commentLines.length * 4 + 8;
        });
      }

      // Finalization Data
      if (finalizationData) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setTextColor(44, 66, 87);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DADOS DE FINALIZAÇÃO', margin, yPosition);
        yPosition += 10;

        if (finalizationData.solution) {
          addInfoField('Solução Aplicada', finalizationData.solution, true);
        }
        if (finalizationData.timeSpent) {
          addInfoField('Tempo Gasto', `${finalizationData.timeSpent} horas`);
        }
        if (finalizationData.materials) {
          addInfoField('Materiais Utilizados', finalizationData.materials, true);
        }
      }

      // Signature Section
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      yPosition += 20;
      
      pdf.setFontSize(14);
      pdf.setTextColor(44, 66, 87);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ASSINATURAS', margin, yPosition);
      yPosition += 15;

      // Signature boxes
      const boxWidth = (pageWidth - margin * 2 - 10) / 2;
      
      // Technical signature
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.rect(margin, yPosition, boxWidth, 20);
      pdf.text('Técnico Responsável:', margin + 2, yPosition + 5);
      pdf.text('Nome: ____________________________', margin + 2, yPosition + 10);
      pdf.text('Data: ____/____/____', margin + 2, yPosition + 15);

      // Client signature
      pdf.rect(margin + boxWidth + 10, yPosition, boxWidth, 20);
      pdf.text('Cliente/Solicitante:', margin + boxWidth + 12, yPosition + 5);
      pdf.text('Nome: ____________________________', margin + boxWidth + 12, yPosition + 10);
      pdf.text('Data: ____/____/____', margin + boxWidth + 12, yPosition + 15);

      // Footer
      yPosition = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Documento gerado automaticamente pelo Sistema TicketFlow Pro - Grupo OPUS', pageWidth / 2, yPosition, { align: 'center' });

      // Save PDF
      pdf.save(`Ordem_Servico_${ticket.ticketNumber || ticket.id}.pdf`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    if (!emailAddress.trim()) {
      alert('Por favor, insira um endereço de email válido');
      return;
    }
    
    // Here you would implement email functionality
    console.log('Enviando por email para:', emailAddress);
    alert('Funcionalidade de email será implementada em breve');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <DialogTitle className="text-xl font-bold text-blue-900">
              Ordem de Serviço - {ticket.ticketNumber}
            </DialogTitle>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? 'Gerando...' : 'Baixar PDF'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Service Order Content */}
        <div className="space-y-6 p-6 bg-white" id="service-order-content">
          {/* Header */}
          <div className="text-center border-b-2 border-blue-900 pb-4">
            <div className="flex items-center justify-center space-x-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-800 to-blue-600 rounded-lg flex items-center justify-center">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">GRUPO OPUS</h1>
                <p className="text-blue-600 font-medium">ORDEM DE SERVIÇO</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>OS Nº: <strong>{ticket.ticketNumber || 'N/A'}</strong></span>
              <span>Data de Emissão: <strong>{format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Informações do Chamado</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Número:</label>
                  <p className="text-sm">{ticket.ticketNumber || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-700">Assunto:</label>
                  <p className="text-sm">{ticket.subject || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-700">Descrição:</label>
                  <p className="text-sm text-gray-600">{ticket.description || 'N/A'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Status:</label>
                    <Badge variant="outline" className="ml-2">{getStatusDisplay()}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Prioridade:</label>
                    <Badge variant="outline" className="ml-2">{getPriorityDisplay()}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* People and Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Responsáveis e Datas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Solicitante:</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {getCreatedByUser().charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{getCreatedByUser()}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-700">Responsável:</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                        {getAssignedUser().charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{getAssignedUser()}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-700">Data de Abertura:</label>
                  <p className="text-sm flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{ticket.createdAt ? format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}</span>
                  </p>
                </div>
                
                {ticket.resolvedAt && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Data de Resolução:</label>
                    <p className="text-sm flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{format(new Date(ticket.resolvedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* SLA Information */}
          {getSLAInfo() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Informações de SLA</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {(() => {
                    const slaInfo = getSLAInfo();
                    return (
                      <>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">SLA Resposta:</label>
                          <p className="text-sm">{slaInfo?.responseTime}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">SLA Resolução:</label>
                          <p className="text-sm">{slaInfo?.resolutionTime}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Tipo SLA Aplicado:</label>
                          <p className="text-sm font-medium">{slaInfo?.slaType} ({slaInfo?.slaLimit})</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Tempo Total:</label>
                          <p className="text-sm">{slaInfo?.totalElapsed}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Tempo Pausado:</label>
                          <p className="text-sm">{slaInfo?.pausedTime}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Tempo Efetivo:</label>
                          <p className="text-sm font-medium">{slaInfo?.hoursElapsed}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Status SLA:</label>
                          <Badge 
                            variant="outline" 
                            className={slaInfo?.isCompliant ? 'text-green-700 border-green-200 bg-green-50' : 'text-red-700 border-red-200 bg-red-50'}
                          >
                            {slaInfo?.isCompliant ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 mr-1" />
                            )}
                            {slaInfo?.status}
                          </Badge>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments/History */}
          {comments && comments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Histórico de Atendimento ({comments.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {comments.map((comment: any, index: number) => (
                    <div key={comment.id} className="border-l-2 border-blue-200 pl-4 py-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {comment.user?.name?.charAt(0) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{comment.user?.name || 'Sistema'}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Finalization Data */}
          {finalizationData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Dados de Finalização</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {finalizationData.solution && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Solução Aplicada:</label>
                    <p className="text-sm text-gray-600">{finalizationData.solution}</p>
                  </div>
                )}
                
                {finalizationData.timeSpent && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Tempo Gasto:</label>
                    <p className="text-sm">{finalizationData.timeSpent} horas</p>
                  </div>
                )}
                
                {finalizationData.materials && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Materiais Utilizados:</label>
                    <p className="text-sm text-gray-600">{finalizationData.materials}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Signature Section */}
          <Card>
            <CardHeader>
              <CardTitle>Assinaturas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-300 rounded-lg p-4 h-24">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Técnico Responsável:</p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Nome: _______________________________</p>
                    <p className="text-xs text-gray-500">Data: ____/____/____</p>
                  </div>
                </div>
                
                <div className="border border-gray-300 rounded-lg p-4 h-24">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Cliente/Solicitante:</p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Nome: _______________________________</p>
                    <p className="text-xs text-gray-500">Data: ____/____/____</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>Enviar por Email</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleEmail} className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6 p-4 border-t">
          <p>Documento gerado automaticamente pelo Sistema TicketFlow Pro - Grupo OPUS</p>
          <p>Data de geração: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}