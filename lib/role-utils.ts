import { UserRole } from '@/types/user';

// Get role badge color classes
export const getRoleBadge = (role: UserRole): string => {
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

// Get role display name
export const getRoleDisplayName = (role: UserRole): string => {
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

// Get role color for charts/graphs
export const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '#ef4444'; // red-500
    case 'guru':
      return '#3b82f6'; // blue-500
    case 'kepala_sekolah':
      return '#8b5cf6'; // purple-500
    default:
      return '#6b7280'; // gray-500
  }
};

// Get all available roles
export const getAllRoles = (): { value: UserRole; label: string }[] => [
  { value: 'admin', label: 'Administrator' },
  { value: 'guru', label: 'Guru' },
  { value: 'kepala_sekolah', label: 'Kepala Sekolah' },
];

// Validate role
export const isValidRole = (role: string): role is UserRole => {
  return ['admin', 'guru', 'kepala_sekolah'].includes(role);
};

// Get role priority (for sorting)
export const getRolePriority = (role: UserRole): number => {
  switch (role) {
    case 'admin':
      return 1;
    case 'kepala_sekolah':
      return 2;
    case 'guru':
      return 3;
    default:
      return 4;
  }
};
