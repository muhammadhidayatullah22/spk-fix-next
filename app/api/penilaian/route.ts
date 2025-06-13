import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, canWrite } from '@/lib/auth-utils';

// GET: Get all assessments, including related student and criterion data
export async function GET() {
  try {
    // Check authentication
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const penilaian = await prisma.penilaian.findMany({
      include: {
        siswa: true, // Include student data
        kriteria: true, // Include criterion data
      },
    });
    return NextResponse.json(penilaian, { status: 200 });
  } catch (error) {
    console.error('Error fetching penilaian:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new assessment
export async function POST(request: Request) {
  try {
    // Check authentication and authorization
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and guru can create assessments
    if (!canWrite(sessionUser)) {
      return NextResponse.json({ message: 'Forbidden: Only admin and guru can create assessments' }, { status: 403 });
    }

    const { SISWA_ID, KRITERIA_ID, NILAI } = await request.json();

    if (!SISWA_ID || !KRITERIA_ID || NILAI === undefined || NILAI === null) {
      return NextResponse.json({ message: 'SISWA_ID, KRITERIA_ID, and NILAI are required' }, { status: 400 });
    }

    const newPenilaian = await prisma.penilaian.create({
      data: {
        SISWA_ID,
        KRITERIA_ID,
        NILAI: parseFloat(NILAI),
      },
    });

    return NextResponse.json(newPenilaian, { status: 201 });
  } catch (error: any) {
    console.error('Error creating penilaian:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('SISWA_ID') && error.meta?.target?.includes('KRITERIA_ID')) {
      return NextResponse.json({ message: 'Assessment for this student and criterion already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 