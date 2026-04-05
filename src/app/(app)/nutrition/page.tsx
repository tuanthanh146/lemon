'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Camera, Type, Upload, Save, AlertCircle, CheckCircle, Apple, Clock, Flame } from 'lucide-react';
import axios from '@/lib/api/axios';
import clsx from 'clsx';

function resizeImage(file: File, maxSize: number = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function NutritionPage() {
  const [mode, setMode] = useState<'image' | 'text'>('image');
  const [foodName, setFoodName] = useState('');
  const [portion, setPortion] = useState('');
  const [notes, setNotes] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/nutrition');
      setLogs(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file);
      setImageBase64(resized);
      setResult(null);
    } catch (err) {
      alert("Lỗi khi xử lý ảnh. Vui lòng thử lại.");
    }
  };

  const processImage = async () => {
    if (!imageBase64) return;
    setLoading(true);
    try {
      const res = await axios.post('/nutrition/estimate-image', { imageBase64, notes });
      setResult(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Lỗi khi phân tích bằng AI");
    } finally {
      setLoading(false);
    }
  };

  const processText = async () => {
    if (!foodName) return;
    setLoading(true);
    try {
      const res = await axios.post('/nutrition/estimate-text', { foodName, portion });
      setResult(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Lỗi khi phân tích bằng AI");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLog = async () => {
    if (!result) return;
    try {
      await axios.post('/nutrition', {
        foodName: mode === 'text' ? foodName : 'Món ăn từ ảnh',
        image: mode === 'image' ? imageBase64 : null,
        calories: result.calories,
        items: result.items,
        confidence: result.confidence,
        notes: result.notes || notes,
      });
      alert("Lưu thành công!");
      fetchLogs();
      // Reset form
      setResult(null);
      setImageBase64(null);
      setFoodName('');
      setPortion('');
      setNotes('');
    } catch (e) {
      alert("Lỗi khi lưu vào nhật ký.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2 mb-2">
          <Utensils className="text-teal-500" size={32} /> Dinh dưỡng & Calo
        </h2>
        <p className="text-slate-500">Tiên đoán Calo món ăn chỉ bằng một bức ảnh hoặc tên món.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Inputs */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          
          {/* Mode Switcher */}
          <div className="bg-white p-2 border border-slate-200 rounded-full flex shadow-sm">
            <button
              onClick={() => { setMode('image'); setResult(null); }}
              className={clsx("flex-1 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all", mode === 'image' ? "bg-teal-500 text-white shadow-md shadow-teal-500/20" : "text-slate-400 hover:bg-slate-50")}
            >
              <Camera size={18} /> Phân tích bằng Ảnh
            </button>
            <button
              onClick={() => { setMode('text'); setResult(null); }}
              className={clsx("flex-1 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all", mode === 'text' ? "bg-teal-500 text-white shadow-md shadow-teal-500/20" : "text-slate-400 hover:bg-slate-50")}
            >
              <Type size={18} /> Nhập tên món
            </button>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 md:p-8 shadow-soft border border-slate-100">
            {mode === 'image' ? (
              <div className="space-y-6">
                <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={clsx(
                    "w-full h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative",
                    imageBase64 ? "border-teal-500 bg-black/5" : "border-slate-300 hover:bg-slate-50 bg-white"
                  )}
                >
                  {imageBase64 ? (
                    <img src={imageBase64} alt="Food Uploaded" className="object-cover w-full h-full opacity-90" />
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center mb-4">
                        <Upload size={28} />
                      </div>
                      <p className="text-slate-600 font-bold">Chạm để Upload ảnh món ăn</p>
                      <p className="text-slate-400 text-xs mt-1">Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB)</p>
                    </>
                  )}
                  {imageBase64 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-full">Đổi ảnh khác</span>
                    </div>
                  )}
                </div>

                <textarea
                  placeholder="Ghi chú thêm (VD: Mình có dặn ít cơm, món này hơi ngọt...)"
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:border-teal-400 outline-none resize-none" rows={2}
                />

                <button
                  onClick={processImage}
                  disabled={!imageBase64 || loading}
                  className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900 transition disabled:opacity-50 disabled:grayscale"
                >
                  {loading ? <span className="animate-spin text-white">⟳</span> : <SparklesIcon />}
                  {loading ? 'AI Đang nhìn món ăn...' : 'Nhờ AI phân tích Calo'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tên món ăn (hoặc menu)</label>
                  <input
                    type="text"
                    value={foodName} onChange={(e) => setFoodName(e.target.value)}
                    placeholder="VD: Phở bò tái nạm, Cơm tấm sườn bì chả..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm focus:border-teal-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Khẩu phần (Tùy chọn)</label>
                  <input
                    type="text"
                    value={portion} onChange={(e) => setPortion(e.target.value)}
                    placeholder="VD: 1 tô vừa, thêm hành, 200g sườn..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm focus:border-teal-400 outline-none"
                  />
                </div>
                <button
                  onClick={processText}
                  disabled={!foodName || loading}
                  className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900 transition disabled:opacity-50 disabled:grayscale"
                >
                  {loading ? <span className="animate-spin text-white">⟳</span> : <SparklesIcon />}
                  {loading ? 'AI Đang tính toán dữ liệu...' : 'Ước tính Calo'}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Col: Results & History */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <AnimatePresence mode="popLayout">
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-[32px] p-1 shadow-lg shadow-teal-500/30 overflow-hidden"
              >
                <div className="bg-white/95 backdrop-blur-3xl rounded-[28px] p-6 lg:p-8 relative">
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                    {result.confidence === 'Cao' ? <CheckCircle size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-amber-500" />}
                    <span className="text-xs font-bold text-slate-600">Độ tin cậy: {result.confidence}</span>
                  </div>
                  
                  <div className="text-center mt-4 border-b border-slate-100 pb-6 mb-6">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Tổng Calo Ước Tính</p>
                    <h3 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
                      ~{result.calories} <span className="text-xl text-slate-400">kcal</span>
                    </h3>
                  </div>

                  {result.items?.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Apple size={14} /> Chi tiết thành phần</h4>
                      {result.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div>
                            <p className="font-bold text-sm text-slate-700">{item.name}</p>
                            <p className="text-[10px] uppercase text-slate-400 tracking-wider">Khẩu phần: {item.portion}</p>
                          </div>
                          <span className="font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md text-sm">{item.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.notes && (
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-sm text-indigo-800 mb-6 font-medium">
                      <span className="font-bold text-indigo-600 block mb-1">AI Ghi chú:</span> {result.notes}
                    </div>
                  )}

                  <button
                    onClick={handleSaveToLog}
                    className="w-full group bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <Save className="w-5 h-5 group-hover:animate-bounce" /> Lưu vào Nhật Ký Ăn Uống
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          <div className="bg-white rounded-[32px] p-6 shadow-soft border border-slate-100 h-[400px] flex flex-col">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Clock size={18} className="text-teal-500" /> Hệ thống log gần đây
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
              {logs.length === 0 ? (
                <p className="text-center text-slate-400 text-sm mt-8">Chưa có dữ liệu nào. Hãy bắt đầu lưu bữa ăn đầu tiên!</p>
              ) : (
                logs.map((log: any) => (
                  <div key={log.id} className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                    <div className="w-16 h-16 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden relative">
                      {log.image ? <img src={log.image} alt="Food" className="w-full h-full object-cover" /> : <Utensils size={24} />}
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-bold text-slate-700 text-sm">{log.foodName || 'Bữa ăn từ ảnh'}</h4>
                      <p className="text-xs text-slate-400 mb-1">{new Date(log.createdAt).toLocaleString('vi-VN')}</p>
                      <div className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md text-xs font-bold font-mono">
                        <Flame size={12} /> {log.calories} kcal
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </motion.div>
      </div>

    </div>
  );
}

function SparklesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18"/><path d="M3 12h18"/><path d="M6.3 6.3l11.4 11.4"/><path d="M17.7 6.3l-11.4 11.4"/>
    </svg>
  );
}
