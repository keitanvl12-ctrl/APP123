// Mock hook para simular autenticação durante desenvolvimento
export function useAuth() {
  // Este é um mock temporário que sempre retorna um usuário admin autenticado
  const mockUser = {
    id: '4c44ccfc-aca0-474f-b589-4d823d203600',
    username: 'admin',
    name: 'Administrador',
    email: 'admin@empresa.com',
    roleId: '1', // Será preenchido dinamicamente
    departmentId: undefined,
    role: 'admin', // Compatibilidade reversa
    isActive: true,
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
  };
}