import React, { useState, useRef } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FileAttachmentZone = ({ 
  formData, 
  onFormChange, 
  errors 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
  ];

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    fileArray?.forEach(file => {
      if (file?.size > maxFileSize) {
        errors?.push(`${file?.name}: Arquivo muito grande (máximo 10MB)`);
        return;
      }

      if (!allowedTypes?.includes(file?.type)) {
        errors?.push(`${file?.name}: Tipo de arquivo não permitido`);
        return;
      }

      validFiles?.push({
        id: Date.now() + Math.random(),
        file: file,
        name: file?.name,
        size: file?.size,
        type: file?.type,
        uploadStatus: 'pending'
      });
    });

    if (errors?.length > 0) {
      alert('Alguns arquivos não puderam ser adicionados:\n' + errors?.join('\n'));
    }

    if (validFiles?.length > 0) {
      const currentAttachments = formData?.attachments || [];
      const newAttachments = [...currentAttachments, ...validFiles];
      onFormChange('attachments', newAttachments);
      
      // Simulate upload progress
      validFiles?.forEach(file => {
        simulateUpload(file?.id);
      });
    }
  };

  const simulateUpload = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Update file status to completed
        const currentAttachments = formData?.attachments || [];
        const updatedAttachments = currentAttachments?.map(att => 
          att?.id === fileId ? { ...att, uploadStatus: 'completed' } : att
        );
        onFormChange('attachments', updatedAttachments);
      }
      
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
    }, 200);
  };

  const removeFile = (fileId) => {
    const currentAttachments = formData?.attachments || [];
    const updatedAttachments = currentAttachments?.filter(att => att?.id !== fileId);
    onFormChange('attachments', updatedAttachments);
    
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress?.[fileId];
      return newProgress;
    });
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragOver(false);
    const files = e?.dataTransfer?.files;
    handleFileSelect(files);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return 'Image';
    if (fileType === 'application/pdf') return 'FileText';
    if (fileType?.includes('word')) return 'FileText';
    if (fileType?.includes('excel') || fileType?.includes('sheet')) return 'FileSpreadsheet';
    if (fileType?.includes('zip') || fileType?.includes('rar')) return 'Archive';
    return 'File';
  };

  const attachments = formData?.attachments || [];

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-enterprise">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-warning/10 rounded-lg">
          <Icon name="Paperclip" size={20} className="text-warning" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Anexos</h2>
          <p className="text-sm text-muted-foreground">Adicione capturas de tela, documentos ou outros arquivos relevantes</p>
        </div>
      </div>
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-enterprise cursor-pointer ${
          isDragOver 
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef?.current?.click()}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full">
            <Icon name="Upload" size={24} className="text-muted-foreground" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              Clique para selecionar ou arraste arquivos aqui
            </p>
            <p className="text-xs text-muted-foreground">
              Máximo 10MB por arquivo • PDF, DOC, XLS, imagens, ZIP
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            iconName="FolderOpen"
            iconPosition="left"
            iconSize={16}
          >
            Selecionar Arquivos
          </Button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
        onChange={(e) => handleFileSelect(e?.target?.files)}
        className="hidden"
      />
      {/* File List */}
      {attachments?.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-foreground">Arquivos Anexados ({attachments?.length})</h4>
          
          <div className="space-y-2">
            {attachments?.map((attachment) => (
              <div key={attachment?.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center justify-center w-10 h-10 bg-background rounded-lg">
                  <Icon name={getFileIcon(attachment?.type)} size={16} className="text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{attachment?.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(attachment?.size)}</p>
                  
                  {attachment?.uploadStatus === 'pending' && uploadProgress?.[attachment?.id] !== undefined && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Enviando...</span>
                        <span>{Math.round(uploadProgress?.[attachment?.id])}%</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress?.[attachment?.id]}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {attachment?.uploadStatus === 'completed' && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Icon name="CheckCircle" size={12} className="text-success" />
                      <span className="text-xs text-success">Enviado com sucesso</span>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(attachment?.id)}
                  className="text-error hover:text-error hover:bg-error/10"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* File Guidelines */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Diretrizes para Anexos:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Capturas de tela ajudam a identificar problemas visuais</li>
              <li>• Logs de erro facilitam o diagnóstico técnico</li>
              <li>• Documentos relacionados ao processo em questão</li>
              <li>• Evite anexar informações confidenciais desnecessárias</li>
            </ul>
          </div>
        </div>
      </div>
      {errors?.attachments && (
        <p className="text-sm text-error mt-4">{errors?.attachments}</p>
      )}
    </div>
  );
};

export default FileAttachmentZone;