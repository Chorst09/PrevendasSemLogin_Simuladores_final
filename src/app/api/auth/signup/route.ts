import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  console.log('Signup request received');
  try {
    const { name, email, password } = await req.json();
    console.log('Request body:', { name, email, password: '***' });

    if (!name || !email || !password) {
      console.log('Validation failed: Missing fields');
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    console.log('Checking for existing user...');
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('User already exists:', email);
      return NextResponse.json({ error: 'Este email já está em uso' }, { status: 409 });
    }

    console.log('Hashing password...');
    const passwordHash = await hashPassword(password);

    console.log('Inserting new user into database...');
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password_hash, password_change_required) 
       VALUES ($1, $2, $3, true) 
       RETURNING id, name, email, role, created_at, password_change_required`,
      [name, email, passwordHash]
    );
    console.log('User created successfully:', newUser.rows[0]);

    return NextResponse.json(newUser.rows[0], { status: 201 });

  } catch (error) {
    console.error('Detailed signup error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
