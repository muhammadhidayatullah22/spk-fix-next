import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Get all students
export async function GET() {
  try {
    const siswa = await prisma.siswa.findMany();
    return NextResponse.json(siswa, { status: 200 });
  } catch (error) {
    console.error('Error fetching siswa:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new student
export async function POST(request: Request) {
  try {
    const { NAMA, NIS, KELAS, NAMA_ORANG_TUA, ALAMAT } = await request.json();

    if (!NAMA || !NIS || !KELAS) {
      return NextResponse.json({ message: 'NAMA, NIS, and KELAS are required' }, { status: 400 });
    }

    const newSiswa = await prisma.siswa.create({
      data: {
        NAMA,
        NIS,
        KELAS,
        NAMA_ORANG_TUA,
        ALAMAT,
      },
    });

    return NextResponse.json(newSiswa, { status: 201 });
  } catch (error: any) {
    console.error('Error creating siswa:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('NIS')) {
      return NextResponse.json({ message: 'NIS already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 