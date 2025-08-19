'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          // Redirecionar baseado no role do usuário
          if (data.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/app');
          }
        } else {
          // Não autenticado, redirecionar para login
          router.push('/login');
        }
      } catch (error) {
        // Erro na verificação, redirecionar para login
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Mostrar loading enquanto verifica autenticação
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-600">Verificando autenticação...</p>
      </div>
    </div>
  );
}
