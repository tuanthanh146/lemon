import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, BookHeart, LogOut } from 'lucide-react'
import clsx from 'clsx'

import JournalForm from '../components/JournalForm'
import CoachChat from '../components/CoachChat'
import Dashboard from '../components/Dashboard'
import { getCoachResponse } from '../utils/coachLogic'
import { useAuth } from '../contexts/AuthContext'

// Mock Data preserved
const MOCK_ENTRIES = [
    { mood: 7, note: 'Hôm nay cảm thấy bình thường, đi bộ nhẹ nhàng.', date: new Date(Date.now() - 86400000 * 2).toISOString() },
    { mood: 4, note: 'Hơi đau đầu vì thời tiết thay đổi.', date: new Date(Date.now() - 86400000 * 1).toISOString() },
    { mood: 8, note: 'Ngủ rất ngon, cảm thấy tràn đầy năng lượng!', date: new Date(Date.now()).toISOString() }
]

export default function HomePage() {
    const { user, logout } = useAuth()
    const [viewMode, setViewMode] = useState('journal') // 'journal' | 'dashboard'
    const [entries, setEntries] = useState(MOCK_ENTRIES)
    const [messages, setMessages] = useState([
        {
            sender: 'coach',
            text: 'Chào bạn! Mình là Health Coach. Hôm nay bạn muốn chia sẻ điều gì về sức khỏe không?'
        }
    ])

    const handleJournalSubmit = (data) => {
        // Save entry
        const newEntry = { ...data, date: new Date().toISOString() }
        setEntries(prev => [...prev, newEntry])

        // User message
        const userMsg = {
            sender: 'user',
            text: `[Tâm trạng: ${data.mood}/10] ${data.note}`
        }
        setMessages(prev => [...prev, userMsg])

        // Simulate thinking
        setMessages(prev => [...prev, { sender: 'coach', text: '...', isTyping: true }])

        // Coach Response
        setTimeout(() => {
            const advice = getCoachResponse(data, entries)
            setMessages(prev => {
                const withoutThinking = prev.slice(0, -1)
                return [...withoutThinking, { sender: 'coach', text: advice }]
            })
        }, 1500)
    }

    const handleSendMessage = (text) => {
        // User message
        setMessages(prev => [...prev, { sender: 'user', text }])

        // Simulate thinking
        setMessages(prev => [...prev, { sender: 'coach', text: '...', isTyping: true }])

        // Connected to Coach Logic
        setTimeout(() => {
            const tempEntry = {
                note: text,
                mood: 5,
                sleep: 0,
                water: 0
            }

            const advice = getCoachResponse(tempEntry, entries)

            setMessages(prev => {
                const withoutThinking = prev.slice(0, -1)
                return [...withoutThinking, {
                    sender: 'coach',
                    text: advice
                }]
            })
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100 flex flex-col font-sans text-slate-800">

            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-white/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
                        <BookHeart size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-emerald-600">
                            Health Journal Coach
                        </h1>
                        <p className="text-xs text-slate-500 font-medium tracking-wide">YOUR PERSONAL WELLNESS COMPANION</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Navigation Tabs */}
                    <nav className="hidden md:flex bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
                        <button
                            onClick={() => setViewMode('journal')}
                            className={clsx(
                                "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2",
                                viewMode === 'journal'
                                    ? "bg-white text-teal-700 shadow-sm"
                                    : "text-slate-500 hover:text-teal-600"
                            )}
                        >
                            <BookHeart size={18} /> Nhật ký
                        </button>
                        <button
                            onClick={() => setViewMode('dashboard')}
                            className={clsx(
                                "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2",
                                viewMode === 'dashboard'
                                    ? "bg-white text-teal-700 shadow-sm"
                                    : "text-slate-500 hover:text-teal-600"
                            )}
                        >
                            <LayoutDashboard size={18} /> Tổng quan
                        </button>
                    </nav>

                    {/* User + Logout */}
                    <div className="flex items-center gap-3">
                        {user && (
                            <span className="text-sm text-slate-500 font-medium hidden sm:block max-w-[120px] truncate">
                                {user.username}
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

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
                <AnimatePresence mode="wait">
                    {viewMode === 'journal' ? (
                        <motion.div
                            key="journal"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]"
                        >
                            {/* Left Column: Chat */}
                            <div className="lg:col-span-5 h-full flex flex-col">
                                <CoachChat messages={messages} onSendMessage={handleSendMessage} />
                            </div>

                            {/* Right Column: Journal Form */}
                            <div className="lg:col-span-7 h-full overflow-y-auto pb-4">
                                <JournalForm onSubmit={handleJournalSubmit} />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                        >
                            <Dashboard entries={entries} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
