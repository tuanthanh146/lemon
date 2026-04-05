import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, YAxis } from 'recharts'
import { Activity, Moon, Droplets, Footprints, Weight, ChevronRight, Calendar, Zap, Award } from 'lucide-react'
import clsx from 'clsx'

// --- Components ---

const CircleProgress = ({ score, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const dash = circumference * (score / 10)

    return (
        <div className="relative flex items-center justify-center p-4">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-white/20"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - dash}
                    strokeLinecap="round"
                    className="text-white transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-3xl font-bold">{score}</span>
                <span className="text-[10px] uppercase opacity-80 font-medium">Score</span>
            </div>
        </div>
    )
}

const MetricCard = ({ icon: Icon, label, value, unit, colorClass, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white rounded-[24px] p-5 shadow-soft border border-slate-100 flex flex-col items-center justify-center gap-3 group hover:-translate-y-1 transition-transform"
    >
        <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform", colorClass)}>
            <Icon size={24} />
        </div>
        <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-800">{value} <span className="text-xs font-medium text-slate-400">{unit}</span></h3>
            <p className="text-sm font-medium text-slate-400">{label}</p>
        </div>
    </motion.div>
)

const PlanItem = ({ icon: Icon, text, time, done, onToggle }) => (
    <div 
        onClick={onToggle}
        className={clsx(
        "flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer",
        done ? "bg-teal-50 border-teal-100" : "bg-white/10 border-white/20 hover:bg-slate-50"
    )}>
        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0", done ? "text-teal-600 bg-white" : "text-slate-400 bg-slate-100")}>
            <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
            <p className={clsx("text-sm font-bold truncate", done ? "text-teal-800 line-through opacity-70" : "text-slate-700")}>{text}</p>
            <p className={clsx("text-[10px]", done ? "text-teal-600" : "text-slate-400")}>{time}</p>
        </div>
        {done && <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-white shrink-0"><Award size={10} /></div>}
    </div>
)

// --- Main Layout ---

export default function Dashboard({ entries }) {
    // Plans State
    const [plans, setPlans] = useState([
        { id: 1, text: "Uống 2L nước", time: "7/8 cốc", done: true },
        { id: 2, text: "Đi bộ 5000 bước", time: "5430/5000", done: true },
        { id: 3, text: "Ngủ trước 11h", time: "Tối nay", done: false }
    ]);
    const [newPlan, setNewPlan] = useState("");

    const togglePlan = (id) => {
        setPlans(plans.map(p => p.id === id ? { ...p, done: !p.done } : p));
    };

    const addPlan = (e) => {
        e.preventDefault();
        if (!newPlan.trim()) return;
        setPlans([...plans, { id: Date.now(), text: newPlan, time: "Hôm nay", done: false }]);
        setNewPlan("");
    };

    // 1. Calculate Averages
    const avgScore = entries.length > 0
        ? (entries.reduce((acc, curr) => acc + Number(curr.mood || 0), 0) / entries.length).toFixed(1)
        : 0

    const lastEntry = entries[entries.length - 1] || {}
    const avgSleep = entries.length > 0
        ? (entries.reduce((acc, curr) => acc + Number(curr.sleep || 0), 0) / entries.length).toFixed(1)
        : 0

    // Mock extra data for demo
    const steps = 5430
    const weight = 65.2

    // Chart Data
    const chartData = entries.map(e => ({
        date: new Date(e.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        mood: Number(e.mood || 0)
    })).slice(-7)

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-6xl mx-auto pb-12 space-y-6"
        >
            {/* --- Hero Section --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Health Score Card */}
                <motion.div className="lg:col-span-2 bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-teal-900/20 flex flex-col sm:flex-row items-center justify-between gap-8 h-auto sm:h-64">
                    {/* Decorative Blurs */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl -ml-16 -mb-16"></div>

                    <div className="relative z-10 flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                            <span className="text-xs font-medium tracking-wide">Daily Insight</span>
                        </div>
                        <h2 className="text-3xl font-bold leading-tight">Chào bạn,<br />Hôm nay bạn làm rất tốt!</h2>
                        <p className="text-teal-100 text-sm opacity-90 max-w-sm">
                            Điểm sức khỏe của bạn đang ổn định. Hãy duy trì uống nước và vận động nhẹ nhé.
                        </p>
                    </div>

                    <div className="relative z-10 flex-shrink-0">
                        <CircleProgress score={avgScore} size={140} />
                    </div>
                </motion.div>

                {/* Today's Plan (Side Card) */}
                <motion.div className="bg-white rounded-[32px] p-6 shadow-soft border border-slate-100 flex flex-col sm:h-64 h-auto relative overflow-hidden">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-teal-500" /> Kế hoạch hôm nay
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-12 scrollbar-hide">
                        {plans.map(p => (
                            <PlanItem 
                                key={p.id} 
                                icon={p.text.toLowerCase().includes('nước') ? Droplets : (p.text.toLowerCase().includes('ngủ') ? Moon : Zap)} 
                                text={p.text} 
                                time={p.time} 
                                done={p.done} 
                                onToggle={() => togglePlan(p.id)}
                            />
                        ))}
                    </div>
                    {/* Add Plan Input directly pinned to bottom */}
                    <form onSubmit={addPlan} className="absolute bottom-4 left-6 right-6">
                        <input 
                            type="text" 
                            value={newPlan} 
                            onChange={(e) => setNewPlan(e.target.value)} 
                            placeholder="+ Thêm kế hoạch..." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 placeholder:text-slate-400"
                        />
                    </form>
                </motion.div>
            </div>

            {/* --- Metrics Grid --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={Moon}
                    label="Giấc ngủ TB"
                    value={avgSleep}
                    unit="giờ"
                    colorClass="bg-indigo-50 text-indigo-500"
                    delay={0.1}
                />
                <MetricCard
                    icon={Droplets}
                    label="Đã uống"
                    value={lastEntry.water || 0}
                    unit="cốc"
                    colorClass="bg-cyan-50 text-cyan-500"
                    delay={0.2}
                />
                <MetricCard
                    icon={Footprints}
                    label="Calo nạp"
                    value={lastEntry.calories || 0}
                    unit="kcal"
                    colorClass="bg-orange-50 text-orange-500"
                    delay={0.3}
                />
                <MetricCard
                    icon={Weight}
                    label="Cân nặng"
                    value={lastEntry.weight || 0}
                    unit="kg"
                    colorClass="bg-rose-50 text-rose-500"
                    delay={0.4}
                />
            </div>

            {/* --- Chart & History --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Mood Chart */}
                <motion.div
                    className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-soft border border-slate-100 h-[400px] flex flex-col"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                            <Activity size={20} className="text-teal-500" /> Biểu đồ cảm xúc
                        </h3>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-teal-500 block"></span>
                            <span className="text-xs text-slate-400 font-medium">7 ngày qua</span>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMoodGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis hide domain={[0, 10]} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)',
                                        padding: '12px 16px'
                                    }}
                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="mood"
                                    stroke="#14b8a6"
                                    strokeWidth={3}
                                    fill="url(#colorMoodGradient)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recent History */}
                <motion.div
                    className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-soft border border-slate-100 flex flex-col h-[400px]"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-700">Gần đây</h3>
                        <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-teal-600 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                        {entries.slice().reverse().map((entry, idx) => (
                            <div key={idx} className="group p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {new Date(entry.date).toLocaleDateString('vi-VN')}
                                    </span>
                                    <div className={clsx(
                                        "px-2 py-1 rounded-lg text-xs font-bold",
                                        entry.mood >= 8 ? "bg-emerald-100 text-emerald-600" :
                                            entry.mood >= 5 ? "bg-yellow-50 text-yellow-600" :
                                                "bg-rose-50 text-rose-500"
                                    )}>
                                        {entry.mood}/10
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 line-clamp-2 font-medium leading-relaxed">
                                    {entry.note}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </motion.div>
    )
}
