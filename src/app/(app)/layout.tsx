'use client';

import { LogOut, BookHeart, LayoutDashboard, MessageCircle, BarChart3, Utensils } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: 'Nhật ký', path: '/journal', icon: BookHeart },
    { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Chat', path: '/coach-chat', icon: MessageCircle },
    { name: 'Thống kê', path: '/insights', icon: BarChart3 },
    { name: 'Dinh dưỡng', path: '/nutrition', icon: Utensils },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100 flex flex-col font-sans text-slate-800">
        <header className="px-6 py-4 flex items-center justify-between bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
              <BookHeart size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-emerald-600">
                Lemon
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">YOUR PERSONAL WELLNESS COMPANION</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={clsx(
                      'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2',
                      isActive ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-teal-600'
                    )}
                  >
                    <Icon size={18} /> {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {user && (
                <span className="text-sm text-slate-500 font-medium hidden sm:block max-w-[120px] truncate">
                  {(user as any).username}
                </span>
              )}
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
