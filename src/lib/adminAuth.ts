import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

export async function checkAdmin(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = await verifyAccessToken(authHeader.split(' ')[1]);
  if (!payload?.sub) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub as string },
    select: { role: true, isLocked: true }
  });

  if (!user || user.isLocked || user.role !== 'ADMIN') {
    return null;
  }

  return payload.sub as string;
}
