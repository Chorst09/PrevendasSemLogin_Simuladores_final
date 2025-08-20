"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ClientManagerInfo } from './ClientManagerInfo';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Wifi,
    Calculator,
    FileText,
    Plus,
    Edit,
    Search,
    Save,
    Download,
    Trash2
} from 'lucide-react';
import { Proposal, ProposalItem, ClientData, AccountManagerData } from '@/types';
import { ClientManagerForm } from './ClientManagerForm';
import { useToast } from '@/hooks/use-toast';

// Interfaces
interface FiberPlan {
    speed: number;
    price12: number;
    price24: number;
    price36: number;
    installationCost: number;
    description: string;
}

interface InstallationTier {
    minValue: number;
    maxValue: number;
    cost: number;
}

interface ContractTerm {
    months: number;
    paybackMonths: number;
}

interface FiberLinkCalculatorProps {
    userRole?: 'admin' | 'user';
    onBackToPanel?: () => void;
    userId: string;
    userEmail: string;
}

const FiberLinkCalculator: React.FC<FiberLinkCalculatorProps> = ({ userRole, onBackToPanel, userId, userEmail }) => {
    // Estados de gerenciamento de propostas
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [viewMode, setViewMode] = useState<'search' | 'client-form' | 'calculator'>('search');
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [prices, setPrices] = useState<{ [key: string]: number }>({});

    const handlePriceChange = (speed: number, priceType: 'price12' | 'price24' | 'price36', value: string) => {
        const numericValue = parseFloat(value.replace(',', '.')) || 0;
        setFiberPlans(prevPlans =>
            prevPlans.map(plan =>
                plan.speed === speed
                    ? { ...plan, [priceType]: numericValue }
                    : plan
            )
        );
    };

    const { toast } = useToast();

    const handleSavePrices = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const response = await fetch('/api/fiber-prices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ fiberPlans }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Falha ao salvar os preços');
            }

            toast({
                title: 'Sucesso',
                description: 'Preços salvos com sucesso',
                variant: 'default'
            });
        } catch (error) {
            console.error('Erro ao salvar preços:', error);
            toast({
                title: 'Erro', 
                description: 'Erro ao salvar os preços',
                variant: 'destructive'
            });
        }
    };

    // Estados dos dados do cliente e gerente
    const [clientData, setClientData] = useState<ClientData>({
        name: '',
        email: '',
        phone: ''
    });
    const [accountManagerData, setAccountManagerData] = useState<AccountManagerData>({
        name: '',
        email: '',
        phone: ''
    });
    const [addedProducts, setAddedProducts] = useState<ProposalItem[]>([]);

    // Estados da calculadora
    const [selectedSpeed, setSelectedSpeed] = useState<number>(0);
    const [contractTerm, setContractTerm] = useState<number>(12);
    const [includeInstallation, setIncludeInstallation] = useState<boolean>(true);
    const [projectValue, setProjectValue] = useState<number>(0);

    const [fiberPlans, setFiberPlans] = useState<FiberPlan[]>([]);

    useEffect(() => {
        const initialFiberPlans: FiberPlan[] = [
            { speed: 25, price12: 720.00, price24: 474.00, price36: 421.00, installationCost: 998.00, description: "25 Mbps" },
            { speed: 30, price12: 740.08, price24: 527.00, price36: 474.00, installationCost: 998.00, description: "30 Mbps" },
            { speed: 40, price12: 915.01, price24: 579.00, price36: 527.00, installationCost: 998.00, description: "40 Mbps" },
            { speed: 50, price12: 1103.39, price24: 632.00, price36: 579.00, installationCost: 998.00, description: "50 Mbps" },
            { speed: 60, price12: 1547.44, price24: 737.00, price36: 632.00, installationCost: 998.00, description: "60 Mbps" },
            { speed: 80, price12: 1825.98, price24: 943.00, price36: 832.00, installationCost: 998.00, description: "80 Mbps" },
            { speed: 100, price12: 2017.05, price24: 1158.00, price36: 948.00, installationCost: 998.00, description: "100 Mbps" },
            { speed: 150, price12: 2543.18, price24: 1474.00, price36: 1211.00, installationCost: 998.00, description: "150 Mbps" },
            { speed: 200, price12: 3215.98, price24: 1737.00, price36: 1368.00, installationCost: 998.00, description: "200 Mbps" },
            { speed: 300, price12: 7522.00, price24: 2316.00, price36: 1685.00, installationCost: 998.00, description: "300 Mbps" },
            { speed: 400, price12: 9469.00, price24: 3053.00, price36: 2421.00, installationCost: 1996.00, description: "400 Mbps" },
            { speed: 500, price12: 11174.00, price24: 3579.00, price36: 2790.00, installationCost: 1996.00, description: "500 Mbps" },
            { speed: 600, price12: 0, price24: 3948.00, price36: 3316.00, installationCost: 1996.00, description: "600 Mbps" },
            { speed: 700, price12: 0, price24: 4368.00, price36: 3684.00, installationCost: 1996.00, description: "700 Mbps" },
            { speed: 800, price12: 0, price24: 4727.00, price36: 4095.00, installationCost: 1996.00, description: "800 Mbps" },
            { speed: 900, price12: 0, price24: 5000.00, price36: 4474.00, installationCost: 1996.00, description: "900 Mbps" },
            { speed: 1000, price12: 17754.00, price24: 5264.00, price36: 4737.00, installationCost: 1996.00, description: "1000 Mbps (1 Gbps)" }
        ];
        setFiberPlans(initialFiberPlans);

        const fetchProposals = async () => {
            try {
                // Get token from localStorage for authentication
                const token = localStorage.getItem('auth-token');
                
                const response = await fetch('/api/proposals?type=FIBER', {
                    headers: {
                        'Content-Type': 'application/json',
                        // Include Authorization header if token exists
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    credentials: 'include', // This will include cookies in the request
                });
                if (response.ok) {
                    const data = await response.json();
                    setProposals(data);
                } else {
                    console.error('Falha ao buscar propostas de Fibra');
                }
            } catch (error) {
                console.error('Erro ao conectar com a API:', error);
            }
        };

        fetchProposals();
    }, []);

    const installationTiers: InstallationTier[] = [
        { minValue: 0, maxValue: 4500, cost: 998.00 },
        { minValue: 4500.01, maxValue: 8000, cost: 1996.00 },
        { minValue: 8000.01, maxValue: 12000, cost: 2500.00 }
    ];

    const contractTerms: ContractTerm[] = [
        { months: 12, paybackMonths: 8 },
        { months: 24, paybackMonths: 10 },
        { months: 36, paybackMonths: 11 },
        { months: 48, paybackMonths: 13 },
        { months: 60, paybackMonths: 14 }
    ];

    // Funções de cálculo
    const getMonthlyPrice = (plan: FiberPlan, term: number): number => {
        switch (term) {
            case 12: return plan.price12;
            case 24: return plan.price24;
            case 36: return plan.price36;
            default: return plan.price36;
        }
    };

    const getInstallationCost = (speed: number): number => {
        const plan = fiberPlans.find(p => p.speed === speed);
        return plan ? plan.installationCost : 0;
    };

    const calculateResult = () => {
        const plan = fiberPlans.find(p => p.speed === selectedSpeed);
        if (!plan) return null;

        const monthlyPrice = getMonthlyPrice(plan, contractTerm);
        if (monthlyPrice === 0) return null; // Plano não disponível para este prazo

        const installationCost = includeInstallation ? getInstallationCost(selectedSpeed) : 0;
        const contractInfo = contractTerms.find(c => c.months === contractTerm);

        return {
            plan,
            monthlyPrice,
            installationCost,
            contractInfo,
            totalFirstMonth: monthlyPrice + installationCost
        };
    };

    const result = calculateResult();

    // Funções auxiliares
    const formatCurrency = (value: number | undefined | null) => {
        if (value === undefined || value === null) return 'R$ 0,00';
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    };
    const generateUniqueId = () => `_${Math.random().toString(36).substr(2, 9)}`;

    // Gerenciamento de produtos
    const handleAddProduct = () => {
        if (result) {
            const description = `Link via Fibra ${result.plan.description} - Contrato ${contractTerm} meses${includeInstallation ? ' (com instalação)' : ''}`;

            setAddedProducts(prev => [...prev, {
                id: generateUniqueId(),
                name: `Link via Fibra ${result.plan.description}`,
                description,
                unitPrice: result.monthlyPrice,
                setup: result.installationCost,
                monthly: result.monthlyPrice,
                quantity: 1,
                details: {
                    type: 'FIBER',
                    speed: selectedSpeed,
                    contractTerm,
                    includeInstallation,
                    paybackMonths: result.contractInfo?.paybackMonths || 0
                }
            }]);
        }
    };

    const handleRemoveProduct = (id: string) => {
        setAddedProducts(prev => prev.filter(p => p.id !== id));
    };


    const totalSetup = addedProducts.reduce((sum, p) => sum + p.setup, 0);
    const totalMonthly = addedProducts.reduce((sum, p) => sum + p.monthly, 0);

    const clearForm = () => {
        setClientData({ name: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setAddedProducts([]);
        setSelectedSpeed(0);
        setContractTerm(12);
        setIncludeInstallation(true);
        setProjectValue(0);
    };

    const createNewProposal = () => {
        clearForm();
        setCurrentProposal(null);
        setViewMode('client-form');
    };

    const editProposal = (proposal: Proposal) => {
        setCurrentProposal(proposal);
        setClientData(proposal.client || proposal.clientData || { name: '', email: '', phone: '' });
        setAccountManagerData(proposal.accountManager || proposal.accountManagerData || { name: '', email: '', phone: '' });
        setAddedProducts(proposal.products);
        setViewMode('calculator');
    };

    const saveProposal = async () => {
        if (addedProducts.length === 0) {
            alert('Adicione pelo menos um produto à proposta.');
            return;
        }

        const proposalToSave = {
            id: currentProposal?.id || generateUniqueId(), // Gera ID se for nova proposta
            client: clientData,
            accountManager: accountManagerData,
            products: addedProducts,
            totalSetup: totalSetup,
            totalMonthly: totalMonthly,
            createdAt: new Date().toISOString(),
            user_id: userId,
            status: 'Pendente',
            type: 'FIBER',
        };

        try {
            console.log('Dados sendo enviados para a API:', proposalToSave);
            
            const token = localStorage.getItem('auth-token');
            const response = await fetch('/api/proposals', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(proposalToSave),
                credentials: 'include'
            });

            console.log('Status da resposta:', response.status);

            if (response.ok) {
                const savedProposal = await response.json();
                if (currentProposal) {
                    // Atualiza a proposta na lista
                    setProposals(prev => prev.map(p => p.id === savedProposal.id ? savedProposal : p));
                } else {
                    // Adiciona nova proposta à lista
                    setProposals(prev => [...prev, savedProposal]);
                }
                alert('Proposta salva com sucesso!');
                
                setViewMode('search');
                setCurrentProposal(null);
                clearForm();
            } else {
                const errorData = await response.json();
                console.error('Erro da API:', errorData);
                console.error('Status:', response.status);
                throw new Error(errorData.error || 'Falha ao salvar a proposta');
            }
        } catch (error) {
            console.error('Erro ao salvar proposta:', error);
            alert(`Erro ao salvar proposta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    };

    const cancelAction = () => {
        setViewMode('search');
        setCurrentProposal(null);
        clearForm();
    };

    const filteredProposals = (proposals || []).filter(p =>
        ((p.client?.name || p.clientData?.name || '').toLowerCase()).includes(searchTerm.toLowerCase()) ||
        (p.id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handlePrint = () => window.print();

    // Se estiver na tela de formulário do cliente, mostrar o formulário
    if (viewMode === 'client-form') {
        return (
            <ClientManagerForm
                clientData={clientData}
                accountManagerData={accountManagerData}
                onClientDataChange={setClientData}
                onAccountManagerDataChange={setAccountManagerData}
                onBack={() => setViewMode('search')}
                onContinue={() => setViewMode('calculator')}
                title="Nova Proposta - Link via Fibra"
                subtitle="Preencha os dados do cliente e gerente de contas para continuar."
            />
        );
    }

    return (
        <>
            <div className="p-4 md:p-8 print-hide">
                {viewMode === 'search' ? (
                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                        <CardHeader>
                            <CardTitle>Buscar Propostas - Link via Fibra</CardTitle>
                            <CardDescription>Encontre propostas existentes ou crie uma nova.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-4">
                                <Input
                                    type="text"
                                    placeholder="Buscar por cliente ou ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                                <Button onClick={createNewProposal} className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />Nova Proposta
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-700">
                                            <TableHead className="text-white">ID</TableHead>
                                            <TableHead className="text-white">Cliente</TableHead>
                                            <TableHead className="text-white">Data</TableHead>
                                            <TableHead className="text-white">Total Mensal</TableHead>
                                            <TableHead className="text-white">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProposals.map((p, index) => (
                                            <TableRow key={p.id || `proposal-${index}`} className="border-slate-800">
                                                <TableCell>{p.id || 'N/A'}</TableCell>
                                                <TableCell>{p.client?.name || p.clientData?.name || 'N/D'}</TableCell>
                                                <TableCell>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                                                <TableCell>{formatCurrency(p.totalMonthly)}</TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm" onClick={() => editProposal(p)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Calculadora Link via Fibra</h1>
                                    <p className="text-slate-400 mt-2">Configure e calcule os custos para links de fibra óptica</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {onBackToPanel && (
                                        <Button
                                            variant="outline"
                                            onClick={onBackToPanel}
                                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                        >
                                            ← Voltar ao Painel
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => setViewMode('search')}
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    >
                                        ← Voltar para Buscar
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Informações do Cliente e Gerente */}
                            <ClientManagerInfo 
                                clientData={clientData}
                                accountManagerData={accountManagerData}
                            />
                        </div>

                        <Tabs defaultValue="calculator" className="w-full">
                            <TabsList className={`grid w-full ${userRole === 'admin' ? 'grid-cols-2' : 'grid-cols-1'} bg-slate-800`}>
                                <TabsTrigger value="calculator">Calculadora</TabsTrigger>
                                {userRole === 'admin' && <TabsTrigger value="list-price">Tabela de Preços</TabsTrigger>}
                            </TabsList>

                            <TabsContent value="calculator">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                                    {/* Calculadora */}
                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <Wifi className="mr-2" />Link via Fibra
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="speed">Velocidade</Label>
                                                    <Select onValueChange={(value) => setSelectedSpeed(Number(value))} value={selectedSpeed.toString()}>
                                                        <SelectTrigger className="bg-slate-700">
                                                            <SelectValue placeholder="Selecione a velocidade" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 text-white">
                                                            {fiberPlans.map((plan) => (
                                                                <SelectItem key={plan.speed} value={plan.speed.toString()}>
                                                                    {plan.description}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label className="text-white font-medium mb-3 block">Prazo Contratual</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[12, 24, 36, 48, 60].map((months) => (
                                                            <Button
                                                                key={months}
                                                                variant={contractTerm === months ? "default" : "outline"}
                                                                onClick={() => setContractTerm(months)}
                                                                className={`px-6 py-2 ${
                                                                    contractTerm === months
                                                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                                        : "border-slate-600 text-slate-300 hover:bg-slate-700"
                                                                }`}
                                                            >
                                                                {months} Meses
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2 pt-2">
                                                    <Checkbox
                                                        id="includeInstallation"
                                                        checked={includeInstallation}
                                                        onCheckedChange={(checked) => setIncludeInstallation(!!checked)}
                                                        className="border-white"
                                                    />
                                                    <label htmlFor="includeInstallation" className="text-sm font-medium leading-none">
                                                        Incluir Taxa de Instalação
                                                    </label>
                                                </div>

                                                <div>
                                                    <Label htmlFor="project-value">Valor do Projeto (opcional)</Label>
                                                    <Input
                                                        id="project-value"
                                                        type="number"
                                                        value={projectValue || ''}
                                                        onChange={(e) => setProjectValue(Number(e.target.value))}
                                                        className="bg-slate-700"
                                                        placeholder="Para cálculo da taxa de instalação"
                                                    />
                                                </div>
                                            </div>

                                            {result && (
                                                <div className="mt-6">
                                                    <Separator className="bg-slate-700 my-4" />
                                                    <div className="text-lg font-bold mb-2">Resultado:</div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span>Velocidade:</span>
                                                            <span>{result.plan.description}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Prazo:</span>
                                                            <span>{contractTerm} meses (Retorno: {result.contractInfo?.paybackMonths} meses)</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Taxa de Instalação:</span>
                                                            <span>{formatCurrency(result.installationCost)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-green-400 font-bold">
                                                            <span>Valor Mensal:</span>
                                                            <span>{formatCurrency(result.monthlyPrice)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-blue-400 font-bold">
                                                            <span>Total 1º Mês:</span>
                                                            <span>{formatCurrency(result.totalFirstMonth)}</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={handleAddProduct}
                                                        className="w-full mt-4 bg-green-600 hover:bg-green-700"
                                                    >
                                                        Adicionar à Proposta
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Lista de Produtos */}
                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                        <CardHeader>
                                            <CardTitle>Produtos Adicionados</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {addedProducts.length === 0 ? (
                                                <p className="text-slate-400">Nenhum produto adicionado ainda.</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {addedProducts.map((product) => (
                                                        <div key={product.id} className="border border-slate-700 rounded p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-semibold">{product.description}</h4>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveProduct(product.id)}
                                                                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="text-sm space-y-1">
                                                                <div className="flex justify-between">
                                                                    <span>Setup:</span>
                                                                    <span>{formatCurrency(product.setup)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Mensal:</span>
                                                                    <span>{formatCurrency(product.monthly)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <Separator className="bg-slate-700" />
                                                    <div className="space-y-2 font-bold">
                                                        <div className="flex justify-between">
                                                            <span>Total Setup:</span>
                                                            <span>{formatCurrency(totalSetup)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-green-400">
                                                            <span>Total Mensal:</span>
                                                            <span>{formatCurrency(totalMonthly)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {userRole === 'admin' && (
                            <TabsContent value="list-price">
                                <Card className="bg-slate-900/80 border-slate-800 text-white mt-6">
                                    <CardHeader>
                                        <CardTitle>Tabela de Preços - Link via Fibra</CardTitle>
                                        <CardDescription>Valores de referência baseados na velocidade e prazo do contrato.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-8">
                                            {/* Tabela Principal */}
                                            <div>
                                                <h3 className="text-xl font-semibold mb-4 text-center">
                                                    <span className="bg-green-600 text-white px-2 py-1 rounded">FIBRA</span>
                                                    <span className="text-red-500 ml-2">SEM PARCEIRO INDICADOR</span>
                                                </h3>
                                                <div className="overflow-x-auto">
                                                    <Table className="min-w-full border-collapse">
                                                        <TableHeader>
                                                            <TableRow className="bg-blue-900">
                                                                <TableHead rowSpan={2} className="text-white font-bold border border-slate-500 text-center p-2">Velocidade Mbps</TableHead>
                                                                <TableHead colSpan={3} className="text-white font-bold border border-slate-500 text-center p-2">Prazos</TableHead>
                                                                <TableHead rowSpan={2} className="text-white font-bold border border-slate-500 text-center p-2">Taxa Instalação</TableHead>
                                                            </TableRow>
                                                            <TableRow className="bg-blue-800">
                                                                <TableHead className="text-white font-bold border border-slate-500 text-center p-2">12</TableHead>
                                                                <TableHead className="text-white font-bold border border-slate-500 text-center p-2">24</TableHead>
                                                                <TableHead className="text-white font-bold border border-slate-500 text-center p-2">36</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {fiberPlans.map((plan) => (
                                                                <TableRow key={plan.speed} className="border-slate-800">
                                                                    <TableCell className="font-semibold border border-slate-600 text-center p-2 align-middle">
                                                                        {plan.speed}
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-1">
                                                                        <Input
                                                                            type="text"
                                                                            value={plan.price12 > 0 ? plan.price12.toFixed(2).replace('.', ',') : ''}
                                                                            onChange={(e) => handlePriceChange(plan.speed, 'price12', e.target.value)}
                                                                            className="bg-slate-700 text-center w-28 mx-auto"
                                                                            placeholder="N/A"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-1">
                                                                        <Input
                                                                            type="text"
                                                                            value={plan.price24 > 0 ? plan.price24.toFixed(2).replace('.', ',') : ''}
                                                                            onChange={(e) => handlePriceChange(plan.speed, 'price24', e.target.value)}
                                                                            className="bg-slate-700 text-center w-28 mx-auto"
                                                                            placeholder="N/A"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-1">
                                                                        <Input
                                                                            type="text"
                                                                            value={plan.price36 > 0 ? plan.price36.toFixed(2).replace('.', ',') : ''}
                                                                            onChange={(e) => handlePriceChange(plan.speed, 'price36', e.target.value)}
                                                                            className="bg-slate-700 text-center w-28 mx-auto"
                                                                            placeholder="N/A"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-2 align-middle">
                                                                        {formatCurrency(plan.installationCost)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                                <div className="flex justify-end mt-6">
                                                    <Button onClick={handleSavePrices} className="bg-blue-600 hover:bg-blue-700">
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Salvar Preços
                                                    </Button>
                                                </div>
                                                <div className="mt-4 text-sm text-blue-400">
                                                    <p>*** Produto Duplo - Adicionar 50% ao valor da mensalidade de RÁDIO.</p>
                                                    <p>*** Se reembolso de Parceiro Indicador - Adicionar 20% ao preço.</p>
                                                </div>
                                            </div>

                                            {/* Tabela de Taxa de Instalação */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4">Valores Taxa de Instalação</h3>
                                                <div className="max-w-md">
                                                    <Table className="border-collapse">
                                                        <TableHeader>
                                                            <TableRow className="bg-slate-800">
                                                                <TableHead className="text-white font-bold border border-slate-500 p-2">Orçamentos</TableHead>
                                                                <TableHead className="text-white font-bold border border-slate-500 p-2">Valor</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            <TableRow>
                                                                <TableCell className="border border-slate-600 p-2">Até R$ 4.500,00</TableCell>
                                                                <TableCell className="border border-slate-600 p-2 text-center">998,00</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="border border-slate-600 p-2">De 4.500,01 a 8.000,00</TableCell>
                                                                <TableCell className="border border-slate-600 p-2 text-center">1.996,00</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="border border-slate-600 p-2">De 8.000,01 a 12.000,00</TableCell>
                                                                <TableCell className="border border-slate-600 p-2 text-center">2.500,00</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="border border-slate-600 p-2">Acima R$ 12 mil</TableCell>
                                                                <TableCell className="border border-slate-600 p-2 text-center">Verificar com a controladoria</TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>

                                            {/* Informações de Contrato */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4">Informações de Contrato</h3>
                                                <div className="space-y-1 text-sm">
                                                    <p>Contratos de 12 meses - Retorno 08 meses</p>
                                                    <p>Contratos de 24 meses - Retorno 10 meses</p>
                                                    <p>Contratos de 36 meses - Retorno 11 meses</p>
                                                    <p>Contratos de 48 meses - Retorno 13 meses</p>
                                                    <p>Contratos de 60 meses - Retorno 14 meses</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            )}
                        </Tabs>

                        {/* Botões de Ação */}
                        <div className="flex gap-4 mt-6">
                            <Button onClick={saveProposal} className="bg-green-600 hover:bg-green-700">
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Proposta
                            </Button>
                            <Button onClick={handlePrint} variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Imprimir
                            </Button>
                            <Button onClick={cancelAction} variant="outline">
                                Cancelar
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default FiberLinkCalculator;