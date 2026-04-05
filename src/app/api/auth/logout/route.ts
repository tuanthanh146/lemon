import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyAccessToken(token);

    if (payload?.sub) {
      const userId = payload.sub as string;
      // Revoke refresh token
      await prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null },
      });
    }

    return NextResponse.json({ success: true, data: { message: 'Logged out' } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
