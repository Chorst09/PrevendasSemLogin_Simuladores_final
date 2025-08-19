import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// Obter todas as configurações
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAuth(['admin'])(request);
    if ('error' in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const result = await pool.query('SELECT setting_key, setting_value FROM settings');
    const settings = result.rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Atualizar configurações
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAuth(['admin'])(request);
    if ('error' in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const settingsToUpdate: { [key: string]: string } = await request.json();

    if (Object.keys(settingsToUpdate).length === 0) {
      return NextResponse.json({ error: 'Nenhuma configuração para atualizar' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const key in settingsToUpdate) {
        const value = settingsToUpdate[key];
        await client.query(
          `INSERT INTO settings (setting_key, setting_value) 
           VALUES ($1, $2) 
           ON CONFLICT (setting_key) 
           DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
          [key, value]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return NextResponse.json({ message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
