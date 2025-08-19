'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  created_at: string;
}

interface UserReport {
  id: string;
  name: string;
  email: string;
  proposals: Proposal[];
}

export default function ReportsPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const response = await fetch('/api/admin/reports/proposals-by-user');
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        setError('Erro ao carregar o relatório.');
      }
    } catch (e) {
      setError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Button onClick={() => router.push('/admin')} variant="outline" className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao Admin
      </Button>
      <h1 className="text-3xl font-bold mb-6">Relatório de Propostas por Usuário</h1>

      {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="space-y-6">
        {reportData.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              {user.proposals.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Criação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.proposals.map((proposal) => (
                      <TableRow key={proposal.id}>
                        <TableCell>{proposal.title}</TableCell>
                        <TableCell>{proposal.status}</TableCell>
                        <TableCell>{new Date(proposal.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma proposta encontrada para este usuário.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
