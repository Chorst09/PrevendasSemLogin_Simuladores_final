'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm';

export default function ChangePasswordPage() {
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
        } else {
          const data = await response.json();
          if (!data.user?.password_change_required) {
            router.push('/app');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          Alteração de Senha Obrigatória
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Por questões de segurança, você precisa alterar sua senha antes de acessar o sistema.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
