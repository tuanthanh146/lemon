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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100 flex flex-col font-sans text-slate-800 relative overflow-hidden">
        {/* Background Lemons */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Top area */}
          <div className="absolute -top-[5%] -left-[5%] text-[80px] md:text-[150px] opacity-20 md:opacity-30 rotate-12 drop-shadow-md">🍋</div>
          <div className="absolute top-[10%] left-[25%] text-[60px] md:text-[100px] opacity-15 md:opacity-20 rotate-45 drop-shadow-sm">🍋</div>
          <div className="hidden md:block absolute top-[5%] right-[30%] text-[120px] opacity-25 -rotate-12 drop-shadow-md">🍋</div>
          <div className="absolute -top-[5%] md:-top-[10%] -right-[10%] md:-right-[5%] text-[120px] md:text-[200px] opacity-15 md:opacity-20 -rotate-12 drop-shadow-lg">🍋</div>
          
          {/* Middle area */}
          <div className="absolute top-[35%] -left-[10%] text-[100px] md:text-[180px] opacity-15 md:opacity-20 rotate-90 drop-shadow-lg">🍋</div>
          <div className="hidden md:block absolute top-[45%] left-[30%] text-[90px] opacity-25 rotate-12 drop-shadow-sm">🍋</div>
          <div className="absolute top-[40%] right-[5%] md:right-[15%] text-[80px] md:text-[140px] opacity-20 md:opacity-30 -rotate-45 drop-shadow-md">🍋</div>
          <div className="hidden md:block absolute top-[55%] -right-[5%] text-[160px] opacity-20 -rotate-45 drop-shadow-sm">🍋</div>

          {/* Bottom area */}
          <div className="absolute bottom-[20%] left-[5%] md:left-[10%] text-[80px] md:text-[130px] opacity-20 md:opacity-25 rotate-45 drop-shadow-md">🍋</div>
          <div className="hidden md:block absolute bottom-[30%] left-[45%] text-[100px] opacity-20 -rotate-12 drop-shadow-sm">🍋</div>
          <div className="absolute bottom-[10%] right-[30%] md:right-[40%] text-[90px] md:text-[150px] opacity-25 md:opacity-30 rotate-12 drop-shadow-lg">🍋</div>
          <div className="absolute -bottom-[5%] md:-bottom-[10%] -right-[10%] md:right-[15%] text-[140px] md:text-[250px] opacity-10 md:opacity-15 rotate-90 drop-shadow-xl">🍋</div>
          <div className="hidden md:block absolute bottom-[5%] -left-[5%] text-[120px] opacity-25 -rotate-12 drop-shadow-md">🍋</div>
        </div>

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

        <main className="flex-1 max-w-7xl mx-auto w-full p-4 pb-24 md:pb-6 md:p-6 lg:p-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/50 pb-safe z-50 flex justify-around items-center px-2 py-2 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={clsx(
                  'flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[64px]',
                  isActive ? 'text-teal-600 bg-teal-50/80' : 'text-slate-400 hover:text-teal-500'
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </ProtectedRoute>
  );
}
