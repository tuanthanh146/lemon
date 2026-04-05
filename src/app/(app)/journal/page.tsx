'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import JournalForm from '@/components/JournalForm';
import CoachChat from '@/components/CoachChat';
import axios from '@/lib/api/axios';

export default function JournalPage() {
  const [messages, setMessages] = useState<any[]>([
    {
      sender: 'coach',
      text: 'Chào bạn! Mình là Health Coach. Báo cáo Tình trạng Sức khỏe của bạn hôm nay nhé!'
    }
  ]);

  const handleJournalSubmit = async (data: any) => {
    try {
      // Gọi API lưu nhật ký
      await axios.post('/journal', {
        mood: data.mood || 5,
        notes: data.note || '',
        sleepHours: data.sleep ? Number(data.sleep) : null,
        water: data.water ? Number(data.water) : null,
        weight: data.weight ? Number(data.weight) : null,
        calories: data.calories ? Number(data.calories) : null,
        meals: data.meals || '',
        workout: data.workout || '' // map any needed fields from form
      });

      // Tự động nhắn tin với Coach dựa trên nội dung nhật ký
      const msgText = `[Nhật ký sức khỏe] Tâm trạng: ${data.mood || 5}/10. ${data.note ? 'Ghi chú: ' + data.note : ''}`;
      handleSendMessage(msgText);
      
    } catch (error) {
      console.error('Lỗi khi lưu nhật ký:', error);
    }
  };

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

      const { data } = await axios.post('/coach/chat', { messages: chatHistory });
      const reply = data.data; // Expected { reply: "...", actions_today: [], warning: false }

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
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]"
    >
      <div className="lg:col-span-5 h-full flex flex-col">
        <CoachChat messages={messages} onSendMessage={handleSendMessage} />
      </div>
      <div className="lg:col-span-7 h-full overflow-y-auto pb-4">
        <JournalForm onSubmit={handleJournalSubmit} />
      </div>
    </motion.div>
  );
}
