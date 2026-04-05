"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, FileText, MessageSquare, Flame, PieChart, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get('/api/admin/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-slate-500 animate-pulse">Đang tải dữ liệu tổng quan...</div>;
  }

  const statCards = [
    { title: 'Tổng User', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-500' },
    { title: 'Nhật ký sức khỏe', value: stats?.totalJournals || 0, icon: FileText, color: 'bg-emerald-500' },
    { title: 'Lượt Chat Coach', value: stats?.totalChats || 0, icon: MessageSquare, color: 'bg-purple-500' },
    { title: 'Lượt tra cứu Món ăn', value: stats?.totalNutritionLogs || 0, icon: Flame, color: 'bg-orange-500' },
    { title: 'Báo cáo AI (Insights)', value: stats?.totalInsights || 0, icon: PieChart, color: 'bg-teal-500' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tổng Quan Hệ Thống</h1>
        <p className="text-sm text-slate-500 mt-1">Dữ liệu thời gian thực từ cộng đồng Lemon</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl text-white flex items-center justify-center shrink-0 ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-teal-500"/>
          Tính trạng Server
        </h3>
        <p className="text-sm text-slate-600">
          Tất cả các dịch vụ (Database, AI Router, Upload) đang hoạt động ổn định.
        </p>
      </div>
    </div>
  );
}
