import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Get assessment by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid assessment ID' }, { status: 400 });
  }

  try {
    const penilaian = await prisma.penilaian.findUnique({
      where: {
        ID: id,
      },
      include: {
        siswa: true,
        kriteria: true,
      },
    });

    if (!penilaian) {
      return NextResponse.json({ message: 'Assessment not found' }, { status: 404 });
    }

    return NextResponse.json(penilaian, { status: 200 });
  } catch (error) {
    console.error(`Error fetching penilaian with ID ${id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update assessment by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid assessment ID' }, { status: 400 });
  }

  try {
    const { SISWA_ID, KRITERIA_ID, NILAI } = await request.json();

    const updatedPenilaian = await prisma.penilaian.update({
      where: {
        ID: id,
      },
      data: {
        SISWA_ID,
        KRITERIA_ID,
        NILAI: parseFloat(NILAI),
      },
    });

    return NextResponse.json(updatedPenilaian, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating penilaian with ID ${id}:`, error);
    if (error.code === 'P2002' && error.meta?.target?.includes('SISWA_ID') && error.meta?.target?.includes('KRITERIA_ID')) {
      return NextResponse.json({ message: 'Assessment for this student and criterion already exists' }, { status: 409 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Assessment not found for update' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete assessment by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid assessment ID' }, { status: 400 });
  }

  try {
    await prisma.penilaian.delete({
      where: {
        ID: id,
      },
    });

    return NextResponse.json({ message: 'Assessment deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting penilaian with ID ${id}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Assessment not found for deletion' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 