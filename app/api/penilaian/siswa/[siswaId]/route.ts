import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Get all assessments for a specific student
export async function GET(request: Request, { params }: { params: { siswaId: string } }) {
  const siswaId = parseInt(params.siswaId);

  if (isNaN(siswaId)) {
    return NextResponse.json({ message: 'Invalid student ID' }, { status: 400 });
  }

  try {
    const penilaian = await prisma.penilaian.findMany({
      where: {
        SISWA_ID: siswaId,
      },
      include: {
        siswa: true,
        kriteria: true,
      },
      orderBy: {
        kriteria: {
          NAMA: 'asc',
        },
      },
    });

    return NextResponse.json(penilaian, { status: 200 });
  } catch (error) {
    console.error(`Error fetching penilaian for student ${siswaId}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create or update multiple assessments for a student
export async function POST(request: Request, { params }: { params: { siswaId: string } }) {
  const siswaId = parseInt(params.siswaId);

  if (isNaN(siswaId)) {
    return NextResponse.json({ message: 'Invalid student ID' }, { status: 400 });
  }

  try {
    const { assessments } = await request.json();

    if (!Array.isArray(assessments)) {
      return NextResponse.json({ message: 'Assessments must be an array' }, { status: 400 });
    }

    const results = [];

    for (const assessment of assessments) {
      const { KRITERIA_ID, NILAI } = assessment;

      if (!KRITERIA_ID || NILAI === undefined || NILAI === null) {
        continue; // Skip invalid assessments
      }

      try {
        // Try to update existing assessment first
        const existingPenilaian = await prisma.penilaian.findFirst({
          where: {
            SISWA_ID: siswaId,
            KRITERIA_ID: KRITERIA_ID,
          },
        });

        let result;
        if (existingPenilaian) {
          // Update existing assessment
          result = await prisma.penilaian.update({
            where: {
              ID: existingPenilaian.ID,
            },
            data: {
              NILAI: parseFloat(NILAI),
            },
          });
        } else {
          // Create new assessment
          result = await prisma.penilaian.create({
            data: {
              SISWA_ID: siswaId,
              KRITERIA_ID: KRITERIA_ID,
              NILAI: parseFloat(NILAI),
            },
          });
        }
        results.push(result);
      } catch (error) {
        console.error(`Error processing assessment for criteria ${KRITERIA_ID}:`, error);
      }
    }

    return NextResponse.json({ 
      message: 'Assessments processed successfully',
      results: results,
      processed: results.length,
      total: assessments.length
    }, { status: 200 });
  } catch (error) {
    console.error(`Error processing assessments for student ${siswaId}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
