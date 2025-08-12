import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { verifyToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// Demo users for authentication
const DEMO_USERS = [
  {
    id: 'admin-001',
    email: 'admin@empresa.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
    name: 'Administrador',
    role: 'administrador',
    hierarchy: 'administrador',
    department: { id: 'dept-1', name: 'Administração' }
  },
  {
    id: 'supervisor-001',
    email: 'maria.santos@empresa.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: maria123
    name: 'Maria Santos',
    role: 'supervisor',
    hierarchy: 'supervisor',
    department: { id: 'dept-2', name: 'TI' }
  },
  {
    id: 'colaborador-001',
    email: 'ana.costa@empresa.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: ana123
    name: 'Ana Costa',
    role: 'colaborador',
    hierarchy: 'colaborador',
    department: { id: 'dept-3', name: 'Suporte' }
  }
];

// Hash passwords (for demo purposes, these are pre-hashed)
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

// Verify password
const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Generate JWT token
const generateToken = (user: any): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      hierarchy: user.hierarchy
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email e senha são obrigatórios'
      });
    }

    // Import storage to get real users from database
    const { storage } = await import('../storage');
    
    // Find user by email in database
    let user = await storage.getUserByEmail(email);
    
    // If not found in database, check demo users as fallback
    if (!user) {
      const demoUser = DEMO_USERS.find(u => u.email === email);
      if (demoUser) {
        user = demoUser;
      }
    }
    
    if (!user) {
      return res.status(401).json({
        message: 'Credenciais inválidas'
      });
    }

    // Validate password from database using bcrypt
    const bcrypt = await import('bcryptjs');
    let isValidPassword = false;
    
    console.log('Authenticating user:', email);
    console.log('Stored password:', user.password ? user.password.substring(0, 20) + '...' : 'NO PASSWORD');
    
    try {
      if (user.password) {
        // Check if password is already hashed (starts with $2b$)
        if (user.password.startsWith('$2b$')) {
          console.log('Comparing password with bcrypt hash');
          isValidPassword = await bcrypt.compare(password, user.password);
          console.log('Bcrypt comparison result:', isValidPassword);
        } else {
          console.log('Legacy plaintext password detected');
          // Handle legacy plaintext passwords - convert to hash after login
          isValidPassword = (password === user.password);
          if (isValidPassword) {
            // Update with hashed password for future logins
            const hashedPassword = await bcrypt.hash(password, 10);
            await storage.updateUser(user.id, { password: hashedPassword });
            console.log('Password converted to hash for future logins');
          }
        }
      } else {
        console.log('No password stored, checking demo passwords');
        // Fallback for demo users with predefined passwords
        const demoPasswordMap: Record<string, string> = {
          'admin@empresa.com': 'admin123',
          'maria.santos@empresa.com': 'maria123',
          'ana.costa@empresa.com': 'ana123',
          'carlos.oliveira@empresa.com': 'carlos123',
          'felipe.lacerda@grupoopus.com': 'felipe123'
        };
        
        const expectedPassword = demoPasswordMap[email];
        if (expectedPassword && password === expectedPassword) {
          isValidPassword = true;
          console.log('Demo password matched, converting to hash');
          
          // Update user with hashed password for future logins
          const hashedPassword = await bcrypt.hash(password, 10);
          await storage.updateUser(user.id, { password: hashedPassword });
        }
      }
      
    } catch (error) {
      console.error('Password validation error:', error);
      isValidPassword = false;
    }

    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Credenciais inválidas'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Update last login time
    await storage.updateUser(user.id, { lastLoginAt: new Date() });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // For JWT, logout is handled client-side by removing the token
  res.json({
    message: 'Logout realizado com sucesso'
  });
});

// Get current user endpoint
router.get('/user', verifyToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Usuário não encontrado'
      });
    }

    // Find full user data
    const user = DEMO_USERS.find(u => u.id === req.user?.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado no sistema'
      });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', verifyToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Token inválido'
      });
    }

    // Find user
    const user = DEMO_USERS.find(u => u.id === req.user?.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado'
      });
    }

    // Generate new token
    const token = generateToken(user);
    
    res.json({
      message: 'Token renovado com sucesso',
      token
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

export default router;