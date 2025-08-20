import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Proposal } from '@/types';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(['admin', 'user'])(request);
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { user } = authResult;

  try {
    let query;
    let values;

    if (user.role === 'admin') {
      query = 'SELECT p.*, u.email as user_email FROM proposals p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC';
      values = [];
    } else {
      query = 'SELECT p.*, u.email as user_email FROM proposals p JOIN users u ON p.user_id = u.id WHERE p.user_id = $1 ORDER BY p.created_at DESC';
      values = [user.userId];
    }

    const result = await pool.query(query, values);

    const proposals: Proposal[] = result.rows.map(row => ({
      id: row.id,
      client: typeof row.client_data === 'string' ? JSON.parse(row.client_data) : row.client_data,
      accountManager: typeof row.account_manager_data === 'string' ? JSON.parse(row.account_manager_data) : row.account_manager_data,
      products: typeof row.products === 'string' ? JSON.parse(row.products) : row.products,
      totalSetup: parseFloat(row.total_setup),
      totalMonthly: parseFloat(row.total_monthly),
      createdAt: new Date(row.created_at).toISOString(),
      status: row.status,
      type: row.type,
      userId: row.user_id,
      userEmail: row.user_email,
    }));

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(['admin', 'user'])(request);
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { user } = authResult;

  try {
    const proposalData: Proposal = await request.json();

    if (!proposalData.id || !proposalData.client || !proposalData.products) {
        return NextResponse.json({ error: 'Dados da proposta inválidos' }, { status: 400 });
    }

    const query = `
      INSERT INTO proposals (id, user_id, client_data, account_manager_data, products, total_setup, total_monthly, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        client_data = EXCLUDED.client_data,
        account_manager_data = EXCLUDED.account_manager_data,
        products = EXCLUDED.products,
        total_setup = EXCLUDED.total_setup,
        total_monthly = EXCLUDED.total_monthly,
        updated_at = CURRENT_TIMESTAMP;
    `;

    const values = [
      proposalData.id,
      user.userId,
      JSON.stringify(proposalData.client),
      JSON.stringify(proposalData.accountManager),
      JSON.stringify(proposalData.products),
      proposalData.totalSetup,
      proposalData.totalMonthly,
      new Date(proposalData.createdAt),
    ];

    await pool.query(query, values);

    return NextResponse.json({ message: 'Proposta salva com sucesso' }, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar proposta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
