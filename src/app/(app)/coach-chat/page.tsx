'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import CoachChat from '@/components/CoachChat';
import axios from '@/lib/api/axios';

export default function CoachChatPage() {
  const [messages, setMessages] = useState<any[]>([
    {
      sender: 'coach',
      text: 'Chào bạn! Mình là Lemon. Báo cáo Tình trạng Sức khỏe của bạn hôm nay nhé!'
    }
  ]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleSendMessage = async (text: string) => {
    // 1. Add user msg
    setMessages(prev => [...prev, { sender: 'user', text }]);
    // 2. Mock thinking
    setMessages(prev => [...prev, { sender: 'coach', text: '...', isTyping: true }]);

    try {
      // Create message array for the API (assuming full history sent for stateless logic)
      const chatHistory = messages.filter(m => !m.isTyping).map(m => ({
        role: m.sender === 'coach' ? 'assistant' : 'user',
        content: m.text
      }));
      chatHistory.push({ role: 'user', content: text });

      const { data } = await axios.post('/coach/chat', { messages: chatHistory, sessionId });
      const reply = data.data; // Expected { reply: "...", actions_today: [], warning: false }
      
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      setMessages(prev => {
        const base = prev.slice(0, -1);
        return [...base, { sender: 'coach', text: reply.reply }];
      });
    } catch (e: any) {
      setMessages(prev => {
        const base = prev.slice(0, -1);
        return [...base, { sender: 'coach', text: `Lỗi: ${e.response?.data?.error || e.message}` }];
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-140px)] w-full max-w-3xl mx-auto"
    >
      <CoachChat messages={messages} onSendMessage={handleSendMessage} />
    </motion.div>
  );
}
