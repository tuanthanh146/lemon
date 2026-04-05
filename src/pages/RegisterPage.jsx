import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { BookHeart, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await register(username, password);
      router.replace('/');
    } catch (err) {
      const msg = err.response?.data?.error;
      setError(
        Array.isArray(msg) ? msg.join(', ') : msg || 'Đăng ký thất bại. Vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/20 mb-4">
            <BookHeart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-emerald-600">
            Health Journal Coach
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Tạo tài khoản mới</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="reg-username" className="block text-sm font-semibold text-slate-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                id="reg-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ít nhất 3 ký tự..."
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 mb-2">
                Mật khẩu
              </label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự..."
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-semibold text-slate-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                id="reg-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu..."
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                'Đăng ký'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
