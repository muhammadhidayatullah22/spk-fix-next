'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission, Permission, User } from '@/lib/rbac';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  fallbackPath?: string;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

const DefaultLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

const DefaultUnauthorized = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Akses Ditolak</h3>
      <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
    </div>
  </div>
);

export default function ProtectedRoute({
  children,
  requiredPermission,
  fallbackPath = '/siswa',
  loadingComponent = <DefaultLoading />,
  unauthorizedComponent = <DefaultUnauthorized />,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Show loading while checking authentication
  if (loading) {
    return <>{loadingComponent}</>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login');
    return <>{loadingComponent}</>;
  }

  // Check permission if required
  if (requiredPermission && !hasPermission(user as User, requiredPermission)) {
    // Redirect to fallback path or show unauthorized component
    if (fallbackPath) {
      router.push(fallbackPath);
      return <>{loadingComponent}</>;
    } else {
      return <>{unauthorizedComponent}</>;
    }
  }

  return <>{children}</>;
}

// Higher-order component for easier usage
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: Permission,
  options?: {
    fallbackPath?: string;
    loadingComponent?: React.ReactNode;
    unauthorizedComponent?: React.ReactNode;
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute
        requiredPermission={requiredPermission}
        fallbackPath={options?.fallbackPath}
        loadingComponent={options?.loadingComponent}
        unauthorizedComponent={options?.unauthorizedComponent}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
