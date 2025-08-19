import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAuth(['admin'])(request);
    if ('error' in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        COALESCE(
          (
            SELECT json_agg(p.*)
            FROM proposals p
            WHERE p.user_id = u.id
          ), '[]'::json
        ) as proposals
      FROM users u
      ORDER BY u.name;
    `;

    const result = await pool.query(query);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erro ao gerar relatório de propostas por usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
