import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalize } from '@/lib/foodSearch';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q) {
      const all = await prisma.foodCalories.findMany({ take: 20 });
      return NextResponse.json({ success: true, data: all });
    }

    const normQ = normalize(q);
    const all = await prisma.foodCalories.findMany();
    
    // Fake fuzzy filter for list endpoint
    const filtered = all.filter(f => normalize(f.name).includes(normQ));

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
