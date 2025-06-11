import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Get student by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid student ID' }, { status: 400 });
  }

  try {
    const siswa = await prisma.siswa.findUnique({
      where: {
        ID: id,
      },
    });

    if (!siswa) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(siswa, { status: 200 });
  } catch (error) {
    console.error(`Error fetching siswa with ID ${id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update student by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid student ID' }, { status: 400 });
  }

  try {
    const { NAMA, NIS, KELAS, NAMA_ORANG_TUA, ALAMAT } = await request.json();

    const updatedSiswa = await prisma.siswa.update({
      where: {
        ID: id,
      },
      data: {
        NAMA,
        NIS,
        KELAS,
        NAMA_ORANG_TUA,
        ALAMAT,
      },
    });

    return NextResponse.json(updatedSiswa, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating siswa with ID ${id}:`, error);
    if (error.code === 'P2002' && error.meta?.target?.includes('NIS')) {
      return NextResponse.json({ message: 'NIS already exists' }, { status: 409 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Student not found for update' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete student by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid student ID' }, { status: 400 });
  }

  try {
    await prisma.siswa.delete({
      where: {
        ID: id,
      },
    });

    return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting siswa with ID ${id}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Student not found for deletion' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 