import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/adminAuth';

export async function GET(req: Request) {
  try {
    const adminId = await checkAdmin(req);
    if (!adminId) return NextResponse.json({ error: 'Unauthorized or Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const chats = await prisma.chatSession.findMany({
      select: {
        id: true,
        createdAt: true,
        user: { select: { username: true } },
        _count: { select: { messages: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.chatSession.count();

    return NextResponse.json({
      success: true,
      data: chats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Admin Chats API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
