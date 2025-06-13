import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, canWrite } from '@/lib/auth-utils';

// GET: Get a single criterion by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid Kriteria ID' }, { status: 400 });
  }

  try {
    // Check authentication
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const kriteria = await prisma.kriteria.findUnique({
      where: { ID: id },
    });

    if (!kriteria) {
      return NextResponse.json({ message: 'Kriteria not found' }, { status: 404 });
    }

    return NextResponse.json(kriteria, { status: 200 });
  } catch (error) {
    console.error('Error fetching kriteria by ID:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update a criterion by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid Kriteria ID' }, { status: 400 });
  }

  try {
    // Check authentication and authorization
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and guru can update criteria
    if (!canWrite(sessionUser)) {
      return NextResponse.json({ message: 'Forbidden: Only admin and guru can update criteria' }, { status: 403 });
    }

    const { NAMA, BOBOT, JENIS } = await request.json();

    if (!NAMA || !BOBOT || !JENIS) {
      return NextResponse.json({ message: 'NAMA, BOBOT, and JENIS are required' }, { status: 400 });
    }

    // Validate JENIS to be either 'cost' or 'benefit'
    if (JENIS !== 'cost' && JENIS !== 'benefit') {
      return NextResponse.json({ message: "JENIS must be 'cost' or 'benefit'" }, { status: 400 });
    }

    const updatedKriteria = await prisma.kriteria.update({
      where: { ID: id },
      data: {
        NAMA,
        BOBOT: parseFloat(BOBOT),
        JENIS,
      },
    });

    return NextResponse.json(updatedKriteria, { status: 200 });
  } catch (error: any) {
    console.error('Error updating kriteria:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('NAMA')) {
      return NextResponse.json({ message: 'Kriteria NAMA already exists' }, { status: 409 });
    }
    if (error.code === 'P2025') { // Not found error
      return NextResponse.json({ message: 'Kriteria not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a criterion by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid Kriteria ID' }, { status: 400 });
  }

  try {
    // Check authentication and authorization
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and guru can delete criteria
    if (!canWrite(sessionUser)) {
      return NextResponse.json({ message: 'Forbidden: Only admin and guru can delete criteria' }, { status: 403 });
    }

    await prisma.kriteria.delete({
      where: { ID: id },
    });
    return NextResponse.json({ message: 'Kriteria deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting kriteria:', error);
    if (error.code === 'P2025') { // Not found error
      return NextResponse.json({ message: 'Kriteria not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}