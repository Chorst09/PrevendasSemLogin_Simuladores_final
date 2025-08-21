'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('Login attempt started', { email, password: '***' });

    try {
      console.log('Iniciando requisição de login para:', email);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Status da resposta:', response.status);
      
      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      console.log('Content-Type da resposta:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Resposta inesperada (não é JSON):', text.substring(0, 200));
        throw new Error('Resposta do servidor não é um JSON válido');
      }
      
      const data = await response.json().catch(error => {
        console.error('Erro ao fazer parse do JSON:', error);
        throw new Error('Erro ao processar a resposta do servidor');
      });
      
      console.log('Dados da resposta:', data);

      if (!response.ok) {
        console.log('Login failed:', data.error);
        setError(data.error || 'Erro ao fazer login');
        return;
      }

      // Salvar token no localStorage
      if (data.token) {
        localStorage.setItem('auth-token', data.token);
        console.log('Token saved successfully');
      }

      console.log('User data:', data.user);
      
      // Verificar se é necessário alterar a senha
      if (data.requiresPasswordChange) {
        console.log('Password change required, redirecting to /change-password');
        router.push('/change-password');
        return;
      }

      // Redirecionar baseado no role
      if (data.user.role === 'admin') {
        console.log('Redirecting to /admin');
        router.push('/admin');
      } else {
        console.log('Redirecting to /app');
        router.push('/app');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
          
          <div className="mt-4 flex justify-between text-sm">
            {/* Removed the 'Não tem uma conta? Cadastre-se' link as requested */}
            <Link href="/forgot-password" className="underline">
              Esqueci a senha
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}