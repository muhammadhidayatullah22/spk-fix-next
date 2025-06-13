import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { UserRole } from './rbac';

export interface SessionUser {
  id: number;
  nama: string;
  username: string;
  role: UserRole;
}

// Get user session from cookies (for API routes)
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session_user');

    if (!sessionCookie) {
      return null;
    }

    const sessionData = JSON.parse(sessionCookie.value);
    
    // Validate session data structure
    if (!sessionData.id || !sessionData.nama || !sessionData.username || !sessionData.role) {
      return null;
    }

    return {
      id: sessionData.id,
      nama: sessionData.nama,
      username: sessionData.username,
      role: sessionData.role as UserRole,
    };
  } catch (error) {
    console.error('Error parsing session:', error);
    return null;
  }
}

// Check if user has required role
export function hasRole(user: SessionUser | null, requiredRole: UserRole): boolean {
  return user?.role === requiredRole;
}

// Check if user has any of the required roles
export function hasAnyRole(user: SessionUser | null, requiredRoles: UserRole[]): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

// Check if user is admin
export function isAdmin(user: SessionUser | null): boolean {
  return hasRole(user, 'admin');
}

// Check if user is guru
export function isGuru(user: SessionUser | null): boolean {
  return hasRole(user, 'guru');
}

// Check if user is kepala sekolah
export function isKepalaSekolah(user: SessionUser | null): boolean {
  return hasRole(user, 'kepala_sekolah');
}

// Check if user can perform write operations (admin or guru)
export function canWrite(user: SessionUser | null): boolean {
  return hasAnyRole(user, ['admin', 'guru']);
}

// Check if user can only read (kepala sekolah)
export function isReadOnly(user: SessionUser | null): boolean {
  return hasRole(user, 'kepala_sekolah');
}

// Check if user can manage users (only admin)
export function canManageUsers(user: SessionUser | null): boolean {
  return isAdmin(user);
}
