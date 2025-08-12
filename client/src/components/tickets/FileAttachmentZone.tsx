import React, { useState, useRef } from 'react';
import Button from '@/components/Button';
import Icon from '@/components/AppIcon';

interface FileAttachment {
  id: string | number;
  file: File;
  name: string;
  size: number;
  type: string;
  uploadStatus: 'pending' | 'completed' | 'error';
}

interface FileAttachmentZoneProps {
  formData: any;
  onFormChange: (field: string, value: any) => void;
  errors: any;
}

export default function FileAttachmentZone({
  formData,
  onFormChange,
  errors
}: FileAttachmentZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string | number, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles: FileAttachment[] = [];
    const errors: string[] = [];

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

  const simulateUpload = (fileId: string | number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Update file status to completed
        const currentAttachments = formData?.attachments || [];
        const updatedAttachments = currentAttachments?.map((att: FileAttachment) => 
          att?.id === fileId ? { ...att, uploadStatus: 'completed' } : att
        );
        onFormChange('attachments', updatedAttachments);
      }
      
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
    }, 200);
  };

  const removeFile = (fileId: string | number) => {
    const currentAttachments = formData?.attachments || [];
    const updatedAttachments = currentAttachments?.filter((att: FileAttachment) => att?.id !== fileId);
    onFormChange('attachments', updatedAttachments);
    
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e?.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e?.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e?.preventDefault();
    setIsDragOver(false);
    const files = e?.dataTransfer?.files;
    handleFileSelect(files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return 'Image';
    if (fileType === 'application/pdf') return 'FileText';
    if (fileType?.includes('word')) return 'FileText';
    if (fileType?.includes('excel') || fileType?.includes('sheet')) return 'FileSpreadsheet';
    if (fileType?.includes('zip') || fileType?.includes('rar')) return 'Archive';
    return 'File';
  };

  const attachments: FileAttachment[] = formData?.attachments || [];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <Icon name="Paperclip" size={20} className="text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Anexos
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Adicione capturas de tela, documentos ou outros arquivos relevantes
          </p>
        </div>
      </div>
      
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef?.current?.click()}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full">
            <Icon name="Upload" size={24} className="text-slate-600 dark:text-slate-400" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
              Clique para selecionar ou arraste arquivos aqui
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Máximo 10MB por arquivo • PDF, DOC, XLS, imagens, ZIP
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            iconName="FolderOpen"
            iconPosition="left"
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
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Arquivos Anexados ({attachments?.length})
          </h4>
          
          <div className="space-y-2">
            {attachments?.map((attachment) => (
              <div key={attachment?.id} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 rounded-lg">
                  <Icon name={getFileIcon(attachment?.type) as any} size={16} className="text-slate-600 dark:text-slate-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {attachment?.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {formatFileSize(attachment?.size)}
                  </p>
                  
                  {attachment?.uploadStatus === 'pending' && uploadProgress?.[attachment?.id] !== undefined && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                        <span>Enviando...</span>
                        <span>{Math.round(uploadProgress?.[attachment?.id])}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress?.[attachment?.id]}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {attachment?.uploadStatus === 'completed' && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Icon name="CheckCircle" size={12} className="text-green-600 dark:text-green-400" />
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Enviado com sucesso
                      </span>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(attachment?.id)}
                  iconName="Trash2"
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* File Guidelines */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
              Diretrizes para Anexos:
            </h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Capturas de tela ajudam a identificar problemas visuais</li>
              <li>• Logs de erro facilitam o diagnóstico técnico</li>
              <li>• Documentos relacionados ao processo em questão</li>
              <li>• Evite anexar informações confidenciais desnecessárias</li>
            </ul>
          </div>
        </div>
      </div>
      
      {errors?.attachments && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-4">
          {errors?.attachments}
        </p>
      )}
    </div>
  );
}