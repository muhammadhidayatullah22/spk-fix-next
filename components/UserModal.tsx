'use client';

import React, { useState, useEffect } from 'react';

interface User {
  ID: number;
  NAMA: string;
  USERNAME: string;
  PASSWORD?: string;
  ROLE: 'admin' | 'guru' | 'kepala_sekolah';
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingUser: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, editingUser }) => {
  const [formData, setFormData] = useState<Omit<User, 'ID'> & { ID?: number }>({ 
    NAMA: '', 
    USERNAME: '', 
    PASSWORD: '', 
    ROLE: 'admin' 
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setFormData({ ...editingUser, PASSWORD: '' }); // Jangan tampilkan password
    } else {
      setFormData({ NAMA: '', USERNAME: '', PASSWORD: '', ROLE: 'admin' });
    }
    setError(null);
  }, [editingUser, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!formData.NAMA || !formData.USERNAME || !formData.ROLE || (!editingUser && !formData.PASSWORD)) {
      setError('Harap lengkapi semua bidang yang diperlukan.');
      setIsSubmitting(false);
      return;
    }

    try {
      let response;
      if (editingUser) {
        // Kirim password jika diisi, jika tidak, kirim data tanpa password
        const dataToSend = formData.PASSWORD ? formData : { 
          NAMA: formData.NAMA, 
          USERNAME: formData.USERNAME, 
          ROLE: formData.ROLE 
        };

        response = await fetch(`/api/user/${editingUser.ID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
      } else {
        response = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || (editingUser ? 'Failed to update user' : 'Failed to add user'));
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto transform scale-95 animate-scale-in border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          {editingUser ? 'Edit Detail Pengguna' : 'Tambah Pengguna Baru'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-4">
          <div>
            <label htmlFor="NAMA" className="block text-gray-700 text-sm font-semibold mb-2">
              Nama:
            </label>
            <input 
              type="text" 
              id="NAMA" 
              name="NAMA" 
              value={formData.NAMA} 
              onChange={handleChange} 
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800" 
              placeholder="Masukkan nama pengguna" 
              required 
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="USERNAME" className="block text-gray-700 text-sm font-semibold mb-2">
              Username:
            </label>
            <input 
              type="text" 
              id="USERNAME" 
              name="USERNAME" 
              value={formData.USERNAME} 
              onChange={handleChange} 
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800" 
              placeholder="Masukkan username" 
              required 
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="PASSWORD" className="block text-gray-700 text-sm font-semibold mb-2">
              Password: {editingUser ? ' (Kosongkan jika tidak diubah)' : ''}
            </label>
            <input 
              type="password" 
              id="PASSWORD" 
              name="PASSWORD" 
              value={formData.PASSWORD || ''} 
              onChange={handleChange} 
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800" 
              placeholder={editingUser ? 'Biarkan kosong untuk mempertahankan password lama' : 'Masukkan password'} 
              required={!editingUser} 
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="ROLE" className="block text-gray-700 text-sm font-semibold mb-2">
              Role:
            </label>
            <select 
              id="ROLE" 
              name="ROLE" 
              value={formData.ROLE} 
              onChange={handleChange} 
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800" 
              required
              disabled={isSubmitting}
            >
              <option value="admin">Admin</option>
              <option value="guru">Guru</option>
              <option value="kepala_sekolah">Kepala Sekolah</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingUser ? 'Menyimpan...' : 'Menambah...'}
                </div>
              ) : (
                editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
