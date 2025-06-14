'use client';

// import type { Metadata } from "next"; // Tidak perlu lagi di sini
import "../globals.css";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from '@/components/UserAvatar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { canAccessAddUser } from '@/lib/rbac';
import { User } from '@/lib/rbac';

// export const metadata: Metadata = { // Hapus definisi metadata di sini
//   title: "Sistem Penentuan Siswa Berprestasi",
//   description: "Aplikasi untuk menentukan siswa berprestasi dengan metode SAW.",
// };

// Component untuk layout content yang menggunakan sidebar context
function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { isOpen, isMobile, close } = useSidebar();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="sidebar-overlay active"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white
        fixed h-full shadow-2xl flex flex-col border-r border-slate-700 z-40
        transition-transform duration-300 ease-in-out
        ${isMobile ? 'lg:hidden' : ''}
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SPK SAW</h1>
                <p className="text-xs text-slate-400">Sistem Penentuan Siswa</p>
              </div>
            </div>

            {/* Close button for mobile */}
            {isMobile && (
              <button
                onClick={close}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors lg:hidden"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4 space-y-2 sidebar-scroll overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">Menu Utama</h2>
            <ul className="space-y-1">
              <li>
                <Link href="/siswa" className={`sidebar-item group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === '/siswa'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-3 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                  <span>Manajemen Siswa</span>
                  {pathname === '/siswa' && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              </li>
              <li>
                <Link href="/kriteria" className={`sidebar-item group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === '/kriteria'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}>
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span>Manajemen Kriteria</span>
                  {pathname === '/kriteria' && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              </li>
              <li>
                <Link href="/penilaian" className={`sidebar-item group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === '/penilaian'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}>
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Manajemen Penilaian</span>
                  {pathname === '/penilaian' && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              </li>
              <li>
                <Link href="/hasil" className={`sidebar-item group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === '/hasil'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}>
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Hasil SAW</span>
                  {pathname === '/hasil' && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">Pengaturan</h2>
            <ul className="space-y-1">
              <li>
                <Link href="/profile" className={`sidebar-item group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === '/profile'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}>
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profil Saya</span>
                  {pathname === '/profile' && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              </li>
              {/* Only show Add User menu for admin */}
              {user && canAccessAddUser(user as User) && (
                <li>
                  <Link href="/add-user" className={`sidebar-item group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    pathname === '/add-user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}>
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Tambah Pengguna</span>
                    {pathname === '/add-user' && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          {/* User Info */}
          <div className="mb-3 p-3 bg-slate-800/50 rounded-lg">
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 bg-slate-700 rounded animate-pulse mb-1"></div>
                  <div className="h-2 bg-slate-700 rounded animate-pulse w-16"></div>
                </div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <UserAvatar
                  nama={user.nama}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{user.nama}</p>
                  <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-400">Guest User</p>
                  <p className="text-xs text-slate-500">Not logged in</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`
        flex flex-col flex-1 transition-all duration-300 ease-in-out
        ${isMobile ? 'ml-0' : (isOpen ? 'ml-72' : 'ml-0')}
      `}>
        <Navbar />
        <main className="p-8 bg-gray-50 min-h-screen flex-grow">
          {children}
        </main>
      </div>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <MainLayoutContent>
        {children}
      </MainLayoutContent>
    </SidebarProvider>
  );
}
