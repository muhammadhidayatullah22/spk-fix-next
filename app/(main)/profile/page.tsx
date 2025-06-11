'use client';

import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  nama: string;
  username: string;
  role: string;
}

interface ProfileFormData {
  NAMA: string;
  USERNAME: string;
  CURRENT_PASSWORD: string;
  NEW_PASSWORD: string;
  CONFIRM_PASSWORD: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    NAMA: '',
    USERNAME: '',
    CURRENT_PASSWORD: '',
    NEW_PASSWORD: '',
    CONFIRM_PASSWORD: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        NAMA: userData.nama,
        USERNAME: userData.username
      }));
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching user data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      if (!formData.NAMA.trim() || !formData.USERNAME.trim()) {
        throw new Error('Nama dan Username harus diisi');
      }

      // If password change is requested, validate passwords
      if (showPasswordForm) {
        if (!formData.CURRENT_PASSWORD) {
          throw new Error('Password saat ini harus diisi');
        }
        if (!formData.NEW_PASSWORD) {
          throw new Error('Password baru harus diisi');
        }
        if (formData.NEW_PASSWORD.length < 6) {
          throw new Error('Password baru minimal 6 karakter');
        }
        if (formData.NEW_PASSWORD !== formData.CONFIRM_PASSWORD) {
          throw new Error('Konfirmasi password tidak cocok');
        }
      }

      const updateData: any = {
        NAMA: formData.NAMA.trim(),
        USERNAME: formData.USERNAME.trim(),
      };

      if (showPasswordForm) {
        updateData.CURRENT_PASSWORD = formData.CURRENT_PASSWORD;
        updateData.NEW_PASSWORD = formData.NEW_PASSWORD;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      const result = await response.json();
      setUser(result.user);
      setSuccess(result.message);
      
      // Reset password form
      if (showPasswordForm) {
        setFormData(prev => ({
          ...prev,
          CURRENT_PASSWORD: '',
          NEW_PASSWORD: '',
          CONFIRM_PASSWORD: ''
        }));
        setShowPasswordForm(false);
      }

      // Auto hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'guru':
        return 'Guru';
      case 'kepala_sekolah':
        return 'Kepala Sekolah';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'guru':
        return 'bg-blue-100 text-blue-800';
      case 'kepala_sekolah':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600 text-lg">Memuat data profil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Pengguna</h1>
          <p className="text-gray-600">Kelola informasi akun dan keamanan Anda</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center" role="alert">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center" role="alert">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Akun</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ID Pengguna</label>
                <p className="text-lg font-semibold text-gray-900">#{user?.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Nama Lengkap</label>
                <p className="text-lg font-semibold text-gray-900">{user?.nama}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                <p className="text-lg font-semibold text-gray-900">{user?.username}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(user?.role || '')}`}>
                  {getRoleDisplayName(user?.role || '')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Profil</h2>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="NAMA" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="NAMA"
                    name="NAMA"
                    value={formData.NAMA}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 form-input text-black"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="USERNAME" className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="USERNAME"
                    name="USERNAME"
                    value={formData.USERNAME}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 form-input text-black"
                    placeholder="Masukkan username"
                    required
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Ubah Password</h3>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    {showPasswordForm ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Batal
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Ubah Password
                      </>
                    )}
                  </button>
                </div>

                {showPasswordForm && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label htmlFor="CURRENT_PASSWORD" className="block text-sm font-medium text-gray-700 mb-2">
                        Password Saat Ini <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="CURRENT_PASSWORD"
                        name="CURRENT_PASSWORD"
                        value={formData.CURRENT_PASSWORD}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 form-input text-black"
                        placeholder="Masukkan password saat ini"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="NEW_PASSWORD" className="block text-sm font-medium text-gray-700 mb-2">
                          Password Baru <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          id="NEW_PASSWORD"
                          name="NEW_PASSWORD"
                          value={formData.NEW_PASSWORD}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 form-input text-black"
                          placeholder="Masukkan password baru"
                          minLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                      </div>

                      <div>
                        <label htmlFor="CONFIRM_PASSWORD" className="block text-sm font-medium text-gray-700 mb-2">
                          Konfirmasi Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          id="CONFIRM_PASSWORD"
                          name="CONFIRM_PASSWORD"
                          value={formData.CONFIRM_PASSWORD}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 form-input text-black"
                          placeholder="Konfirmasi password baru"
                        />
                        {formData.NEW_PASSWORD && formData.CONFIRM_PASSWORD && formData.NEW_PASSWORD !== formData.CONFIRM_PASSWORD && (
                          <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-gradient "
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
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Tips Keamanan</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Gunakan password yang kuat dengan kombinasi huruf, angka, dan simbol</li>
              <li>• Jangan gunakan password yang sama dengan akun lain</li>
              <li>• Ubah password secara berkala untuk menjaga keamanan akun</li>
              <li>• Jangan bagikan informasi login Anda kepada orang lain</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
