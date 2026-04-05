import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, hashPassword, signTokens } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing credentials' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const tokens = await signTokens({ sub: user.id, username: user.username });
    const refreshTokenHash = await hashPassword(tokens.refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...tokens,
        user: { id: user.id, username: user.username, createdAt: user.createdAt },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
