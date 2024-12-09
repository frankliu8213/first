import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要保护的路由路径
const protectedPaths = [
  '/dashboard',
  '/dashboard/sales',
  '/dashboard/inventory',
  '/dashboard/market',
  '/dashboard/settings',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否是受保护的路径
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // 获取认证token
    const authToken = request.cookies.get('auth_token');

    // 如果没有token，重定向到登录页
    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      // 保存原始URL作为重定向目标
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 如果已登录用户访问登录页，重定向到仪表盘
  if (pathname === '/login') {
    const authToken = request.cookies.get('auth_token');
    if (authToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// 配置匹配的路由
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
  ],
}; 