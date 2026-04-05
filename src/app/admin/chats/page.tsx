"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { MessageSquare, Calendar } from 'lucide-react';

export default function AdminChatsPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`/api/admin/chats?page=${page}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChats(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      } catch (err) {
        console.error('Failed to fetch chats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [page]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Thống Kê Tương Tác Trợ Lý</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ghi chú quyền riêng tư: Admin chỉ được phép xem các thông số về tần suất, không thể xem nội dung cuộc hội thoại.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Mã Phiên (Session ID)</th>
                <th className="px-6 py-4 font-semibold">Tài Khoản Hành Động</th>
                <th className="px-6 py-4 font-semibold">Số lượng tin nhắn trả lời</th>
                <th className="px-6 py-4 font-semibold text-right">Khởi tạo lúc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Đang tải...</td></tr>
              ) : chats.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Không có đoạn hội thoại nào</td></tr>
              ) : (
                chats.map((chat) => (
                  <tr key={chat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-400 text-xs tracking-wider">
                      {chat.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">@{chat.user?.username || 'Khách'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        <MessageSquare size={13} />
                        {chat._count.messages} tin nhắn trao đổi
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2 text-slate-500">
                      <Calendar size={14} />
                      {new Date(chat.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
