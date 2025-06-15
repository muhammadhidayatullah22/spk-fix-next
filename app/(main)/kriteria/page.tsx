'use client';

import React, { useState, useEffect } from 'react';
import { KriteriaModal, DeleteModal, Alert, LoadingSpinner, SearchInput } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteModal } from '@/hooks';
import { canCreate, canUpdate, canDelete, User } from '@/lib/rbac';
import { API_ENDPOINTS, MESSAGES } from '@/lib/constants';

interface Kriteria {
  ID: number;
  NAMA: string;
  BOBOT: number;
  JENIS: 'benefit' | 'cost';
}



export default function KriteriaPage() {
  const [kriteriaList, setKriteriaList] = useState<Kriteria[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKriteria, setEditingKriteria] = useState<Kriteria | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJenis, setSelectedJenis] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useAuth();

  // Delete modal state using custom hook
  const {
    isModalOpen: isDeleteModalOpen,
    isDeleting,
    itemToDelete: kriteriaToDelete,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    error: deleteError,
  } = useDeleteModal({
    onDelete: async (id: number) => {
      const response = await fetch(`${API_ENDPOINTS.KRITERIA}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menghapus kriteria');
      }

      const result = await response.json();
      setSuccessMessage(result.message || MESSAGES.SUCCESS.KRITERIA_DELETED);
      fetchKriteria();
    },
    getItemName: (kriteria: Kriteria) => kriteria.NAMA,
  });

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

      {/* Success/Error Messages */}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}
      {error && <Alert type="error" message={error} />}
      {deleteError && <Alert type="error" message={deleteError} />}

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
                          <div className="text-sm font-medium text-gray-900 uppercase">{kriteria.NAMA}</div>
                          
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
                            onClick={() => openDeleteModal(kriteria)}
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
      {/* Modals */}
      <KriteriaModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        editingKriteria={editingKriteria}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        loading={isDeleting}
        title="Hapus Kriteria"
        itemName={kriteriaToDelete?.NAMA}
        message={`Apakah Anda yakin ingin menghapus kriteria "${kriteriaToDelete?.NAMA}"?

⚠️ PERINGATAN: Jika kriteria ini digunakan dalam penilaian siswa, maka SEMUA data penilaian terkait akan ikut terhapus secara otomatis dan tidak dapat dikembalikan.

Tindakan ini akan mempengaruhi:
• Semua penilaian siswa untuk kriteria ini
• Hasil perhitungan SAW yang sudah ada
• Laporan dan analisis yang menggunakan kriteria ini`}
        variant="danger"
      />
    </div>
  );
}