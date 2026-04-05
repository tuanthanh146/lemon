"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { MessageSquare, Calendar, Eye, X, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminChatsPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedChat, setSelectedChat] = useState<any>(null);

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
    <div className="space-y-6 max-w-6xl relative">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Thống Kê Tương Tác Trợ Lý</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ghi chú: Bạn đẵ sử dụng quyền Admin cấp cao để vượt rào xem trực tiếp nội dung hội thoại.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Tài Khoản Hành Động</th>
                <th className="px-6 py-4 font-semibold">Số lượng tin nhắn</th>
                <th className="px-6 py-4 font-semibold">Khởi tạo lúc</th>
                <th className="px-6 py-4 font-semibold text-right">Hành động</th>
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
                    <td className="px-6 py-4 font-bold text-slate-700">@{chat.user?.username || 'Khách'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        <MessageSquare size={13} />
                        {chat._count.messages} tin nhắn trao đổi
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <Calendar size={14} className="inline mr-2 -mt-0.5" />
                      {new Date(chat.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedChat(chat)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium">
                        <Eye size={16} /> Xem Nội Dung
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">
              Trang trước
            </button>
            <span className="text-sm text-slate-500">Trang {page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">
              Trang sau
            </button>
          </div>
        )}
      </div>

      {/* Chat Reader Modal */}
      <AnimatePresence>
        {selectedChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-800">Transcript Cuộc Trò Chuyện</h3>
                  <p className="text-xs text-slate-500">
                    User: @{selectedChat.user?.username} • {new Date(selectedChat.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <button onClick={() => setSelectedChat(null)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                {selectedChat.messages?.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm">Chưa có tin nhắn nào trong phiên này.</p>
                ) : (
                  selectedChat.messages?.map((msg: any) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-teal-500 text-white' : 'bg-white border border-slate-200 text-teal-600'}`}>
                         {msg.role === 'user' ? <User size={16}/> : <Bot size={16}/>}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'bg-teal-500 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
