'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Dashboard from '@/components/Dashboard';
import axios from '@/lib/api/axios';

export default function DashboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const { data } = await axios.get('/journal');
        // Map from DB schema to what Dashboard component expects
        const mappedEntries = data.data.map((j: any) => ({
          id: j.id,
          mood: j.mood,
          note: j.notes,
          sleep: j.sleepHours,
          date: j.date,
          water: j.water || 0,
          weight: j.weight || 0,
          calories: j.calories || 0
        }));
        setEntries(mappedEntries.reverse()); // Reverse to put oldest first if Dashboard expects ascending order, wait, API returns desc. Dashboard reverses it for list, but for chart it expects ascending date! So reverse it.
      } catch (error) {
        console.error('Failed to fetch journals', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJournals();
  }, []);

  if (loading) return <div className="p-8 text-center text-teal-800 font-medium">Đang tải dữ liệu...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <Dashboard entries={entries} />
    </motion.div>
  );
}
