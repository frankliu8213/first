import { User, LoginCredentials, AuthResponse } from '@/types/auth';

// 模拟API调用延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟用户数据
const MOCK_USER: User = {
  id: '1',
  email: 'admin@medical.com',
  name: 'Admin User',
  role: 'admin',
  permissions: ['read:all', 'write:all'],
};

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // 模拟API调用
  await delay(1000);
  
  // 简单的验证逻辑
  if (credentials.email === 'admin@medical.com' && credentials.password === 'admin123') {
    const token = 'mock_jwt_token_' + Math.random();
    
    // 使用原生 cookie 方法
    document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
    localStorage.setItem('user', JSON.stringify(MOCK_USER));
    
    return {
      user: MOCK_USER,
      token,
    };
  }
  
  throw new Error('Invalid credentials');
}

export function logout(): void {
  // 删除 cookie
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
  return match ? match[2] : null;
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
} 