'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, RefreshCw, BarChart2, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ComposedChart, Bar, Line } from 'recharts';
import axios from '@/lib/api/axios';

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ chartData: any[], report: any } | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/insights');
      // Format dates for charts
      const rawData = res.data.data;
      const formattedCharts = rawData.chartData.map((item: any) => ({
        ...item,
        dateFormatted: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
      }));
      setData({ ...rawData, chartData: formattedCharts });
    } catch (error) {
      console.error('Lỗi khi fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMock = async () => {
    setGenerating(true);
    try {
      // Fast mock data generation via inline API call directly if needed, or just let users know we're adding it
      await axios.post('/insights/mock');
      await fetchInsights();
    } catch (e) {
      alert("Tạo mock data thành công (cần F5 để xem lại dữ liệu nếu không tự tải).");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-teal-600 animate-pulse font-medium">Đang nhờ AI phân tích dữ liệu 14 ngày qua...</div>;
  }

  if (!data?.chartData || data.chartData.length === 0) {
    return (
      <div className="p-8 bg-white/50 backdrop-blur-md rounded-[32px] text-center border border-slate-200 shadow-sm max-w-2xl mx-auto mt-12">
        <BarChart2 size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Chưa có đủ dữ liệu</h2>
        <p className="text-slate-500 mb-6">Bạn cần viết ít nhất 1 nhật ký để AI có thể phân tích xu hướng nhé.</p>
        <button 
          onClick={handleGenerateMock}
          disabled={generating}
          className="px-6 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition shadow-lg disabled:opacity-50"
        >
          {generating ? 'Đang tạo...' : 'Tự động tạo 14 ngày dữ liệu ảo (Test)'}
        </button>
      </div>
    );
  }

  const { report, chartData } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6 pb-12"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="text-teal-500" /> Báo cáo Chuyên sâu (14 ngày)
        </h2>
        <button onClick={fetchInsights} className="p-2 bg-white rounded-full shadow text-slate-400 hover:text-teal-600 transition">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* AI Report Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20 mb-4 backdrop-blur-md">
              <Sparkles size={14} className="text-indigo-200" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">AI Lemon Report</span>
            </div>
            <h3 className="text-2xl font-bold leading-relaxed mb-2">
              {report?.summary || "Dữ liệu đang được tổng hợp."}
            </h3>
          </div>
          
          <div className="bg-black/20 p-5 rounded-2xl backdrop-blur-md border border-white/10">
            <h4 className="text-sm font-bold text-indigo-200 mb-3 flex items-center gap-2">
              <TrendingUp size={16} /> Lời khuyên cho tuần tới
            </h4>
            <ul className="space-y-2">
              {report?.recommendations?.map((rec: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-indigo-50 items-start">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-500/50 flex flex-col items-center justify-center text-[10px] font-bold mt-0.5">{i+1}</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Mood vs Sleep */}
        <div className="bg-white rounded-[32px] p-6 shadow-soft border border-slate-100 h-[380px] flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-lg text-slate-700">Cảm xúc & Giấc ngủ</h3>
            <p className="text-xs text-slate-400">Giấc ngủ (giờ) so với Cảm xúc (thang 10)</p>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                <YAxis yAxisId="left" hide domain={[0, 10]} />
                <YAxis yAxisId="right" orientation="right" hide domain={[0, 12]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar yAxisId="right" dataKey="sleep" name="Giấc ngủ (h)" fill="#c7d2fe" radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="left" type="monotone" dataKey="mood" name="Cảm xúc (1-10)" stroke="#14b8a6" strokeWidth={3} dot={{ strokeWidth: 2, r: 4, fill: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calories vs Weight */}
        <div className="bg-white rounded-[32px] p-6 shadow-soft border border-slate-100 h-[380px] flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-lg text-slate-700">Calo & Cân nặng</h3>
            <p className="text-xs text-slate-400">Tương quan Calories nạp và Cân nặng (kg)</p>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                <YAxis yAxisId="left" hide domain={['dataMin - 500', 'dataMax + 500']} />
                <YAxis yAxisId="right" orientation="right" hide domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar yAxisId="left" dataKey="calories" name="Calo nạp (kcal)" fill="#fed7aa" radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="weight" name="Cân nặng (kg)" stroke="#f43f5e" strokeWidth={3} dot={{ strokeWidth: 2, r: 4, fill: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
