import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/adminAuth';

export async function GET(req: Request) {
  try {
    const adminId = await checkAdmin(req);
    if (!adminId) return NextResponse.json({ error: 'Unauthorized or Forbidden' }, { status: 403 });

    const totalUsers = await prisma.user.count();
    const totalJournals = await prisma.journal.count();
    const totalChats = await prisma.chatSession.count();
    const totalInsights = await prisma.insight.count();
    const totalNutritionLogs = await prisma.nutritionLog.count();

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalJournals,
        totalChats,
        totalInsights,
        totalNutritionLogs
      }
    });
  } catch (error: any) {
    console.error('Admin Summary API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
