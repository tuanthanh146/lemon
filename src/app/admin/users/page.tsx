"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Lock, Unlock, ShieldAlert, ShieldCheck, Search } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/admin/users?page=${page}&search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotalUsers(res.data.pagination.total);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const toggleLock = async (id: string, isLocked: boolean) => {
    if (!confirm(`Bạn chắc chắn muốn ${isLocked ? 'MỞ KHÓA' : 'KHÓA'} tài khoản này?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/admin/users/${id}`, { isLocked: !isLocked }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const changeRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Bạn chắc chắn muốn đổi quyền user này thành ${newRole}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/admin/users/${id}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('CẢNH BÁO: Hành động này sẽ xoá VĨNH VIỄN user và toàn bộ dữ liệu (nhật ký, chat) của họ!')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Users</h1>
          <p className="text-sm text-slate-500 mt-1">Tổng cộng {totalUsers} tài khoản</p>
        </div>
        
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm username..." 
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 w-full sm:w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Tài khoản</th>
                <th className="px-6 py-4 font-semibold">Ngày đăng ký</th>
                <th className="px-6 py-4 font-semibold">Phân quyền</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Đang tải...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Không tìm thấy user nào</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{user.username}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                        {user.role === 'ADMIN' ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isLocked ? 
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-600"><Lock size={12}/> Khóa</span> :
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700"><Unlock size={12}/> Hoạt động</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => changeRole(user.id, user.role)} title="Đổi quyền" className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <ShieldCheck size={18} />
                      </button>
                      <button onClick={() => toggleLock(user.id, user.isLocked)} title={user.isLocked ? "Mở khóa" : "Khóa"} className={`p-2 rounded-lg transition-colors ${user.isLocked ? 'text-emerald-500 hover:bg-emerald-50' : 'text-orange-500 hover:bg-orange-50'}`}>
                         {user.isLocked ? <Unlock size={18} /> : <Lock size={18} />}
                      </button>
                      <button onClick={() => deleteUser(user.id)} title="Xóa Vĩnh Viễn" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                         <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Setup */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Trang trước
            </button>
            <span className="text-sm text-slate-500">Trang {page} / {totalPages}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
