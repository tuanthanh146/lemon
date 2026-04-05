import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { findFood } from '@/lib/foodSearch';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({}, { status: 401 });
    const payload = await verifyAccessToken(authHeader.split(' ')[1]);
    if (!payload?.sub) return NextResponse.json({}, { status: 401 });

    const { foodName, portion } = await req.json();

    if (!foodName) {
      return NextResponse.json({ success: false, error: 'Thiếu tên món ăn' }, { status: 400 });
    }

    // 1. Try to find in Database locally first!
    const localMatch = await findFood(foodName, portion);
    if (localMatch) {
      const food = localMatch.match;
      return NextResponse.json({ 
        success: true, 
        data: {
          calories: food.calories,
          items: [{ name: food.name, portion: portion || food.portion, calories: food.calories }],
          confidence: "Cao",
          notes: "Nguồn: Dữ liệu chuẩn HealWeb"
        }
      });
    }

    // 2. Call OpenAI API as fallback
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
            content: `Bạn là trợ lý dinh dưỡng. Hãy ước tính calo món ăn dựa trên mô tả văn bản: Tên món ăn và Khẩu phần (nếu có). Trả JSON nguyên bản theo mẫu sau:
{
  "calories": number,
  "items": [{ "name": "...", "portion": "...", "calories": number }],
  "confidence": "Cao" | "Vừa" | "Thấp",
  "notes": "Nhận xét"
}`
          },
          {
            role: 'user',
            content: `Món ăn: ${foodName}. Khẩu phần: ${portion || 'Không rõ, hãy tự chuẩn hóa 1 phần vừa'}`
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    const aiData = await response.json();
    if (!response.ok) throw new Error(aiData.error?.message || 'OpenAI Error');

    const aiResponse = JSON.parse(aiData.choices[0].message.content);

    return NextResponse.json({ success: true, data: aiResponse });
  } catch (error: any) {
    console.error('Text Eval API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
