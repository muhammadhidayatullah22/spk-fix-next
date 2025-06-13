import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSessionUser, canManageUsers } from '@/lib/auth-utils';

// GET: Get a single user by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
  }

  try {
    // Check authentication
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { ID: id },
      select: { ID: true, NAMA: true, USERNAME: true, ROLE: true } // Jangan sertakan password
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update a user by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
  }

  try {
    // Check authentication and authorization
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only admin can update users
    if (!canManageUsers(sessionUser)) {
      return NextResponse.json({ message: 'Forbidden: Only admin can update users' }, { status: 403 });
    }

    const { NAMA, USERNAME, PASSWORD, ROLE } = await request.json();

    if (!NAMA || !USERNAME || !ROLE) {
      return NextResponse.json({ message: 'NAMA, USERNAME, and ROLE are required' }, { status: 400 });
    }

    // Validate ROLE to be one of the allowed enums
    const allowedRoles = ['admin', 'guru', 'kepala_sekolah'];
    if (!allowedRoles.includes(ROLE)) {
      return NextResponse.json({ message: `Invalid ROLE. Must be one of: ${allowedRoles.join(', ')}` }, { status: 400 });
    }

    const dataToUpdate: { NAMA: string; USERNAME: string; ROLE: string; PASSWORD?: string } = {
      NAMA,
      USERNAME,
      ROLE,
    };

    if (PASSWORD) {
      dataToUpdate.PASSWORD = await bcrypt.hash(PASSWORD, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { ID: id },
      data: dataToUpdate,
      select: { ID: true, NAMA: true, USERNAME: true, ROLE: true } // Jangan sertakan password dalam respons
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('USERNAME')) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }
    if (error.code === 'P2025') { // Not found error
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a user by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
  }

  try {
    // Check authentication and authorization
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only admin can delete users
    if (!canManageUsers(sessionUser)) {
      return NextResponse.json({ message: 'Forbidden: Only admin can delete users' }, { status: 403 });
    }

    await prisma.user.delete({
      where: { ID: id },
    });
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') { // Not found error
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}