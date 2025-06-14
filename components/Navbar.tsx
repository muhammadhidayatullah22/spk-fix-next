'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from '@/components/UserAvatar';
import SidebarToggle from '@/components/SidebarToggle';

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Get page title based on current path
  const getPageTitle = () => {
    switch (pathname) {
      case '/siswa':
        return 'Manajemen Siswa';
      case '/kriteria':
        return 'Manajemen Kriteria';
      case '/penilaian':
        return 'Manajemen Penilaian';
      case '/hasil':
        return 'Hasil SAW';
      case '/add-user':
        return 'Tambah Pengguna';
      default:
        return 'Dashboard';
    }
  };

  // Get breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/');
      const name = path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
      return { name, href, current: index === paths.length - 1 };
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/login'); // Redirect ke halaman login setelah logout berhasil
      } else {
        console.error('Logout failed');
        // Handle error, misalnya tampilkan pesan error
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="px-6 py-4">
        {/* Top Section */}
        <div className="flex justify-between items-center">
          {/* Left Section - Toggle Button and Page Title */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle Button */}
            <SidebarToggle />

            {/* Page Title and Breadcrumbs */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
              <nav className="flex mt-1" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm text-gray-500">
                  <li>
                    <Link href="/siswa" className="hover:text-gray-700 transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  {getBreadcrumbs().map((crumb) => (
                    <li key={crumb.href} className="flex items-center">
                      <svg className="w-4 h-4 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      {crumb.current ? (
                        <span className="text-gray-900 font-medium">{crumb.name}</span>
                      ) : (
                        <Link href={crumb.href} className="hover:text-gray-700 transition-colors">
                          {crumb.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <UserAvatar
                  nama={user?.nama}
                  loading={loading}
                  size="md"
                />
                <div className="hidden md:block text-left">
                  {loading ? (
                    <>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                    </>
                  ) : user ? (
                    <>
                      <p className="text-sm font-medium text-gray-900">{user.nama}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900">Guest User</p>
                      <p className="text-xs text-gray-500">Not logged in</p>
                    </>
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-black-400 py-2 z-50 dropdown-enter">
                  <div className="px-4 py-3 border-b border-gray-100">
                    {loading ? (
                      <>
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                      </>
                    ) : user ? (
                      <>
                        <p className="text-sm font-medium text-gray-900">{user.nama}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                        <p className="text-xs text-gray-400 capitalize mt-1">{user.role.replace('_', ' ')}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900">Guest User</p>
                        <p className="text-xs text-gray-500">Not logged in</p>
                      </>
                    )}
                  </div>
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profil Saya
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 