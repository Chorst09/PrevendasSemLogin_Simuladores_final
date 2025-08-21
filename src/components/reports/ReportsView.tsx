'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Users, Building, Package } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  status: string;
  totalMonthly: number;
  totalSetup: number;
  createdAt: string;
  userName: string;
  userEmail: string;
  client?: {
    name: string;
    email: string;
    phone: string;
  };
  accountManager?: {
    name: string;
    email: string;
    phone: string;
  };
  products?: Array<{
    name: string;
    type: string;
    setup: number;
    monthly: number;
  }>;
  type?: string;
}

type ReportType = 'all' | 'account-manager' | 'client' | 'product';

export default function ReportsView() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState<ReportType>('all');
  const [filterValue, setFilterValue] = useState('');
  const [accountManagers, setAccountManagers] = useState<string[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch('/api/proposals', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          const proposalsArray = Array.isArray(data) ? data : [];
          
          setProposals(proposalsArray);
          setFilteredProposals(proposalsArray);
          
          // Extrair listas únicas para os filtros
          const uniqueAccountManagers = [...new Set(proposalsArray.map((p: Proposal) => p.accountManager?.name).filter(Boolean))];
          const uniqueClients = [...new Set(proposalsArray.map((p: Proposal) => p.client?.name).filter(Boolean))];
          const uniqueProducts = [...new Set(proposalsArray.flatMap((p: Proposal) => p.products?.map(prod => prod.name) || []))];
          
          setAccountManagers(uniqueAccountManagers);
          setClients(uniqueClients);
          setProducts(uniqueProducts);
          setError(''); // Limpar erro em caso de sucesso
        } else if (response.status === 403) {
          // Erro de permissão
          console.info('Acesso negado aos relatórios. Usuário pode não ter permissões necessárias.');
          setProposals([]);
          setFilteredProposals([]);
          setError('Acesso negado. Verifique suas permissões.');
        } else if (response.status === 404) {
          // API não encontrada
          console.info('API de relatórios não disponível.');
          setProposals([]);
          setFilteredProposals([]);
          setError('Serviço de relatórios temporariamente indisponível.');
        } else {
          // Outros erros HTTP
          console.warn(`Erro HTTP ${response.status} ao buscar propostas`);
          setProposals([]);
          setFilteredProposals([]);
          setError('Erro ao carregar propostas. Tente novamente mais tarde.');
        }
      } catch (err) {
        // Erro de rede ou conexão
        console.info('API de relatórios indisponível:', err);
        setProposals([]);
        setFilteredProposals([]);
        setError('Serviço temporariamente indisponível. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  // Efeito para filtrar propostas quando o tipo de relatório ou filtro mudam
  useEffect(() => {
    let filtered = [...proposals];

    if (reportType === 'account-manager' && filterValue) {
      filtered = proposals.filter(p => p.accountManager?.name === filterValue);
    } else if (reportType === 'client' && filterValue) {
      filtered = proposals.filter(p => p.client?.name === filterValue);
    } else if (reportType === 'product' && filterValue) {
      filtered = proposals.filter(p => 
        p.products?.some(prod => prod.name === filterValue)
      );
    }

    setFilteredProposals(filtered);
  }, [proposals, reportType, filterValue]);

  const handleReportTypeChange = (type: ReportType) => {
    setReportType(type);
    setFilterValue('');
  };

  const generateReport = () => {
    // Lógica para gerar relatório (pode ser expandida para exportar PDF, Excel, etc.)
    console.log('Gerando relatório:', { reportType, filterValue, proposals: filteredProposals });
    alert(`Relatório gerado com ${filteredProposals.length} propostas`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios de Propostas</h2>
          <p className="text-muted-foreground">
            Gere relatórios por gerente de contas, clientes ou produtos
          </p>
        </div>
        <Button onClick={generateReport} className="bg-blue-600 hover:bg-blue-700">
          <FileText className="mr-2 h-4 w-4" />
          Gerar Relatório
        </Button>
      </div>

      {/* Filtros de Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Filtros de Relatório
          </CardTitle>
          <CardDescription>
            Selecione o tipo de relatório e aplique filtros específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={handleReportTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de relatório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Todas as Propostas
                    </div>
                  </SelectItem>
                  <SelectItem value="account-manager">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Por Gerente de Contas
                    </div>
                  </SelectItem>
                  <SelectItem value="client">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Por Cliente
                    </div>
                  </SelectItem>
                  <SelectItem value="product">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Por Produto
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType !== 'all' && (
              <div className="space-y-2">
                <Label htmlFor="filter-value">
                  {reportType === 'account-manager' && 'Gerente de Contas'}
                  {reportType === 'client' && 'Cliente'}
                  {reportType === 'product' && 'Produto'}
                </Label>
                <Select value={filterValue} onValueChange={setFilterValue}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Selecione ${reportType === 'account-manager' ? 'o gerente' : reportType === 'client' ? 'o cliente' : 'o produto'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {reportType === 'account-manager' && accountManagers.map(manager => (
                      <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                    ))}
                    {reportType === 'client' && clients.map(client => (
                      <SelectItem key={client} value={client}>{client}</SelectItem>
                    ))}
                    {reportType === 'product' && products.map(product => (
                      <SelectItem key={product} value={product}>{product}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {reportType === 'all' && 'Todas as Propostas'}
            {reportType === 'account-manager' && `Propostas - Gerente: ${filterValue || 'Todos'}`}
            {reportType === 'client' && `Propostas - Cliente: ${filterValue || 'Todos'}`}
            {reportType === 'product' && `Propostas - Produto: ${filterValue || 'Todos'}`}
            <Badge variant="secondary" className="ml-2">
              {filteredProposals.length} {filteredProposals.length === 1 ? 'proposta' : 'propostas'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {reportType === 'all' && 'Lista completa de propostas criadas por todos os usuários'}
            {reportType === 'account-manager' && 'Propostas filtradas por gerente de contas'}
            {reportType === 'client' && 'Propostas filtradas por cliente'}
            {reportType === 'product' && 'Propostas filtradas por produto'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Gerente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor Mensal</TableHead>
                  <TableHead className="text-right">Valor de Instalação</TableHead>
                  <TableHead>Data de Criação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.length > 0 ? (
                  filteredProposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell className="font-medium">{proposal.id}</TableCell>
                      <TableCell>{proposal.client?.name || 'N/A'}</TableCell>
                      <TableCell>{proposal.accountManager?.name || proposal.userName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {proposal.type || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={proposal.status === 'Aprovada' ? 'default' : 'secondary'}>
                          {proposal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(proposal.totalMonthly)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(proposal.totalSetup)}</TableCell>
                      <TableCell>{formatDate(proposal.createdAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Nenhuma proposta encontrada para os filtros selecionados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
