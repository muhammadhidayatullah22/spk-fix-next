// Role-Based Access Control utilities

export type UserRole = 'admin' | 'guru' | 'kepala_sekolah';

export interface User {
  id: number;
  nama: string;
  username: string;
  role: UserRole;
}

// Permission definitions
export const PERMISSIONS = {
  // User management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  
  // Student management
  CREATE_STUDENT: 'create_student',
  READ_STUDENT: 'read_student',
  UPDATE_STUDENT: 'update_student',
  DELETE_STUDENT: 'delete_student',
  
  // Criteria management
  CREATE_CRITERIA: 'create_criteria',
  READ_CRITERIA: 'read_criteria',
  UPDATE_CRITERIA: 'update_criteria',
  DELETE_CRITERIA: 'delete_criteria',
  
  // Assessment management
  CREATE_ASSESSMENT: 'create_assessment',
  READ_ASSESSMENT: 'read_assessment',
  UPDATE_ASSESSMENT: 'update_assessment',
  DELETE_ASSESSMENT: 'delete_assessment',
  
  // Results
  READ_RESULTS: 'read_results',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Admin can do everything
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.CREATE_STUDENT,
    PERMISSIONS.READ_STUDENT,
    PERMISSIONS.UPDATE_STUDENT,
    PERMISSIONS.DELETE_STUDENT,
    PERMISSIONS.CREATE_CRITERIA,
    PERMISSIONS.READ_CRITERIA,
    PERMISSIONS.UPDATE_CRITERIA,
    PERMISSIONS.DELETE_CRITERIA,
    PERMISSIONS.CREATE_ASSESSMENT,
    PERMISSIONS.READ_ASSESSMENT,
    PERMISSIONS.UPDATE_ASSESSMENT,
    PERMISSIONS.DELETE_ASSESSMENT,
    PERMISSIONS.READ_RESULTS,
  ],
  guru: [
    // Guru can do everything except user management
    PERMISSIONS.READ_USER, // Can view users but not manage
    PERMISSIONS.CREATE_STUDENT,
    PERMISSIONS.READ_STUDENT,
    PERMISSIONS.UPDATE_STUDENT,
    PERMISSIONS.DELETE_STUDENT,
    PERMISSIONS.CREATE_CRITERIA,
    PERMISSIONS.READ_CRITERIA,
    PERMISSIONS.UPDATE_CRITERIA,
    PERMISSIONS.DELETE_CRITERIA,
    PERMISSIONS.CREATE_ASSESSMENT,
    PERMISSIONS.READ_ASSESSMENT,
    PERMISSIONS.UPDATE_ASSESSMENT,
    PERMISSIONS.DELETE_ASSESSMENT,
    PERMISSIONS.READ_RESULTS,
  ],
  kepala_sekolah: [
    // Kepala sekolah can view everything but cannot create/update/delete
    PERMISSIONS.READ_USER,
    PERMISSIONS.READ_STUDENT,
    PERMISSIONS.READ_CRITERIA,
    PERMISSIONS.READ_ASSESSMENT,
    PERMISSIONS.READ_RESULTS,
  ],
};

// Check if user has specific permission
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  
  const userPermissions = ROLE_PERMISSIONS[user.role];
  return userPermissions.includes(permission);
}

// Check if user can access add-user page
export function canAccessAddUser(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.CREATE_USER);
}

// Check if user can perform CRUD operations
export function canCreate(user: User | null, resource: 'student' | 'criteria' | 'assessment'): boolean {
  const permissionMap = {
    student: PERMISSIONS.CREATE_STUDENT,
    criteria: PERMISSIONS.CREATE_CRITERIA,
    assessment: PERMISSIONS.CREATE_ASSESSMENT,
  };
  
  return hasPermission(user, permissionMap[resource]);
}

export function canUpdate(user: User | null, resource: 'student' | 'criteria' | 'assessment' | 'user'): boolean {
  const permissionMap = {
    student: PERMISSIONS.UPDATE_STUDENT,
    criteria: PERMISSIONS.UPDATE_CRITERIA,
    assessment: PERMISSIONS.UPDATE_ASSESSMENT,
    user: PERMISSIONS.UPDATE_USER,
  };
  
  return hasPermission(user, permissionMap[resource]);
}

export function canDelete(user: User | null, resource: 'student' | 'criteria' | 'assessment' | 'user'): boolean {
  const permissionMap = {
    student: PERMISSIONS.DELETE_STUDENT,
    criteria: PERMISSIONS.DELETE_CRITERIA,
    assessment: PERMISSIONS.DELETE_ASSESSMENT,
    user: PERMISSIONS.DELETE_USER,
  };
  
  return hasPermission(user, permissionMap[resource]);
}

export function canRead(user: User | null, resource: 'student' | 'criteria' | 'assessment' | 'user' | 'results'): boolean {
  const permissionMap = {
    student: PERMISSIONS.READ_STUDENT,
    criteria: PERMISSIONS.READ_CRITERIA,
    assessment: PERMISSIONS.READ_ASSESSMENT,
    user: PERMISSIONS.READ_USER,
    results: PERMISSIONS.READ_RESULTS,
  };
  
  return hasPermission(user, permissionMap[resource]);
}

// Get role display name
export function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    admin: 'Administrator',
    guru: 'Guru',
    kepala_sekolah: 'Kepala Sekolah',
  };
  
  return roleNames[role] || role;
}

// Check if user is admin
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

// Check if user is guru
export function isGuru(user: User | null): boolean {
  return user?.role === 'guru';
}

// Check if user is kepala sekolah
export function isKepalaSekolah(user: User | null): boolean {
  return user?.role === 'kepala_sekolah';
}
