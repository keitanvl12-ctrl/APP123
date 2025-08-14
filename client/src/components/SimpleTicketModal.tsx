import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, AlertCircle, Paperclip, Upload } from 'lucide-react';

interface SimpleTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Department {
  id: string;
  name: string;
  categories: Category[];
}

interface Category {
  id: string;
  name: string;
  customFields: CustomField[];
}

interface CustomField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options?: string[];
}

export default function SimpleTicketModal({ isOpen, onClose }: SimpleTicketModalProps) {
  const [formData, setFormData] = useState({
    subject: '',
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    requesterDepartment: '',
    responsibleDepartment: '',
    category: '',
    subcategory: '',
    priority: 'Média',
    description: '',
    attachments: [] as File[],
    customFields: {} as Record<string, string>
  });
  
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
    enabled: isOpen
  });

  // Buscar categorias filtradas por departamento responsável
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories/department', formData.responsibleDepartment],
    enabled: isOpen && !!formData.responsibleDepartment
  });

  // Buscar subcategorias baseadas na categoria selecionada
  const { data: subcategories = [] } = useQuery<any[]>({
    queryKey: ['/api/subcategories', selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const response = await fetch(`/api/subcategories?categoryId=${selectedCategoryId}`);
      if (!response.ok) throw new Error('Erro ao buscar subcategorias');
      return response.json();
    },
    enabled: isOpen && !!selectedCategoryId,
  });

  // Buscar campos customizados baseados na subcategoria selecionada
  const { data: customFields = [] } = useQuery<CustomField[]>({
    queryKey: ['/api/custom-fields/subcategory', selectedSubcategoryId],
    queryFn: async () => {
      if (!selectedSubcategoryId) return [];
      console.log("🔍 Buscando campos customizados para subcategoria:", selectedSubcategoryId);
      const response = await fetch(`/api/custom-fields/subcategory/${selectedSubcategoryId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erro ao buscar campos customizados');
      const fields = await response.json();
      console.log("✅ Campos customizados encontrados:", fields);
      return fields;
    },
    enabled: isOpen && !!selectedSubcategoryId,
  });

  // Buscar dados do usuário logado
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: isOpen
  });

  // Auto-preencher dados do usuário quando o modal abrir
  useEffect(() => {
    if (isOpen && currentUser) {
      const fullName = currentUser.firstName && currentUser.lastName 
        ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
        : currentUser.name || '';
      
      setFormData(prev => ({
        ...prev,
        requesterName: fullName,
        requesterEmail: currentUser.email || '',
        requesterDepartment: currentUser.departmentId || '' // Auto-preenchido e travado
      }));
    }
  }, [isOpen, currentUser]);
  
  if (!isOpen) return null;

  const handleDepartmentChange = (departmentId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      responsibleDepartment: departmentId,
      category: '',
      subcategory: '',
      customFields: {}
    }));
    setSelectedCategory(null);
    setSelectedCategoryId('');
    setSelectedSubcategoryId('');
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    setSelectedCategory(category || null);
    setSelectedCategoryId(categoryId);
    setFormData(prev => ({ 
      ...prev, 
      category: categoryId,
      subcategory: '', // Reset subcategoria quando categoria muda
      customFields: {} // Limpar campos customizados ao trocar categoria
    }));
    setSelectedSubcategoryId(''); // Reset subcategoria selecionada
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    setFormData(prev => ({ 
      ...prev, 
      subcategory: subcategoryId,
      customFields: {} // Limpar campos customizados ao trocar subcategoria
    }));
  };

  const handleResponsibleDepartmentChange = (departmentId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      responsibleDepartment: departmentId,
      category: '', // Limpar categoria ao trocar departamento responsável
      subcategory: '', // Limpar subcategoria também
      customFields: {} // Limpar campos customizados
    }));
    setSelectedCategory(null);
    setSelectedCategoryId('');
    setSelectedSubcategoryId('');
  };

  const handleCustomFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldId]: value
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Ticket criado com sucesso!');
        onClose();
        setFormData({
          subject: '',
          requesterName: '',
          requesterEmail: '',
          requesterPhone: '',
          requesterDepartment: '',
          responsibleDepartment: '',
          category: '',
          subcategory: '',
          priority: 'Média',
          description: '',
          attachments: [],
          customFields: {}
        });
        setSelectedCategoryId('');
        setSelectedSubcategoryId('');
      } else {
        alert('Erro ao criar ticket');
      }
    } catch (error) {
      alert('Erro ao criar ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(to right, #eff6ff, #eef2ff)'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>Novo Ticket</h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '4px 0 0 0'
            }}>Preencha os campos abaixo para criar seu ticket</p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {/* Grid de campos principais */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}>
              {/* Assunto */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Assunto <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              {/* Nome do Solicitante */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Nome Completo <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.requesterName}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                    cursor: 'not-allowed'
                  }}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  E-mail <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.requesterEmail}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                    cursor: 'not-allowed'
                  }}
                  required
                />
              </div>

              {/* Telefone */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.requesterPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, requesterPhone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Departamento Solicitante */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Departamento Solicitante <span style={{ color: '#ef4444' }}>*</span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    fontWeight: 'normal',
                    display: 'block'
                  }}>
                    (Seu departamento)
                  </span>
                </label>
                <select
                  value={formData.requesterDepartment}
                  readOnly
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                    cursor: 'not-allowed'
                  }}
                  required
                >
                  <option value="">Carregando...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Departamento Responsável */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Departamento Responsável <span style={{ color: '#ef4444' }}>*</span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    fontWeight: 'normal',
                    display: 'block'
                  }}>
                    (Qual departamento deve atender este ticket)
                  </span>
                </label>
                <select
                  value={formData.responsibleDepartment}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                  required
                >
                  <option value="">Selecione o departamento que deve atender</option>
                  {departments.filter(dept => dept.isResponsible).map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoria */}
              {formData.responsibleDepartment && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Categoria <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                    required
                  >
                    <option value="">Selecione a categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subcategoria */}
              {formData.category && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Subcategoria <span style={{ color: '#ef4444' }}>*</span>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#6b7280', 
                      fontWeight: 'normal',
                      display: 'block'
                    }}>
                      (Especifique o tipo da solicitação)
                    </span>
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                    required
                  >
                    <option value="">Selecione a subcategoria</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Prioridade */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Prioridade <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                  required
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>
            </div>

            {/* Campos Customizados por Subcategoria */}
            {selectedSubcategoryId && customFields && customFields.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '16px',
                  borderBottom: '2px solid #e5e7eb',
                  paddingBottom: '8px'
                }}>
                  Informações Específicas
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gap: '16px'
                }}>
                  {customFields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <div key={field.id}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '6px'
                        }}>
                          {field.name} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                        </label>
                        {field.type === 'text' && (
                          <input
                            type="text"
                            value={formData.customFields[field.id] || ''}
                            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                            placeholder={field.placeholder || `Digite ${field.name.toLowerCase()}`}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}
                            required={field.required}
                          />
                        )}
                        {field.type === 'textarea' && (
                          <textarea
                            value={formData.customFields[field.id] || ''}
                            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                            placeholder={field.placeholder || `Digite ${field.name.toLowerCase()}`}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              minHeight: '80px',
                              resize: 'vertical'
                            }}
                            required={field.required}
                          />
                        )}
                        {field.type === 'select' && field.options && (
                          <select 
                            value={formData.customFields[field.id] || ''}
                            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              backgroundColor: 'white'
                            }}
                            required={field.required}
                          >
                            <option value="">{field.placeholder || `Selecione ${field.name.toLowerCase()}`}</option>
                            {field.options.map((option, idx) => (
                              <option key={idx} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Campos dinâmicos baseados na categoria - Sistema Antigo */}
            {selectedCategory && selectedCategory.customFields && selectedCategory.customFields.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '16px',
                  borderBottom: '2px solid #e5e7eb',
                  paddingBottom: '8px'
                }}>
                  Informações Específicas
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  {selectedCategory.customFields.map((field) => (
                    <div key={field.id}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        {field.name} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                      </label>
                      {field.type === 'select' && field.options ? (
                        <select
                          value={formData.customFields[field.id] || ''}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            backgroundColor: 'white'
                          }}
                          required={field.required}
                        >
                          <option value="">Selecione...</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          value={formData.customFields[field.id] || ''}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            minHeight: '80px',
                            resize: 'vertical'
                          }}
                          required={field.required}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={formData.customFields[field.id] || ''}
                          onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Descrição */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Descrição <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Descreva detalhadamente o problema ou solicitação..."
                required
              />
            </div>

            {/* Anexos */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Anexos
              </label>
              
              {/* Área de upload */}
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                marginBottom: '12px'
              }}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
                />
                <label
                  htmlFor="file-upload"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Upload style={{ width: '24px', height: '24px', color: '#6b7280' }} />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    Clique para selecionar arquivos ou arraste aqui
                  </span>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    PDF, DOC, DOCX, JPG, PNG, TXT, XLS, XLSX (máx. 10MB cada)
                  </span>
                </label>
              </div>

              {/* Lista de arquivos selecionados */}
              {formData.attachments.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginBottom: '8px' 
                  }}>
                    Arquivos selecionados:
                  </p>
                  {formData.attachments.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '6px',
                        marginBottom: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Paperclip style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                        <span style={{ fontSize: '14px', color: '#374151' }}>
                          {file.name}
                        </span>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        style={{
                          padding: '4px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          color: '#ef4444'
                        }}
                      >
                        <X style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botões */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '20px'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {isSubmitting ? 'Criando...' : 'Criar Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}