import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({}, { status: 401 });
    const payload = await verifyAccessToken(authHeader.split(' ')[1]);
    if (!payload?.sub) return NextResponse.json({}, { status: 401 });

    const userId = payload.sub as string;
    const { id: sessionId } = await params;

    const session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
                select: { id: true, role: true, content: true, createdAt: true }
            }
        }
    });

    if (!session) {
        return NextResponse.json({ success: false, error: 'Session not found or forbidden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: session });
  } catch (error: any) {
    console.error('Fetch Session Detail API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({}, { status: 401 });
      const payload = await verifyAccessToken(authHeader.split(' ')[1]);
      if (!payload?.sub) return NextResponse.json({}, { status: 401 });
  
      const userId = payload.sub as string;
      const { id: sessionId } = await params;
  
      // Verify Ownership
      const session = await prisma.chatSession.findFirst({
          where: { id: sessionId, userId }
      });
  
      if (!session) {
          return NextResponse.json({ success: false, error: 'Session not found or forbidden' }, { status: 404 });
      }
      
      // Delete 
      await prisma.chatSession.delete({
          where: { id: sessionId }
      });
  
      return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
      console.error('Delete Session API Error:', error);
      return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
  }
