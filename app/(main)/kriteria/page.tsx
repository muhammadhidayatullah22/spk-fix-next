'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { canCreate, canUpdate, canDelete, User } from '@/lib/rbac';
// import KriteriaModal from '@/components/KriteriaModal'; // Akan dibuat nanti

interface Kriteria {
  ID: number;
  NAMA: string;
  BOBOT: number;
  JENIS: 'benefit' | 'cost';
}

interface KriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingKriteria: Kriteria | null;
}

const KriteriaModal: React.FC<KriteriaModalProps> = ({ isOpen, onClose, onSave, editingKriteria }) => {
  const [formData, setFormData] = useState<Omit<Kriteria, 'ID'> & { ID?: number }>({ NAMA: '', BOBOT: 0, JENIS: 'benefit' });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingKriteria) {
      setFormData(editingKriteria);
    } else {
      setFormData({ NAMA: '', BOBOT: 0, JENIS: 'benefit' });
    }
    setError(null);
  }, [editingKriteria, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'BOBOT' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    // Validasi
    if (!formData.NAMA.trim()) {
      setError('Nama kriteria harus diisi.');
      setSaving(false);
      return;
    }

    if (formData.BOBOT <= 0 || formData.BOBOT > 1) {
      setError('Bobot harus antara 0.01 dan 1.00');
      setSaving(false);
      return;
    }

    try {
      let response;
      if (editingKriteria) {
        response = await fetch(`/api/kriteria/${editingKriteria.ID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch('/api/kriteria', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || (editingKriteria ? 'Gagal mengupdate kriteria' : 'Gagal menambah kriteria'));
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan yang tidak terduga.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingKriteria ? 'Edit Kriteria' : 'Tambah Kriteria Baru'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="NAMA" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Kriteria <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="NAMA"
              name="NAMA"
              value={formData.NAMA}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 form-input text-black"
              placeholder="Contoh: Nilai Akademik, Prestasi, dll"
              required
            />
          </div>

          <div>
            <label htmlFor="BOBOT" className="block text-sm font-medium text-gray-700 mb-2">
              Bobot <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="BOBOT"
              name="BOBOT"
              value={formData.BOBOT}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 form-input text-black"
              placeholder="0.01 - 1.00"
              step="0.01"
              min="0.01"
              max="1.00"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Nilai antara 0.01 hingga 1.00 (contoh: 0.25 untuk 25%)</p>
          </div>

          <div>
            <label htmlFor="JENIS" className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Kriteria <span className="text-red-500">*</span>
            </label>
            <select
              id="JENIS"
              name="JENIS"
              value={formData.JENIS}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 form-input text-black"
              required
            >
              <option value="benefit">Benefit (Semakin tinggi semakin baik)</option>
              <option value="cost">Cost (Semakin rendah semakin baik)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Benefit: nilai tinggi lebih baik (contoh: nilai akademik). Cost: nilai rendah lebih baik (contoh: jumlah absen)
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center btn-gradient"
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
                  {editingKriteria ? 'Simpan Perubahan' : 'Tambah Kriteria'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function KriteriaPage() {
  const [kriteriaList, setKriteriaList] = useState<Kriteria[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKriteria, setEditingKriteria] = useState<Kriteria | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJenis, setSelectedJenis] = useState('');
  const { user } = useAuth();

  const fetchKriteria = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/kriteria');
      if (!response.ok) {
        throw new Error('Failed to fetch kriteria');
      }
      const data: Kriteria[] = await response.json();
      setKriteriaList(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching kriteria.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKriteria();
  }, []);

  const handleAddClick = () => {
    setEditingKriteria(null);
    setIsModalOpen(true);
  };

  const handleEdit = (kriteria: Kriteria) => {
    setEditingKriteria(kriteria);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this criterion?')) {
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/kriteria/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete kriteria');
      }

      fetchKriteria();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while deleting kriteria.');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingKriteria(null);
  };

  const handleModalSave = () => {
    fetchKriteria();
  };

  // Filter kriteria based on search term and jenis
  const filteredKriteria = kriteriaList.filter(kriteria => {
    const matchesSearch = kriteria.NAMA.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJenis = selectedJenis === '' || kriteria.JENIS === selectedJenis;
    return matchesSearch && matchesJenis;
  });

  // Calculate total weight
  const totalBobot = kriteriaList.reduce((sum, kriteria) => sum + kriteria.BOBOT, 0);

  // Get jenis badge color
  const getJenisBadge = (jenis: string) => {
    return jenis === 'benefit'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  // Get jenis display name
  const getJenisDisplayName = (jenis: string) => {
    return jenis === 'benefit' ? 'Benefit (Semakin tinggi semakin baik)' : 'Cost (Semakin rendah semakin baik)';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Kriteria</h1>
          <p className="text-gray-600">Kelola kriteria penilaian untuk sistem pendukung keputusan</p>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Kriteria</p>
                <p className="text-2xl font-semibold text-gray-900">{kriteriaList.length}</p>
              </div>
            </div>
          </div>

          

          
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari kriteria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-black"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-black"
            >
              <option value="">Semua Jenis</option>
              <option value="benefit">Benefit</option>
              <option value="cost">Cost</option>
            </select>

            {canCreate(user as User, 'criteria') && (
              <button
                onClick={handleAddClick}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 btn-gradient"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Kriteria
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kriteria Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Memuat data kriteria...</span>
            </div>
          </div>
        ) : filteredKriteria.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || selectedJenis ? 'Tidak ada kriteria yang ditemukan' : 'Belum ada data kriteria'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedJenis
                ? 'Coba ubah filter pencarian'
                : 'Tambahkan kriteria baru untuk memulai'
              }
            </p>
            {!searchTerm && !selectedJenis && canCreate(user as User, 'criteria') && (
              <div className="mt-6">
                <button
                  onClick={handleAddClick}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 btn-gradient"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Tambah Kriteria Pertama
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kriteria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bobot</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKriteria.map((kriteria) => (
                  <tr key={kriteria.ID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            kriteria.JENIS === 'benefit' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            <svg className={`w-5 h-5 ${
                              kriteria.JENIS === 'benefit' ? 'text-green-600' : 'text-red-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {kriteria.JENIS === 'benefit' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                              )}
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{kriteria.NAMA}</div>
                          
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{kriteria.BOBOT}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getJenisBadge(kriteria.JENIS)}`}>
                        {kriteria.JENIS === 'benefit' ? 'Benefit' : 'Cost'}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {getJenisDisplayName(kriteria.JENIS)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {canUpdate(user as User, 'criteria') && (
                          <button
                            onClick={() => handleEdit(kriteria)}
                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                        )}
                        {canDelete(user as User, 'criteria') && (
                          <button
                            onClick={() => handleDelete(kriteria.ID)}
                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modal */}
      <KriteriaModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        editingKriteria={editingKriteria}
      />
    </div>
  );
}