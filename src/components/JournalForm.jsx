import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Smile, Moon, Droplets, Utensils, Sparkles, Plus, Minus } from 'lucide-react'
import clsx from 'clsx'

export default function JournalForm({ onSubmit }) {
    const [note, setNote] = useState('')
    const [mood, setMood] = useState(7)
    const [sleep, setSleep] = useState(7)
    const [water, setWater] = useState(4)
    const [calories, setCalories] = useState('')
    const [weight, setWeight] = useState('')
    const [meals, setMeals] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!note.trim()) return
        onSubmit({ note, mood, sleep, water, meals, calories, weight })
        setNote('')
        setMeals('')
    }

    const getMoodIcon = (m) => {
        // Simple emoji mapping based on value
        if (m >= 9) return "🤩"
        if (m >= 7) return "🙂"
        if (m >= 5) return "😐"
        if (m >= 3) return "😔"
        return "😫"
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 backdrop-blur-xl rounded-[32px] p-6 md:p-8 shadow-soft border border-white/60 h-full flex flex-col relative overflow-hidden"
        >
            {/* Decorative Background Alignments */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

            <div className="mb-8 relative z-10">
                <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-2 h-8 bg-teal-500 rounded-full inline-block"></span>
                    Nhật ký sức khỏe
                </h2>
                <p className="text-slate-500 text-sm">Ghi lại chỉ số cơ thể & cảm xúc hôm nay.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-hide relative z-10 pb-4">

                {/* 1. Mood Section */}
                <section>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">1. Cảm xúc</label>
                    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-4xl filter drop-shadow-sm transition-transform duration-300 hover:scale-110 cursor-default">
                                {getMoodIcon(mood)}
                            </span>
                            <span className="text-2xl font-bold text-teal-600">{mood}<span className="text-sm text-slate-400 font-normal">/10</span></span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={mood}
                            onChange={(e) => setMood(Number(e.target.value))}
                            className="w-full h-4 bg-slate-200 rounded-full appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all"
                            style={{
                                background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${mood * 10}%, #e2e8f0 ${mood * 10}%, #e2e8f0 100%)`
                            }}
                        />
                        <div className="flex justify-between mt-3 text-xs text-slate-400 font-medium px-1">
                            <span>Tệ</span>
                            <span>Bình thường</span>
                            <span>Tuyệt vời</span>
                        </div>
                    </div>
                </section>

                {/* 2. Sleep & Water Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Sleep */}
                    <section className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-3">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <Moon size={18} className="text-indigo-500" />
                            <span className="text-xs font-bold uppercase">Giấc ngủ</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => setSleep(Math.max(0, sleep - 0.5))} className="p-1 rounded-full hover:bg-slate-100 text-slate-400"><Minus size={16} /></button>
                            <span className="text-2xl font-bold text-slate-700 w-16 text-center">{sleep} <span className="text-xs font-medium text-slate-400">h</span></span>
                            <button type="button" onClick={() => setSleep(Math.min(24, sleep + 0.5))} className="p-1 rounded-full hover:bg-slate-100 text-slate-400"><Plus size={16} /></button>
                        </div>
                    </section>

                    {/* Water */}
                    <section className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-3">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <Droplets size={18} className="text-cyan-500" />
                            <span className="text-xs font-bold uppercase">Nước</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => setWater(Math.max(0, water - 1))} className="p-1 rounded-full hover:bg-slate-100 text-slate-400"><Minus size={16} /></button>
                            <span className="text-2xl font-bold text-slate-700 w-16 text-center">{water} <span className="text-xs font-medium text-slate-400">cốc</span></span>
                            <button type="button" onClick={() => setWater(water + 1)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400"><Plus size={16} /></button>
                        </div>
                    </section>
                </div>

                {/* 3. Meals, Calories & Weight Grid */}
                <section className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Utensils size={14} /> 3. Dinh dưỡng & Thể trạng
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={meals}
                            onChange={(e) => setMeals(e.target.value)}
                            placeholder="Hôm nay bạn ăn Healthy không?..."
                            className="col-span-1 md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
                        />
                        <div className="relative">
                            <input
                                type="number"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value)}
                                placeholder="Calo nạp"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">kcal</span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="Cân nặng"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">kg</span>
                        </div>
                    </div>
                </section>

                {/* 4. Notes */}
                <section className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">4. Ghi chú thêm</label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Chia sẻ thêm về ngày của bạn..."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400 resize-none"
                    ></textarea>
                </section>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!note.trim()}
                    className="w-full group bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale"
                >
                    <Save className="w-5 h-5 group-hover:animate-bounce" />
                    Lưu Nhật Ký
                </button>

                {/* Bonus: AI Preview */}
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 flex items-start gap-3 opacity-80 hover:opacity-100 transition-opacity cursor-pointer group">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-500 group-hover:scale-110 transition-transform">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-indigo-700 mb-1">AI Suggestion Preview</h4>
                        <p className="text-[10px] text-slate-500 leading-normal">
                            Dựa trên dữ liệu, Coach sẽ đề xuất bài tập thở 5 phút nếu mức độ căng thẳng {'>'} 7.
                        </p>
                    </div>
                </div>
            </form>
        </motion.div>
    )
}
