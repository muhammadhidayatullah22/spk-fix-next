import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Get all criteria
export async function GET() {
  try {
    const kriteria = await prisma.kriteria.findMany();
    return NextResponse.json(kriteria, { status: 200 });
  } catch (error) {
    console.error('Error fetching kriteria:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new criterion
export async function POST(request: Request) {
  try {
    const { NAMA, BOBOT, JENIS } = await request.json();

    if (!NAMA || !BOBOT || !JENIS) {
      return NextResponse.json({ message: 'NAMA, BOBOT, and JENIS are required' }, { status: 400 });
    }

    // Validate TIPE to be either 'cost' or 'benefit'
    if (JENIS !== 'cost' && JENIS !== 'benefit') {
      return NextResponse.json({ message: "JENIS must be 'cost' or 'benefit'" }, { status: 400 });
    }

    const newKriteria = await prisma.kriteria.create({
      data: {
        NAMA,
        BOBOT: parseFloat(BOBOT),
        JENIS,
      },
    });

    return NextResponse.json(newKriteria, { status: 201 });
  } catch (error: any) {
    console.error('Error creating kriteria:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('NAMA')) {
      return NextResponse.json({ message: 'Kriteria NAMA already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 