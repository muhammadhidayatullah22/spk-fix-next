'use client';

import React, { useState, useEffect } from 'react';
import { Alert, Button } from '@/components/ui';
import { Kriteria } from '@/types/user';

interface KriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingKriteria: Kriteria | null;
}

const KriteriaModal: React.FC<KriteriaModalProps> = ({ isOpen, onClose, onSave, editingKriteria }) => {
  const [formData, setFormData] = useState<Omit<Kriteria, 'ID'> & { ID?: number }>({ 
    NAMA: '', 
    BOBOT: 0, 
    JENIS: 'benefit' 
  });
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
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingKriteria ? 'Edit Kriteria' : 'Tambah Kriteria Baru'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={saving}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <Alert type="error" message={error} className="mb-6" />}

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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
            >
              <option value="benefit">Benefit (Semakin tinggi semakin baik)</option>
              <option value="cost">Cost (Semakin rendah semakin baik)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Benefit: nilai tinggi lebih baik (contoh: nilai akademik). Cost: nilai rendah lebih baik (contoh: jumlah absen)
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving}
              className='bg-gradient-to-r from-gray-600 to-gray-300 hover:from-gray-700 hover:to-gray-300'
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              icon={
                !saving ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : undefined
              }
              className="bg-gradient-to-r from-blue-600 to-blue-300 hover:from-blue-700 hover:to-blue-300"
            >
              {editingKriteria ? 'Simpan Perubahan' : 'Tambah Kriteria'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KriteriaModal;
