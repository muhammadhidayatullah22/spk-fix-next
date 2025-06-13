'use client';

import React, { useState, useEffect } from 'react';
import { Alert, Button } from '@/components/ui';
import { Siswa, SiswaModalProps } from '@/types/user';

export default function SiswaModal({ isOpen, onClose, onSave, editingSiswa }: SiswaModalProps) {
  const [formData, setFormData] = useState<Omit<Siswa, 'ID'> & { ID?: number }>({
    NAMA: '',
    NIS: '',
    KELAS: '',
    NAMA_ORANG_TUA: '',
    ALAMAT: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingSiswa) {
      setFormData(editingSiswa);
    } else {
      setFormData({ NAMA: '', NIS: '', KELAS: '', NAMA_ORANG_TUA: '', ALAMAT: '' });
    }
    setError(null); // Clear error on modal open/edit
  }, [editingSiswa, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      let response;
      if (editingSiswa) {
        // Update existing student
        response = await fetch(`/api/siswa/${editingSiswa.ID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new student
        response = await fetch('/api/siswa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || (editingSiswa ? 'Failed to update siswa' : 'Failed to add siswa'));
      }

      onSave(); // Notify parent to refresh list
      onClose(); // Close modal
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto transform scale-95 animate-scale-in border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">{editingSiswa ? 'Edit Detail Siswa' : 'Tambah Siswa Baru'}</h2>
        
        {error && <Alert type="error" message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-4">
          <div>
            <label htmlFor="NAMA" className="block text-gray-700 text-sm font-semibold mb-2">Nama Lengkap:</label>
            <input type="text" id="NAMA" name="NAMA" value={formData.NAMA} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800" placeholder="Masukkan nama lengkap" required />
          </div>
          <div>
            <label htmlFor="NIS" className="block text-gray-700 text-sm font-semibold mb-2">NIS:</label>
            <input type="text" id="NIS" name="NIS" value={formData.NIS} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800" placeholder="Masukkan Nomor Induk Siswa" required />
          </div>
          <div>
            <label htmlFor="KELAS" className="block text-gray-700 text-sm font-semibold mb-2">Kelas:</label>
            <input type="text" id="KELAS" name="KELAS" value={formData.KELAS} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800" placeholder="Contoh: X IPA 1" required />
          </div>
          <div>
            <label htmlFor="NAMA_ORANG_TUA" className="block text-gray-700 text-sm font-semibold mb-2">Nama Orang Tua (Opsional):</label>
            <input type="text" id="NAMA_ORANG_TUA" name="NAMA_ORANG_TUA" value={formData.NAMA_ORANG_TUA || ''} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800" placeholder="Masukkan nama orang tua" />
          </div>
          <div>
            <label htmlFor="ALAMAT" className="block text-gray-700 text-sm font-semibold mb-2">Alamat (Opsional):</label>
            <textarea id="ALAMAT" name="ALAMAT" value={formData.ALAMAT || ''} onChange={handleChange} rows={3} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800" placeholder="Masukkan alamat lengkap"></textarea>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {editingSiswa ? 'Simpan Perubahan' : 'Tambah Siswa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 