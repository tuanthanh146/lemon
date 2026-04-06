import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({}, { status: 401 });
    const payload = await verifyAccessToken(authHeader.split(' ')[1]);
    if (!payload?.sub) return NextResponse.json({}, { status: 401 });

    const userId = payload.sub as string;

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        _count: { select: { messages: true } },
        messages: {
            take: 1,
            where: { role: 'user' },
            orderBy: { createdAt: 'asc' },
            select: { content: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format the response to extract initial message as title
    const formattedSessions = sessions.map(session => ({
        id: session.id,
        createdAt: session.createdAt,
        messageCount: session._count.messages,
        title: session.messages[0]?.content || 'Cuộc trò chuyện mới'
    }));

    return NextResponse.json({ success: true, data: formattedSessions });
  } catch (error: any) {
    console.error('Fetch Sessions API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
