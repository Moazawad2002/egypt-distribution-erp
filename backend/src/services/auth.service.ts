import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { memoryStore } from '../db/memory-store.js';
import { AuthUser } from '../types/index.js';

export class AuthService {
  async authenticate(username: string, passwordPlain: string): Promise<{ token: string; refreshToken: string; user: AuthUser }> {
    const user = memoryStore.users.find(
      u => (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) && u.isActive
    );

    if (!user) {
      throw new Error('Invalid username or password');
    }

    const passwordMatches = bcrypt.compareSync(passwordPlain, user.passwordHash);
    if (!passwordMatches) {
      throw new Error('Invalid username or password');
    }

    const branch = user.branchId ? memoryStore.branches.find(b => b.id === user.branchId) : null;

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId,
      branchCode: branch ? branch.code : null,
      permissions: user.permissions
    };

    const token = jwt.sign(authUser, config.jwtSecret, { expiresIn: '12h' });
    const refreshToken = jwt.sign({ id: user.id }, config.jwtRefreshSecret, { expiresIn: '7d' });

    // Log login audit
    memoryStore.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: user.id,
      username: user.username,
      branchId: user.branchId,
      action: 'LOGIN',
      entityName: 'AUTH_SESSION',
      details: { username: user.username, role: user.role },
      timestamp: new Date().toISOString()
    });

    return { token, refreshToken, user: authUser };
  }

  async getCurrentUser(userId: string): Promise<AuthUser | null> {
    const user = memoryStore.users.find(u => u.id === userId && u.isActive);
    if (!user) return null;
    const branch = user.branchId ? memoryStore.branches.find(b => b.id === user.branchId) : null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId,
      branchCode: branch ? branch.code : null,
      permissions: user.permissions
    };
  }
}

export const authService = new AuthService();
