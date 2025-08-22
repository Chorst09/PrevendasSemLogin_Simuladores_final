import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/login', 
    '/signup', 
    '/forgot-password', 
    '/reset-password',
    '/change-password',
    '/api/auth/login', 
    '/api/auth/signup', 
    '/api/auth/forgot-password', 
    '/api/auth/reset-password',
    '/api/auth/change-password'
  ];
  
  // Rotas que precisam de autenticação
  const protectedRoutes = ['/', '/app', '/admin', '/dashboard', '/api/users', '/api/proposals'];
  
  // Rotas que precisam de permissão de admin
  const adminRoutes = ['/admin', '/api/users', '/api/auth/register'];
  

  // Verificar se é uma rota pública
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar se é uma rota protegida
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('[Middleware] Tentando verificar o token...');

    if (!token) {
      console.log('[Middleware] Token não encontrado. Redirecionando para /login.');
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Token não fornecido' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifyToken(token);
    console.log('[Middleware] Payload do token:', payload);
    if (!payload) {
      console.log('[Middleware] Token inválido (payload nulo). Redirecionando para /login.');
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Token inválido' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verificar se precisa de permissão de admin
    if (adminRoutes.some(route => pathname.startsWith(route)) && payload.role !== 'admin') {
      console.log('[Middleware] Acesso não autorizado a rota de admin.');
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Acesso não autorizado' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/app', request.url));
    }

    // Adicionar informações do usuário aos headers para as API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-email', payload.email);
    response.headers.set('x-user-role', payload.role);
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};