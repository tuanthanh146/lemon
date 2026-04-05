import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, hashPassword, signTokens, verifyRefreshToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'No refresh token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyRefreshToken(token);

    if (!payload?.sub) {
      return NextResponse.json({ success: false, error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    const userId = payload.sub as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.refreshTokenHash) {
      return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 401 });
    }

    // Compare with hash in DB
    const rtMatches = await comparePassword(token, user.refreshTokenHash);
    if (!rtMatches) {
      return NextResponse.json({ success: false, error: 'Access Denied' }, { status: 401 });
    }

    // Rotate tokens
    const tokens = await signTokens({ sub: user.id, username: user.username });
    const newRefreshTokenHash = await hashPassword(tokens.refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: newRefreshTokenHash },
    });

    return NextResponse.json({
      success: true,
      data: tokens,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
