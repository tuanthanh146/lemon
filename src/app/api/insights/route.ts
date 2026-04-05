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

    // Fetch the last 14 days of entries
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const journals = await prisma.journal.findMany({
      where: { 
        userId,
        date: { gte: fourteenDaysAgo }
      },
      orderBy: { date: 'asc' }, // Get chronologically
    });

    if (journals.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: { 
           chartData: [],
           report: { summary: "Bạn chưa có dữ liệu nào trong 14 ngày qua.", sentiment: "neutral", recommendations: ["Hãy bắt đầu ghi chú nhật ký ngay hôm nay!"] }
        }
      });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Bạn là một chuyên gia Lemon Coach phân tích dữ liệu lịch sử sức khỏe người dùng. Dữ liệu là JSON của 14 ngày qua (mood, sleepHours, water, calories, weight, meals, notes). 
Trả về JSON NGUYÊN BẢN với định dạng cấu trúc chính xác: 
{ 
  "summary": "Tóm tắt tình trạng tổng quan", 
  "sentiment": "positive | neutral | negative", 
  "recommendations": ["Lời khuyên 1", "Lời khuyên 2", "Lời khuyên 3"] 
}`
          },
          {
            role: 'user',
            content: JSON.stringify(journals.map(j => ({
              date: j.date, mood: j.mood, sleep: j.sleepHours, water: j.water, weight: j.weight, cal: j.calories, note: j.notes
            })))
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    let aiResponse;
    if (!response.ok) {
       console.error("OpenAI failed, using fallback");
       aiResponse = { summary: "Dữ liệu của bạn đang được ghi nhận. Hãy tiếp tục duy trì nhé!", sentiment: "neutral", recommendations: ["Uống đủ nước", "Ngủ đủ 8 tiếng"] };
    } else {
       const aiData = await response.json();
       const aiContentRaw = aiData.choices[0].message.content;
       aiResponse = JSON.parse(aiContentRaw);
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        chartData: journals,
        report: aiResponse
      } 
    });
  } catch (error: any) {
    console.error('Insights API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
