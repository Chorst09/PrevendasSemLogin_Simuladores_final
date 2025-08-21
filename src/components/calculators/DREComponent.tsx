"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Tabelas de comissão baseadas nos prints
const vendorCommissionTable = [
  { months: 12, commission: 1.2 },
  { months: 24, commission: 2.4 },
  { months: 36, commission: 3.6 },
  { months: 48, commission: 4.8 },
  { months: 60, commission: 5.0 }
];

const partnerIndicatorCommissionTable = [
  { minValue: 0, maxValue: 500, months24: 1.5, months24Plus: 2.5 },
  { minValue: 500.01, maxValue: 1000, months24: 2.5, months24Plus: 4.0 },
  { minValue: 1000.01, maxValue: 1500, months24: 4.01, months24Plus: 5.5 },
  { minValue: 1500.01, maxValue: 3000, months24: 5.51, months24Plus: 7.0 },
  { minValue: 3000.01, maxValue: 5000, months24: 7.01, months24Plus: 8.0 },
  { minValue: 5000.01, maxValue: 6500, months24: 8.01, months24Plus: 9.0 },
  { minValue: 6500.01, maxValue: 9000, months24: 9.01, months24Plus: 9.5 },
  { minValue: 9000.01, maxValue: Infinity, months24: 9.51, months24Plus: 10.0 }
];

const taxRates = {
  banda: 2.09,
  fundraising: 0.0,
  rate: 24,
  pis: 1.65,
  cofins: 7.60,
  margin: 15,
  csll: 9,
  irpj: 15,
  custoDesp: 10
};

interface DREComponentProps {
  monthlyRevenue: number;
  setupRevenue: number;
  contractPeriod: number;
  projectCost: number;
  installationRate: number;
  hasPartnerIndicator?: boolean;
}

export const DREComponent: React.FC<DREComponentProps> = ({
  monthlyRevenue,
  setupRevenue,
  contractPeriod,
  projectCost,
  installationRate,
  hasPartnerIndicator = false
}) => {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Cálculos DRE
  const totalRevenue = monthlyRevenue * contractPeriod;
  
  // Comissão vendedor - não aplicar se há parceiro indicador
  // Fórmula: valor da mensalidade * percentual da tabela * prazo do contrato
  const vendorCommission = !hasPartnerIndicator ? (vendorCommissionTable.find(c => c.months === contractPeriod)?.commission || 0) : 0;
  const vendorCommissionValue = (monthlyRevenue * vendorCommission * contractPeriod) / 100;
  
  // Comissão parceiro indicador - só aplicar se checkbox estiver marcado
  const partnerCommissionRate = partnerIndicatorCommissionTable.find(
    p => monthlyRevenue >= p.minValue && monthlyRevenue <= p.maxValue
  );
  const partnerCommissionPercentage = hasPartnerIndicator && contractPeriod >= 24 
    ? (partnerCommissionRate?.months24Plus || 0) 
    : hasPartnerIndicator && contractPeriod < 24
    ? (partnerCommissionRate?.months24 || 0)
    : 0;
  const partnerCommissionValue = (totalRevenue * partnerCommissionPercentage) / 100;

  // Impostos
  const bandaValue = (totalRevenue * taxRates.banda) / 100;
  const fundraisingValue = (totalRevenue * taxRates.fundraising) / 100;
  const pisValue = (totalRevenue * taxRates.pis) / 100;
  const cofinsValue = (totalRevenue * taxRates.cofins) / 100;
  const csllValue = (totalRevenue * taxRates.csll) / 100;
  const irpjValue = (totalRevenue * taxRates.irpj) / 100;
  const custoDesp = (totalRevenue * taxRates.custoDesp) / 100;

  // Totais
  const totalCommissions = vendorCommissionValue + partnerCommissionValue;
  const totalTaxes = bandaValue + fundraisingValue + pisValue + cofinsValue + csllValue + irpjValue + custoDesp;
  const totalCosts = projectCost + installationRate + totalCommissions + totalTaxes;
  const balance = totalRevenue + setupRevenue - totalCosts;
  const profitabilityPercentage = ((balance / (totalRevenue + setupRevenue)) * 100);
  const lucratividade = profitabilityPercentage > 0 ? profitabilityPercentage : 0;

  // Payback calculation
  const paybackMonths = balance > 0 ? Math.ceil((projectCost + installationRate) / (monthlyRevenue - (monthlyRevenue * (totalTaxes + totalCommissions) / totalRevenue))) : 0;

  const dreData = [
    { period: '12 Meses', revenue: monthlyRevenue * 12, setup: setupRevenue, projectCost, installationCost: installationRate },
    { period: '24 Meses', revenue: monthlyRevenue * 24, setup: setupRevenue, projectCost, installationCost: installationRate },
    { period: '36 Meses', revenue: monthlyRevenue * 36, setup: setupRevenue, projectCost, installationCost: installationRate },
    { period: '48 Meses', revenue: monthlyRevenue * 48, setup: setupRevenue, projectCost, installationCost: installationRate },
    { period: '60 Meses', revenue: monthlyRevenue * 60, setup: setupRevenue, projectCost, installationCost: installationRate }
  ];

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span>📊</span>
          DRE - Demonstrativo de Resultado do Exercício
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Tabela de Comissão Vendedores */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Tabela Comissão Vendedores</h3>
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="bg-slate-800">
                <TableHead className="text-white font-bold border border-slate-500 p-2">Meses</TableHead>
                <TableHead className="text-white font-bold border border-slate-500 p-2">% Comissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorCommissionTable.map((item) => (
                <TableRow key={item.months}>
                  <TableCell className="border border-slate-600 p-2 text-white">{item.months}</TableCell>
                  <TableCell className="border border-slate-600 p-2 text-center text-white">{item.commission}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Tabela de Comissão Parceiro Indicador */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Tabela Comissão Parceiro Indicador</h3>
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="bg-slate-800">
                <TableHead className="text-white font-bold border border-slate-500 p-2">Valores - Receita Mensal</TableHead>
                <TableHead className="text-white font-bold border border-slate-500 p-2">Até 24 Meses</TableHead>
                <TableHead className="text-white font-bold border border-slate-500 p-2">24 Meses ou Mais</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerIndicatorCommissionTable.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="border border-slate-600 p-2 text-white">
                    {item.maxValue === Infinity 
                      ? `Acima de ${formatCurrency(item.minValue)}`
                      : `${formatCurrency(item.minValue)} a ${formatCurrency(item.maxValue)}`
                    }
                  </TableCell>
                  <TableCell className="border border-slate-600 p-2 text-center text-white">{item.months24}%</TableCell>
                  <TableCell className="border border-slate-600 p-2 text-center text-white">{item.months24Plus}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* DRE Principal */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">DRE - Período: {contractPeriod} Meses</h3>
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="bg-slate-800">
                <TableHead className="text-white font-bold border border-slate-500 p-2">Descrição</TableHead>
                <TableHead className="text-white font-bold border border-slate-500 p-2 text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-green-900">
                <TableCell className="border border-slate-600 p-2 text-white font-semibold">Receita Mensal</TableCell>
                <TableCell className="border border-slate-600 p-2 text-right text-white font-semibold">{formatCurrency(monthlyRevenue)}</TableCell>
              </TableRow>
              <TableRow className="bg-green-900">
                <TableCell className="border border-slate-600 p-2 text-white font-semibold">Taxa Instalação</TableCell>
                <TableCell className="border border-slate-600 p-2 text-right text-white font-semibold">{formatCurrency(setupRevenue)}</TableCell>
              </TableRow>
              <TableRow className="bg-green-900">
                <TableCell className="border border-slate-600 p-2 text-white font-semibold">Custo do Projeto</TableCell>
                <TableCell className="border border-slate-600 p-2 text-right text-white font-semibold">{formatCurrency(projectCost)}</TableCell>
              </TableRow>
              <TableRow className="bg-green-900">
                <TableCell className="border border-slate-600 p-2 text-white font-semibold">Custo de banda</TableCell>
                <TableCell className="border border-slate-600 p-2 text-right text-white font-semibold">{formatCurrency(installationRate)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border border-slate-600 p-2 text-white">Fundraising</TableCell>
                <TableCell className="border border-slate-600 p-2 text-right text-white">{formatCurrency(fundraisingValue)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border border-slate-600 p-2 text-white">Taxa Mensal</TableCell>
                <TableCell className="border border-slate-600 p-2 text-right text-white">{formatCurrency(0)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border border-slate-600 p-2 text-white">PIS</TableCell>
                <TableCell className="border border-slate-600 p-2 text-right text-white">{formatCurrency(pisValue)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border border-slate-600 p-2 text-white">Cofins</TableCell>
                <TableCell className="border border-slate-600 p-2 text-right text-white">{formatCurrency(cofinsValue)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border border-slate-600 p-2 text-white">CSLL</TableCell>
                <TableCell className="border border-slate-600 p-2 text-right text-white">{formatCurrency(csllValue)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border border-slate-600 p-2 text-white">IRPJ</TableCell>
                <TableCell className="border border-slate-600 p-2 text-right text-white">{formatCurrency(irpjValue)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border border-slate-600 p-2 text-white">
                  {!hasPartnerIndicator ? `Comissão Vendedor (${vendorCommission}%)` : `Comissão Parceiro Indicador (${partnerCommissionPercentage}%)`}
                </TableCell>
                <TableCell className="border border-slate-600 p-2 text-right text-white">{formatCurrency(totalCommissions)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border border-slate-600 p-2 text-white">Custo / Despesas</TableCell>
                <TableCell className="border border-slate-600 p-2 text-right text-white">{formatCurrency(custoDesp)}</TableCell>
              </TableRow>
              <TableRow className="bg-slate-800">
                <TableCell className="border border-slate-600 p-2 text-white font-bold">Balance</TableCell>
                <TableCell className={`border border-slate-600 p-2 text-right font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(balance)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-slate-800">
                <TableCell className="border border-slate-600 p-2 text-white font-bold">Rentabilidade %</TableCell>
                <TableCell className={`border border-slate-600 p-2 text-right font-bold ${profitabilityPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercentage(profitabilityPercentage)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-slate-800">
                <TableCell className="border border-slate-600 p-2 text-white font-bold">Lucratividade</TableCell>
                <TableCell className={`border border-slate-600 p-2 text-right font-bold ${lucratividade >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercentage(lucratividade)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Tabela de Impostos */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Impostos</h3>
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="bg-slate-800">
                <TableHead className="text-white font-bold border border-slate-500 p-2">Banda</TableHead>
                <TableHead className="text-white font-bold border border-slate-500 p-2">Fundraising</TableHead>
                <TableHead className="text-white font-bold border border-slate-500 p-2">Rate</TableHead>
                <TableHead className="text-white font-bold border border-slate-500 p-2">PIS</TableHead>
                <TableHead className="text-white font-bold border border-slate-500 p-2">Cofins</TableHead>
                <TableHead className="text-white font-bold border border-slate-500 p-2">Margem</TableHead>
                <TableHead className="text-white font-bold border border-slate-500 p-2">CSLL</TableHead>
                <TableHead className="text-white font-bold border border-slate-500 p-2">IRPJ</TableHead>
                <TableHead className="text-white font-bold border border-slate-500 p-2">Custo/Desp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="border border-slate-600 p-2 text-center text-white">{taxRates.banda}%</TableCell>
                <TableCell className="border border-slate-600 p-2 text-center text-white">{taxRates.fundraising}%</TableCell>
                <TableCell className="border border-slate-600 p-2 text-center text-white">{taxRates.rate}</TableCell>
                <TableCell className="border border-slate-600 p-2 text-center text-white">{taxRates.pis}%</TableCell>
                <TableCell className="border border-slate-600 p-2 text-center text-white">{taxRates.cofins}%</TableCell>
                <TableCell className="border border-slate-600 p-2 text-center text-white">{taxRates.margin}%</TableCell>
                <TableCell className="border border-slate-600 p-2 text-center text-white">{taxRates.csll}%</TableCell>
                <TableCell className="border border-slate-600 p-2 text-center text-white">{taxRates.irpj}%</TableCell>
                <TableCell className="border border-slate-600 p-2 text-center text-white">{taxRates.custoDesp}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Análise Financeira */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Análise Financeira</h3>
          <div className="bg-slate-800 p-6 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                  <span className="text-slate-300">Receita Bruta Mensal:</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(monthlyRevenue)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                  <span className="text-slate-300">Receita Total do Contrato ({contractPeriod}m):</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                  <span className="text-slate-300">Taxa de Setup:</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(setupRevenue)}</span>
                </div>
                {!hasPartnerIndicator && vendorCommissionValue > 0 && (
                  <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                    <span className="text-slate-300">Comissão Vendedor ({vendorCommission}%):</span>
                    <span className="text-red-400 font-semibold">-{formatCurrency(vendorCommissionValue)}</span>
                  </div>
                )}
                {hasPartnerIndicator && partnerCommissionValue > 0 && (
                  <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                    <span className="text-slate-300">Comissão Parceiro Indicador ({partnerCommissionPercentage}%):</span>
                    <span className="text-red-400 font-semibold">-{formatCurrency(partnerCommissionValue)}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                  <span className="text-slate-300 font-bold">Receita Líquida Total:</span>
                  <span className={`font-bold text-lg ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(balance)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-600 pb-2">
                  <span className="text-slate-300">Receita Líquida Mensal Média:</span>
                  <span className={`font-semibold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(balance / contractPeriod)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-bold">Margem Líquida:</span>
                  <span className={`font-bold text-lg ${profitabilityPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(profitabilityPercentage)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payback */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-white">Payback</h3>
          <p className="text-2xl font-bold text-green-400">{paybackMonths} meses</p>
        </div>

      </CardContent>
    </Card>
  );
};

export default DREComponent;
