import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { NAMA, USERNAME, PASSWORD, ROLE } = await request.json();

    // Validation
    if (!NAMA || !USERNAME || !PASSWORD || !ROLE) {
      return NextResponse.json({ 
        message: 'Nama, username, password, dan role harus diisi' 
      }, { status: 400 });
    }

    // Validate password length
    if (PASSWORD.length < 6) {
      return NextResponse.json({ 
        message: 'Password harus minimal 6 karakter' 
      }, { status: 400 });
    }

    // Validate ROLE to be one of the allowed enums
    const allowedRoles = ['admin', 'guru', 'kepala_sekolah'];
    if (!allowedRoles.includes(ROLE)) {
      return NextResponse.json({ 
        message: `Role tidak valid. Harus salah satu dari: ${allowedRoles.join(', ')}` 
      }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { USERNAME }
    });

    if (existingUser) {
      return NextResponse.json({ 
        message: 'Username sudah digunakan' 
      }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        NAMA,
        USERNAME,
        PASSWORD: hashedPassword,
        ROLE,
      },
      select: {
        ID: true,
        NAMA: true,
        USERNAME: true,
        ROLE: true
      }
    });

    return NextResponse.json({
      message: 'Registrasi berhasil',
      user: newUser
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error during registration:', error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002' && error.meta?.target?.includes('USERNAME')) {
      return NextResponse.json({ 
        message: 'Username sudah digunakan' 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      message: 'Terjadi kesalahan server' 
    }, { status: 500 });
  }
}
