import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token e nova senha são obrigatórios' }, { status: 400 });
    }

    // Hash do token recebido para comparar com o do banco
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Encontrar o token no banco de dados
    const { rows: tokenRows } = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE token_hash = $1',
      [hashedToken]
    );

    const savedToken = tokenRows[0];

    if (!savedToken) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 400 });
    }

    // Verificar se o token expirou
    if (new Date(savedToken.expires_at) < new Date()) {
      // Limpar token expirado
      await pool.query('DELETE FROM password_reset_tokens WHERE id = $1', [savedToken.id]);
      return NextResponse.json({ error: 'Token expirado' }, { status: 400 });
    }

    // Hash da nova senha
    const newPasswordHash = await hashPassword(password);

    // Atualizar a senha do usuário
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      newPasswordHash,
      savedToken.user_id,
    ]);

    // Deletar o token após o uso
    await pool.query('DELETE FROM password_reset_tokens WHERE id = $1', [savedToken.id]);

    return NextResponse.json({ message: 'Senha redefinida com sucesso' });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
