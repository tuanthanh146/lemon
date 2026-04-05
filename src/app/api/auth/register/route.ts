import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signTokens } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password || username.length < 3 || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password (min 3 for user, 6 for pass)' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
      },
    });

    // Auto login
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
