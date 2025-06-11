import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Siswa {
  ID: number;
  NAMA: string;
  NIS: string;
  KELAS: string;
}

interface Kriteria {
  ID: number;
  NAMA: string;
  BOBOT: number;
  JENIS: 'cost' | 'benefit';
}

interface Penilaian {
  ID: number;
  SISWA_ID: number;
  KRITERIA_ID: number;
  NILAI: number;
  SISWA?: Siswa;
  KRITERIA?: Kriteria;
}

export async function GET() {
  try {
    const siswaList = await prisma.siswa.findMany();
    const kriteriaList = await prisma.kriteria.findMany();
    const penilaianList = await prisma.penilaian.findMany({
      include: {
        siswa: true,
        kriteria: true,
      },
    });

    if (siswaList.length === 0 || kriteriaList.length === 0 || penilaianList.length === 0) {
      return NextResponse.json({ message: 'Not enough data to perform SAW calculation. Please add students, criteria, and assessments.' }, { status: 400 });
    }

    const results: { siswa: Siswa; totalScore: number }[] = [];

    for (const siswa of siswaList) {
      let totalScore = 0;
      for (const kriteria of kriteriaList) {
        const penilaian = penilaianList.find(
          (p) => p.SISWA_ID === siswa.ID && p.KRITERIA_ID === kriteria.ID
        );

        if (penilaian) {
          let normalizedValue = 0;
          // Normalization
          if (kriteria.JENIS === 'benefit') {
            const maxVal = Math.max(
              ...penilaianList
                .filter((p) => p.KRITERIA_ID === kriteria.ID)
                .map((p) => p.NILAI)
            );
            normalizedValue = maxVal > 0 ? penilaian.NILAI / maxVal : 0;
          } else { // cost
            const minVal = Math.min(
              ...penilaianList
                .filter((p) => p.KRITERIA_ID === kriteria.ID)
                .map((p) => p.NILAI)
            );
            normalizedValue = penilaian.NILAI > 0 ? minVal / penilaian.NILAI : 0; // Avoid division by zero
          }

          // Weighted sum
          totalScore += normalizedValue * parseFloat(kriteria.BOBOT.toString());
        }
      }
      results.push({ siswa, totalScore });
    }

    // Sort by totalScore in descending order
    results.sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error calculating SAW results:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 