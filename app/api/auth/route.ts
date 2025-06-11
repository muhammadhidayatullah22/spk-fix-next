import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const user = await prisma.user.findUnique({ where: { USERNAME: username } });
  if (!user || !(await bcrypt.compare(password, user.PASSWORD))) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const response = NextResponse.json({ message: 'Login successful' });
  
  // Simpan sesi di cookie (misalnya ID user)
  response.cookies.set('session_user', JSON.stringify({
    id: user.ID,
    nama: user.NAMA,
    username: user.USERNAME,
    role: user.ROLE,
  }), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 1 hari
  });

  return response;
}


export async function DELETE() {
  const response = NextResponse.json({ message: 'Logout successful' });

  // Hapus cookie sesi
  response.cookies.set('session_user', '', { maxAge: 0, path: '/' });

  return response;
}