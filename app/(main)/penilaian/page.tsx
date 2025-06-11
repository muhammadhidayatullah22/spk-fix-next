'use client';

import React, { useState, useEffect } from 'react';

interface Siswa {
  ID: number;
  NAMA: string;
  NIS: string;
  KELAS: string;
  NAMA_ORANG_TUA?: string;
  ALAMAT?: string;
}

interface Kriteria {
  ID: number;
  NAMA: string;
  BOBOT: number;
  JENIS: string;
}

interface Penilaian {
  ID: number;
  SISWA_ID: number;
  KRITERIA_ID: number;
  NILAI: number;
  siswa: Siswa;
  kriteria: Kriteria;
}

interface PenilaianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedSiswa: Siswa | null;
  kriteriaList: Kriteria[];
  penilaianData: { [key: number]: number };
  onNilaiChange: (kriteriaId: number, nilai: string) => void;
  saving: boolean;
  message: string | null;
  error: string | null;
}

const PenilaianModal: React.FC<PenilaianModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedSiswa,
  kriteriaList,
  penilaianData,
  onNilaiChange,
  saving,
  message,
  error
}) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-auto border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Input Penilaian</h2>
            <p className="text-gray-600 mt-1">
              Siswa: <span className="font-semibold">{selectedSiswa?.NAMA}</span> -
              Kelas: <span className="font-semibold">{selectedSiswa?.KELAS}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Kriteria Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Nilai Kriteria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kriteriaList.map((kriteria) => (
              <div key={kriteria.ID} className="bg-black-300 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {kriteria.NAMA}
                    </label>
                    <p className="text-xs text-gray-500">
                      Bobot: {kriteria.BOBOT} | Jenis: {kriteria.JENIS === 'benefit' ? 'Benefit' : 'Cost'}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    kriteria.JENIS === 'benefit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {kriteria.JENIS === 'benefit' ? 'Benefit' : 'Cost'}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={penilaianData[kriteria.ID] || ''}
                  onChange={(e) => onNilaiChange(kriteria.ID, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                  placeholder="0-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            disabled={saving}
          >
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-300 text-white rounded-lg hover:from-blue-700 hover:to-blue-300 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center btn-gradient"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan Penilaian
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PenilaianPage() {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [kriteriaList, setKriteriaList] = useState<Kriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [penilaianData, setPenilaianData] = useState<{ [key: number]: number }>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [siswaResponse, kriteriaResponse] = await Promise.all([
        fetch('/api/siswa'),
        fetch('/api/kriteria')
      ]);

      if (!siswaResponse.ok || !kriteriaResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const siswaData = await siswaResponse.json();
      const kriteriaData = await kriteriaResponse.json();

      setSiswaList(siswaData);
      setKriteriaList(kriteriaData);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPenilaianSiswa = async (siswaId: number) => {
    try {
      const response = await fetch(`/api/penilaian/siswa/${siswaId}`);
      if (response.ok) {
        const data: Penilaian[] = await response.json();
        const penilaianMap: { [key: number]: number } = {};
        data.forEach(p => {
          penilaianMap[p.KRITERIA_ID] = p.NILAI;
        });
        setPenilaianData(penilaianMap);
      } else {
        setPenilaianData({});
      }
    } catch (error) {
      console.error('Error fetching penilaian:', error);
      setPenilaianData({});
    }
  };

  const handleInputNilai = async (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setShowModal(true);
    await fetchPenilaianSiswa(siswa.ID);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSiswa(null);
    setPenilaianData({});
    setMessage(null);
  };

  const handleNilaiChange = (kriteriaId: number, nilai: string) => {
    const numericValue = parseFloat(nilai);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
      setPenilaianData(prev => ({
        ...prev,
        [kriteriaId]: numericValue
      }));
    } else if (nilai === '') {
      setPenilaianData(prev => {
        const newData = { ...prev };
        delete newData[kriteriaId];
        return newData;
      });
    }
  };

  const handleSavePenilaian = async () => {
    if (!selectedSiswa) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const assessments = Object.entries(penilaianData).map(([kriteriaId, nilai]) => ({
        KRITERIA_ID: parseInt(kriteriaId),
        NILAI: nilai
      }));

      const response = await fetch(`/api/penilaian/siswa/${selectedSiswa.ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assessments }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save penilaian');
      }

      const result = await response.json();
      setMessage(`Berhasil menyimpan ${result.processed} dari ${result.total} penilaian`);

      // Auto close modal after 2 seconds
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while saving penilaian.');
    } finally {
      setSaving(false);
    }
  };

  // Filter siswa based on search term and class
  const filteredSiswa = siswaList.filter(siswa => {
    const matchesSearch = siswa.NAMA.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         siswa.NIS.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKelas = selectedKelas === '' || siswa.KELAS === selectedKelas;
    return matchesSearch && matchesKelas;
  });

  // Get unique classes
  const uniqueKelas = Array.from(new Set(siswaList.map(siswa => siswa.KELAS))).sort();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-left">         
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Penilaian Siswa</h1>
          <p className="text-gray-600">Input nilai kriteria untuk setiap siswa</p>
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
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <p className="text-2xl font-semibold text-gray-900">{siswaList.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Kriteria</p>
                <p className="text-2xl font-semibold text-gray-900">{kriteriaList.length}</p>
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

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-black"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-black"
            >
              <option value="">Semua Kelas</option>
              {uniqueKelas.map(kelas => (
                <option key={kelas} value={kelas}>{kelas}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Memuat data siswa...</span>
            </div>
          </div>
        ) : filteredSiswa.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || selectedKelas ? 'Tidak ada siswa yang ditemukan' : 'Belum ada data siswa'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedKelas
                ? 'Coba ubah filter pencarian'
                : 'Tambahkan data siswa terlebih dahulu'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSiswa.map((siswa) => (
                  <tr key={siswa.ID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {siswa.NAMA.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{siswa.NAMA}</div>
                          <div className="text-sm text-gray-500">ID: {siswa.ID}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{siswa.NIS}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {siswa.KELAS}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleInputNilai(siswa)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-lg hover:from-green-600 hover:to-blue-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 btn-gradient"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Input Nilai
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <PenilaianModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSavePenilaian}
        selectedSiswa={selectedSiswa}
        kriteriaList={kriteriaList}
        penilaianData={penilaianData}
        onNilaiChange={handleNilaiChange}
        saving={saving}
        message={message}
        error={error}
      />
    </div>
  );
}