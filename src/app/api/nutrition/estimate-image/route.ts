import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({}, { status: 401 });
    const payload = await verifyAccessToken(authHeader.split(' ')[1]);
    if (!payload?.sub) return NextResponse.json({}, { status: 401 });

    const { imageUrl, imageBase64, notes } = await req.json();

    if (!imageUrl && !imageBase64) {
      return NextResponse.json({ success: false, error: 'Cần có hình ảnh (url hoặc base64)' }, { status: 400 });
    }

    const imageContent = imageBase64 ? imageBase64 : imageUrl;

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Vision is supported by gpt-4o-mini
        messages: [
          {
            role: 'system',
            content: `Bạn là trợ lý dinh dưỡng. Hãy ước tính calo món ăn dựa trên ảnh. Không khẳng định tuyệt đối, luôn trả độ tin cậy. Nếu ảnh không rõ, trả confidence "Thấp" và ghi chú yêu cầu chụp lại. Trả JSON nguyên bản (KHÔNG bọc code block) theo mẫu sau:
{
  "calories": number,
  "items": [{ "name": "...", "portion": "...", "calories": number }],
  "confidence": "Cao" | "Vừa" | "Thấp",
  "notes": "Nhận xét của bạn"
}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: notes ? `Ghi chú thêm: ${notes}` : 'Làm ơn phân tích món ăn này.' },
              { type: 'image_url', image_url: { url: imageContent, detail: 'low' } }
            ]
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
    console.error('Vision API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
