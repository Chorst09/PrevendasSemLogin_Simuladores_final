"use client"
import React, { useEffect, useState } from 'react';
import StatCard from './StatCard';
import { Phone, Server, Wifi, Radio } from 'lucide-react';
import { Proposal } from '@/types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

interface DashboardViewProps {
  userId: string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ userId }) => {
    const [proposalCounts, setProposalCounts] = useState({ pabx: 0, vm: 0, fiber: 0, radio: 0 });
    const [barChartData, setBarChartData] = useState<any[]>([]);
    const [lineChartData, setLineChartData] = useState<any[]>([]);
    const { token } = useAuth();

    useEffect(() => {
        const fetchProposals = async () => {
            if (!token) return;
            
            try {
                const response = await fetch('/api/proposals', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
                if (!response.ok) {
                    // Log error and return gracefully
                    return;
                }
                const allProposals: Proposal[] = await response.json();

                const counts = {
                    pabx: allProposals.filter(p => p.type === 'PABX_SIP').length,
                    vm: allProposals.filter(p => p.type === 'VM').length,
                    fiber: allProposals.filter(p => p.type === 'FIBER').length,
                    radio: allProposals.filter(p => p.type === 'RADIO').length,
                };
                setProposalCounts(counts);

                // Prepare data for Bar Chart
                setBarChartData([
                    { name: 'PABX/SIP', total: counts.pabx },
                    { name: 'VMs', total: counts.vm },
                    { name: 'Fibra', total: counts.fiber },
                    { name: 'Rádio', total: counts.radio },
                ]);

                // Prepare data for Line Chart
                const proposalsByDate = allProposals.reduce((acc, proposal) => {
                    const date = new Date(proposal.createdAt).toLocaleDateString('pt-BR');
                    acc[date] = (acc[date] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                const sortedLineData = Object.entries(proposalsByDate)
                    .map(([date, count]) => ({ date, count }))
                    .sort((a, b) => {
                        const dateA = new Date(a.date.split('/').reverse().join('-')).getTime();
                        const dateB = new Date(b.date.split('/').reverse().join('-')).getTime();
                        return dateA - dateB;
                    });

                setLineChartData(sortedLineData);

            } catch (error) {
                console.error("Erro ao carregar dados do dashboard:", error);
            }
        };

        fetchProposals();
    }, [token]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Phone className="w-6 h-6 text-blue-500" />} title="Propostas PABX/SIP" value={proposalCounts.pabx.toString()} subtext="Suas propostas" />
                <StatCard icon={<Server className="w-6 h-6 text-purple-500" />} title="Propostas Máquinas Virtuais" value={proposalCounts.vm.toString()} subtext="Suas propostas" />
                <StatCard icon={<Wifi className="w-6 h-6 text-green-500" />} title="Propostas Link Fibra" value={proposalCounts.fiber.toString()} subtext="Suas propostas" />
                <StatCard icon={<Radio className="w-6 h-6 text-orange-500" />} title="Propostas Link Rádio" value={proposalCounts.radio.toString()} subtext="Suas propostas" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/80 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Propostas por Tipo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                                <Bar dataKey="total" fill="#3b82f6" name="Total de Propostas" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/80 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Evolução das Propostas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                                <Line type="monotone" dataKey="count" stroke="#84cc16" name="Propostas Criadas" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardView;
