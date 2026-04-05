import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, User, Sparkles, Send, MoreHorizontal, Settings } from 'lucide-react'
import clsx from 'clsx'

const QUICK_REPLIES = [
    "Ngủ ít 😴",
    "Hơi stress 🤯",
    "Ăn uống thất thường 🍔",
    "Cần động lực 💪",
    "Đau lưng 🦴"
]

export default function CoachChat({ messages, onSendMessage }) {
    const scrollRef = useRef(null)
    const [inputText, setInputText] = useState('')

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = () => {
        if (!inputText.trim()) return
        onSendMessage(inputText)
        setInputText('')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex flex-col h-full bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-soft overflow-hidden relative">
            {/* Chat Header */}
            <div className="px-5 py-4 border-b border-white/60 flex items-center justify-between bg-white/40 sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center text-teal-600 border-2 border-white shadow-sm">
                            <Bot size={22} />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">Lemon</h3>
                        <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold bg-emerald-100/50 px-2 py-0.5 rounded-full inline-block">
                            Phản hồi nhanh
                        </p>
                    </div>
                </div>
                <button className="p-2 rounded-full hover:bg-white/50 text-slate-400 hover:text-teal-600 transition-colors">
                    <Settings size={18} />
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth scrollbar-hide"
            >
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => {
                        const isCoach = msg.sender === 'coach'
                        const isSuggestion = msg.text.includes("💡") // Simple check for highlights

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                                className={clsx(
                                    "flex gap-3 max-w-[90%]",
                                    isCoach ? "self-start" : "self-end flex-row-reverse ml-auto"
                                )}
                            >
                                {/* Avatar */}
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm mt-auto mb-1",
                                    isCoach ? "bg-white border border-slate-100 text-teal-600" : "bg-gradient-to-br from-teal-400 to-emerald-500 text-white"
                                )}>
                                    {isCoach ? <Bot size={16} /> : <User size={16} />}
                                </div>

                                <div className="flex flex-col gap-1">
                                    {/* Name only for first in group (omitted for clean look) */}

                                    {/* Bubble */}
                                    <div className={clsx(
                                        "p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm relative group transition-all hover:shadow-md",
                                        isCoach
                                            ? (isSuggestion ? "bg-amber-50 border border-amber-100 text-slate-800" : "bg-white border border-slate-100 text-slate-700") + " rounded-bl-none"
                                            : "bg-gradient-to-tr from-teal-500 to-emerald-500 text-white rounded-br-none shadow-teal-500/20"
                                    )}>
                                        {msg.isTyping ? (
                                            <div className="flex gap-1 h-5 items-center px-1">
                                                <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-2 h-2 bg-current rounded-full animate-bounce"></span>
                                            </div>
                                        ) : (
                                            <>
                                                {isSuggestion && <Sparkles size={16} className="inline-block mr-2 text-amber-500 mb-1" />}
                                                {msg.text}
                                            </>
                                        )}
                                    </div>

                                    {/* Timestamp */}
                                    <span className={clsx(
                                        "text-[10px] text-slate-400 px-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                        isCoach ? "text-left" : "text-right"
                                    )}>
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Floating Input Area */}
            <div className="p-4 bg-gradient-to-t from-white/90 via-white/80 to-transparent backdrop-blur-sm z-20">

                {/* Quick Replies */}
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mask-fade-right">
                    {QUICK_REPLIES.map((reply, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSendMessage(reply)}
                            className="flex-shrink-0 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 shadow-sm transition-colors whitespace-nowrap"
                        >
                            {reply}
                        </motion.button>
                    ))}
                </div>

                {/* Input Field */}
                <div className="relative group">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhắn tin với Coach..."
                        className="w-full bg-white border border-slate-200 rounded-full py-3.5 pl-5 pr-12 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 shadow-sm transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-teal-500 text-white rounded-full shadow-lg shadow-teal-500/30 hover:bg-teal-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all"
                    >
                        <Send size={16} strokeWidth={2.5} className="-ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
