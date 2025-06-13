import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSessionUser, canManageUsers } from '@/lib/auth-utils';

// GET: Get all users
export async function GET() {
  try {
    // Check authentication and authorization
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only users with read access can view users (all roles can read)
    const users = await prisma.user.findMany({
      select: { ID: true, NAMA: true, USERNAME: true, ROLE: true } // Jangan sertakan password
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication and authorization
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only admin can create users
    if (!canManageUsers(sessionUser)) {
      return NextResponse.json({ message: 'Forbidden: Only admin can create users' }, { status: 403 });
    }

    const { NAMA, USERNAME, PASSWORD, ROLE } = await request.json();

    if (!NAMA || !USERNAME || !PASSWORD || !ROLE) {
      return NextResponse.json({ message: 'NAMA, USERNAME, PASSWORD, and ROLE are required' }, { status: 400 });
    }

    // Validate ROLE to be one of the allowed enums
    const allowedRoles = ['admin', 'guru', 'kepala_sekolah'];
    if (!allowedRoles.includes(ROLE)) {
      return NextResponse.json({ message: `Invalid ROLE. Must be one of: ${allowedRoles.join(', ')}` }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    const newUser = await prisma.user.create({
      data: {
        NAMA,
        USERNAME,
        PASSWORD: hashedPassword,
        ROLE,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('USERNAME')) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 