import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({}, { status: 401 });
    const payload = await verifyAccessToken(authHeader.split(' ')[1]);
    if (!payload?.sub) return NextResponse.json({}, { status: 401 });

    const userId = payload.sub as string;

    // Generate 14 days of mock data
    const mockJournals = [];
    const today = new Date();
    
    // Random variations around a base
    let baseWeight = 65.0;
    
    for (let i = 14; i >= 1; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      const mood = Math.floor(Math.random() * 5) + 5; // 5 to 9
      const sleepHours = (Math.random() * 2 + 6).toFixed(1); // 6 to 8
      const water = Math.floor(Math.random() * 4) + 4; // 4 to 7
      const calories = Math.floor(Math.random() * 500) + 1800; // 1800 to 2300
      
      // Slight weight fluctuation
      baseWeight += (Math.random() * 0.4 - 0.2); 

      mockJournals.push({
        userId,
        date: d,
        mood,
        sleepHours: Number(sleepHours),
        water: water,
        calories: calories,
        weight: Number(baseWeight.toFixed(1)),
        notes: 'Dữ liệu mock tự sinh',
      });
    }

    await prisma.journal.createMany({
      data: mockJournals
    });

    return NextResponse.json({ success: true, message: 'Đã tạo xong dữ liệu ảo 14 ngày' });
  } catch (error: any) {
    console.error('Mock API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
