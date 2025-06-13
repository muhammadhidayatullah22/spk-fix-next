// Application constants

// Pagination
export const ITEMS_PER_PAGE = {
  DEFAULT: 10,
  SMALL: 5,
  MEDIUM: 15,
  LARGE: 25,
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  GURU: 'guru',
  KEPALA_SEKOLAH: 'kepala_sekolah',
} as const;

// Kriteria types
export const KRITERIA_TYPES = {
  BENEFIT: 'benefit',
  COST: 'cost',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  USERS: '/api/user',
  SISWA: '/api/siswa',
  KRITERIA: '/api/kriteria',
  PENILAIAN: '/api/penilaian',
  RESULTS: '/api/results',
} as const;

// Status messages
export const MESSAGES = {
  SUCCESS: {
    USER_CREATED: 'Pengguna berhasil ditambahkan!',
    USER_UPDATED: 'Pengguna berhasil diperbarui!',
    USER_DELETED: 'Pengguna berhasil dihapus!',
    SISWA_CREATED: 'Siswa berhasil ditambahkan!',
    SISWA_UPDATED: 'Siswa berhasil diperbarui!',
    SISWA_DELETED: 'Siswa berhasil dihapus!',
    KRITERIA_CREATED: 'Kriteria berhasil ditambahkan!',
    KRITERIA_UPDATED: 'Kriteria berhasil diperbarui!',
    KRITERIA_DELETED: 'Kriteria berhasil dihapus!',
  },
  ERROR: {
    GENERIC: 'Terjadi kesalahan yang tidak terduga.',
    NETWORK: 'Gagal terhubung ke server.',
    UNAUTHORIZED: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
    NOT_FOUND: 'Data tidak ditemukan.',
    VALIDATION: 'Data yang dimasukkan tidak valid.',
  },
  LOADING: {
    USERS: 'Memuat data pengguna...',
    SISWA: 'Memuat data siswa...',
    KRITERIA: 'Memuat data kriteria...',
    PENILAIAN: 'Memuat data penilaian...',
    RESULTS: 'Menghitung hasil SAW...',
  },
  EMPTY: {
    USERS: 'Belum ada pengguna',
    SISWA: 'Belum ada data siswa',
    KRITERIA: 'Belum ada data kriteria',
    PENILAIAN: 'Belum ada data penilaian',
    RESULTS: 'Belum ada hasil perhitungan',
    SEARCH: 'Tidak ada data yang ditemukan',
  },
} as const;

// Form validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  BOBOT_MIN: 0.01,
  BOBOT_MAX: 1.0,
  NILAI_MIN: 0,
  NILAI_MAX: 100,
} as const;

// UI constants
export const UI = {
  MODAL_ANIMATION_DURATION: 200,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
} as const;

// File types for export
export const EXPORT_TYPES = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  API: 'yyyy-MM-dd',
  FULL: 'dd MMMM yyyy',
  WITH_TIME: 'dd/MM/yyyy HH:mm',
} as const;
