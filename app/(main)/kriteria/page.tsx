'use client';

import React, { useState, useEffect } from 'react';
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
      [name]: name === 'BOBOT' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validasi bobot
    if (formData.BOBOT <= 0) {
      setError('Bobot harus lebih besar dari 0.');
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
        throw new Error(data.message || (editingKriteria ? 'Failed to update kriteria' : 'Failed to add kriteria'));
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto transform scale-95 animate-scale-in border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">{editingKriteria ? 'Edit Detail Kriteria' : 'Tambah Kriteria Baru'}</h2>
        
        {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">{error}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-4">
          <div>
            <label htmlFor="NAMA" className="block text-gray-700 text-sm font-semibold mb-2">Nama Kriteria:</label>
            <input type="text" id="NAMA" name="NAMA" value={formData.NAMA} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800" placeholder="Masukkan nama kriteria" required />
          </div>
          <div>
            <label htmlFor="BOBOT" className="block text-gray-700 text-sm font-semibold mb-2">Bobot:</label>
            <input type="number" id="BOBOT" name="BOBOT" value={formData.BOBOT} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800" placeholder="Masukkan bobot (contoh: 0.2)" step="0.01" required />
          </div>
          <div>
            <label htmlFor="JENIS" className="block text-gray-700 text-sm font-semibold mb-2">Tipe:</label>
            <select id="JENIS" name="JENIS" value={formData.JENIS} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800" required>
              <option value="benefit">Benefit</option>
              <option value="cost">Cost</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Batal
            </button>
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md">
              {editingKriteria ? 'Simpan Perubahan' : 'Tambah Kriteria'}
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 text-center">Manajemen Data Kriteria</h1>

      {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</p>}

      <div className="mb-6 flex justify-end">
        <button
          onClick={handleAddClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Tambah Kriteria Baru
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Daftar Kriteria</h2>
          {kriteriaList.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Belum ada data kriteria. Silakan tambahkan kriteria baru.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kriteria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bobot</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kriteriaList.map((kriteria) => (
                    <tr key={kriteria.ID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{kriteria.ID}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{kriteria.NAMA}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{kriteria.BOBOT}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{kriteria.JENIS}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleEdit(kriteria)} className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-200">Edit</button>
                        <button onClick={() => handleDelete(kriteria.ID)} className="text-red-600 hover:text-red-900 transition-colors duration-200">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <KriteriaModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        editingKriteria={editingKriteria}
      />
    </div>
  );
} 