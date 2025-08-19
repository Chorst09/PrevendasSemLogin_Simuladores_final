import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendMail } from '@/lib/email';
import crypto from 'crypto';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const { rows: users } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = users[0];

    if (!user) {
      // Não revele que o usuário não existe por segurança
      return NextResponse.json({ message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.' });
    }

    // Gerar token de redefinição
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Definir data de expiração (e.g., 1 hora)
    const expiresAt = new Date(Date.now() + 3600000);

    // Salvar token no banco de dados
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, hashedToken, expiresAt]
    );

    // Enviar email com o link de redefinição
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    await sendMail({
      to: user.email,
      subject: 'Redefinição de Senha',
      text: `Você solicitou a redefinição de senha. Clique neste link para criar uma nova senha: ${resetUrl}`,
      html: `<p>Você solicitou a redefinição de senha. Clique neste <a href="${resetUrl}">link</a> para criar uma nova senha.</p>`,
    });

    return NextResponse.json({ message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
