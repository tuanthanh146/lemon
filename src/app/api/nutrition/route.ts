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

    const logs = await prisma.nutritionLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({}, { status: 401 });
    const payload = await verifyAccessToken(authHeader.split(' ')[1]);
    if (!payload?.sub) return NextResponse.json({}, { status: 401 });

    const userId = payload.sub as string;
    const body = await req.json();

    const newLog = await prisma.nutritionLog.create({
      data: {
        userId,
        image: body.image || null,
        foodName: body.foodName || null,
        calories: body.calories,
        items: JSON.stringify(body.items || []),
        confidence: body.confidence || 'Thấp',
        notes: body.notes || '',
      },
    });

    return NextResponse.json({ success: true, data: newLog }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
