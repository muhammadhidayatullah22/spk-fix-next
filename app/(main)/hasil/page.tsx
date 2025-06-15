'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { canRead, User } from '@/lib/rbac';

interface SiswaResult {
  ID: number;
  NAMA: string;
  NIS: string;
  KELAS: string;
}

interface SawResult {
  siswa: SiswaResult;
  totalScore: number;
}

export default function HasilPage() {
  const [results, setResults] = useState<SawResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [showTopOnly, setShowTopOnly] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/hasil');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch SAW results');
      }
      const data: SawResult[] = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handlePrint = () => {
    // Check if there's data to print
    if (displayResults.length === 0) {
      alert('Tidak ada data untuk dicetak.');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup diblokir. Silakan izinkan popup untuk mencetak.');
      return;
    }

    // Get the print content
    const printContent = printRef.current;
    if (!printContent) {
      alert('Konten tidak ditemukan.');
      printWindow.close();
      return;
    }

    // Create print HTML
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hasil Penentuan Siswa Berprestasi</title>
          <style>
            @page {
              margin: 1.5cm;
              size: A4;
            }

            body {
              font-family: 'Times New Roman', serif;
              font-size: 12px;
              line-height: 1.4;
              color: black;
              background: white;
              margin: 0;
              padding: 0;
            }

            .print-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid black;
              padding-bottom: 10px;
            }

            .print-header h1 {
              font-size: 18px;
              margin: 0 0 5px 0;
              font-weight: bold;
            }

            .print-header p {
              font-size: 14px;
              margin: 0;
              color: #666;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }

            th, td {
              border: 1px solid black;
              padding: 8px 4px;
              text-align: left;
              font-size: 11px;
            }

            th {
              background-color: #f0f0f0;
              font-weight: bold;
              font-size: 10px;
              text-transform: uppercase;
            }

            .status-badge {
              padding: 2px 4px;
              border: 1px solid black;
              font-size: 9px;
              display: inline-block;
            }

            .print-footer {
              text-align: center;
              margin-top: 20px;
              border-top: 1px solid black;
              padding-top: 10px;
              font-size: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Hasil Penentuan Siswa Berprestasi</h1>
            <p>Metode Simple Additive Weighting (SAW)</p>
            <p style="font-size: 10px; margin-top: 5px;">
              Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Peringkat</th>
                <th>Nama Siswa</th>
                <th>NIS</th>
                <th>Kelas</th>
                <th>Nilai SAW</th>
              </tr>
            </thead>
            <tbody>
              ${displayResults.map((result, index) => {
                const originalIndex = results.findIndex(r => r.siswa.ID === result.siswa.ID);
                let status = 'Standar';
                if (index < 3) status = 'Berprestasi';
                else if (index < 10) status = 'Potensial';

                return `
                  <tr>
                    <td>${originalIndex + 1}</td>
                    <td>${result.siswa.NAMA}</td>
                    <td>${result.siswa.NIS}</td>
                    <td>${result.siswa.KELAS}</td>
                    <td>${(result.totalScore || 0).toFixed(4)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Write content and print
    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleDownloadPDF = async () => {
    // Check if there's data to download
    if (displayResults.length === 0) {
      alert('Tidak ada data untuk didownload.');
      return;
    }

    setIsDownloading(true);

    try {
      // Dynamic import untuk menghindari error saat build
      const html2pdf = (await import('html2pdf.js')).default;

      const element = printRef.current;
      if (!element) {
        alert('Elemen tidak ditemukan.');
        return;
      }

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `hasil-siswa-berprestasi-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          ignoreElements: (element: Element) => {
            // Skip elements that might have problematic CSS
            return element.classList.contains('print:hidden') ||
                   element.classList.contains('no-print');
          },
          onclone: (clonedDoc: Document) => {
            // Remove problematic CSS that uses modern color functions
            const style = clonedDoc.createElement('style');
            style.textContent = `
              * {
                color: rgb(0, 0, 0) !important;
                background-color: rgb(255, 255, 255) !important;
                border-color: rgb(209, 213, 219) !important;
              }
              .bg-blue-50 { background-color: rgb(239, 246, 255) !important; }
              .bg-green-50 { background-color: rgb(240, 253, 244) !important; }
              .bg-yellow-50 { background-color: rgb(254, 252, 232) !important; }
              .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
              .text-blue-600 { color: rgb(37, 99, 235) !important; }
              .text-green-600 { color: rgb(22, 163, 74) !important; }
              .text-yellow-600 { color: rgb(217, 119, 6) !important; }
              .text-gray-600 { color: rgb(75, 85, 99) !important; }
              .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
              .bg-gradient-to-r { background: linear-gradient(to right, rgb(37, 99, 235), rgb(147, 197, 253)) !important; }
            `;
            clonedDoc.head.appendChild(style);
          }
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait' as 'portrait'
        }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF. Silakan gunakan tombol Cetak sebagai alternatif.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Get unique classes for filter
  const uniqueKelas = Array.from(new Set(results.map(result => result.siswa.KELAS))).sort();

  // Filter results based on search term, selected class, and top performers
  const filteredResults = results.filter(result => {
    const matchesSearch = result.siswa.NAMA.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.siswa.NIS.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKelas = selectedKelas === '' || result.siswa.KELAS === selectedKelas;
    return matchesSearch && matchesKelas;
  });

  // Apply top performers filter
  const displayResults = showTopOnly ? filteredResults.slice(0, 10) : filteredResults;

  // Get medal for top 3
  const getMedal = (index: number) => {
    switch (index) {
      case 0: return { emoji: '🥇', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 1: return { emoji: '🥈', color: 'text-gray-600', bg: 'bg-gray-50' };
      case 2: return { emoji: '🥉', color: 'text-orange-600', bg: 'bg-orange-50' };
      default: return null;
    }
  };

  // Check if user can read results
  if (!canRead(user as User, 'results')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Akses Ditolak</h3>
          <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman hasil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 print:hidden">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hasil Penentuan Siswa Berprestasi</h1>
          <p className="text-gray-600">Metode Simple Additive Weighting (SAW)</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center" role="alert">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Siswa</p>
                <p className="text-2xl font-semibold text-gray-900">{results.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Nilai Tertinggi</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {results.length > 0 ? (results[0]?.totalScore || 0).toFixed(4) : '0.0000'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Jumlah Kelas</p>
                <p className="text-2xl font-semibold text-gray-900">{uniqueKelas.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Cari Siswa</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Nama atau NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">Filter Kelas</label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="block w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Semua Kelas</option>
              {uniqueKelas.map(kelas => (
                <option key={kelas} value={kelas}>{kelas}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tampilan</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showTopOnly}
                  onChange={(e) => setShowTopOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Top 10 saja</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Aksi</label>
            <div className="space-y-2">
              <button
                onClick={handlePrint}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors print:hidden"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors print:hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Membuat PDF...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* Print-only content */}
        <div ref={printRef} className="print-content">
          {/* Print Header - Hidden on screen, visible on print */}
          <div className="hidden print:block print:text-center print:mb-6">
            <h1 className="text-2xl font-bold text-black mb-2">Hasil Penentuan Siswa Berprestasi</h1>
            <p className="text-gray-700 mb-2">Metode Simple Additive Weighting (SAW)</p>
            <p className="text-sm text-gray-600">
              Dicetak pada: {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Menghitung hasil SAW...</span>
            </div>
          </div>
        ) : displayResults.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || selectedKelas ? 'Tidak ada hasil yang ditemukan' : 'Belum ada hasil perhitungan'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedKelas
                ? 'Coba ubah filter pencarian'
                : 'Pastikan data siswa, kriteria, dan penilaian sudah lengkap'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peringkat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai SAW</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayResults.map((result, index) => {
                  const medal = getMedal(index);
                  const originalIndex = results.findIndex(r => r.siswa.ID === result.siswa.ID);

                  return (
                    <tr key={result.siswa.ID} className={`hover:bg-gray-50 transition-colors ${medal ? medal.bg : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {medal && (
                            <span className="text-2xl mr-2">{medal.emoji}</span>
                          )}
                          <div className={`text-lg font-bold ${medal ? medal.color : 'text-gray-900'}`}>
                            {originalIndex + 1}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {result.siswa.NAMA.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 uppercase">{result.siswa.NAMA}</div>
                            <div className="text-sm text-gray-500">NIS: {result.siswa.NIS}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {result.siswa.KELAS}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{(result.totalScore || 0).toFixed(4)}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-linear-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                            style={{ width: `${(result.totalScore / (results[0]?.totalScore || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {index < 3 ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Berprestasi
                          </span>
                        ) : index < 10 ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Potensial
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Standar
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Print Footer - Hidden on screen, visible on print */}
            <div className="hidden print:block print:mt-6 print:pt-4 print:border-t print:border-gray-300 print:text-center">
              <p className="text-sm text-gray-600">© 2024 SPK SAW - Sistem Penentuan Siswa Berprestasi</p>
              <p className="text-sm text-gray-600">Total {displayResults.length} siswa dari {results.length} siswa keseluruhan</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
