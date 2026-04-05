import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({}, { status: 401 });
    const payload = await verifyAccessToken(authHeader.split(' ')[1]);
    if (!payload?.sub) return NextResponse.json({}, { status: 401 });

    const journals = await prisma.journal.findMany({
      where: { userId: payload.sub as string },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data: journals });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({}, { status: 401 });
    const payload = await verifyAccessToken(authHeader.split(' ')[1]);
    if (!payload?.sub) return NextResponse.json({}, { status: 401 });

    const body = await req.json();
    const journal = await prisma.journal.create({
      data: {
        userId: payload.sub as string,
        mood: body.mood,
        notes: body.notes,
        meals: body.meals,
        workout: body.workout,
        sleepHours: body.sleepHours,
        water: body.water,
        weight: body.weight,
        calories: body.calories,
      },
    });

    return NextResponse.json({ success: true, data: journal });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
