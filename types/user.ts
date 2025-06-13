export interface User {
  ID: number;
  NAMA: string;
  USERNAME: string;
  PASSWORD?: string;
  ROLE: 'admin' | 'guru' | 'kepala_sekolah';
}

export interface Siswa {
  ID: number;
  NAMA: string;
  NIS: string;
  KELAS: string;
  NAMA_ORANG_TUA?: string;
  ALAMAT?: string;
}

export interface Kriteria {
  ID: number;
  NAMA: string;
  BOBOT: number;
  JENIS: 'benefit' | 'cost';
}

export interface Penilaian {
  ID: number;
  SISWA_ID: number;
  KRITERIA_ID: number;
  NILAI: number;
  siswa?: Siswa;
  kriteria?: Kriteria;
}

export interface SawResult {
  siswa: Siswa;
  scores: { [kriteriaId: number]: number };
  normalizedScores: { [kriteriaId: number]: number };
  totalScore: number;
}

export type UserRole = 'admin' | 'guru' | 'kepala_sekolah';

export interface UserFormData extends Omit<User, 'ID'> {
  ID?: number;
}

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingUser: User | null;
}

export interface SiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingSiswa: Siswa | null;
}

export interface KriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingKriteria: Kriteria | null;
}
