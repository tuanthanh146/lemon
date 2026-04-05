import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({}, { status: 401 });
    const payload = await verifyAccessToken(authHeader.split(' ')[1]);
    if (!payload?.sub) return NextResponse.json({}, { status: 401 });

    const userId = payload.sub as string;
    const { messages, sessionId } = await req.json(); // Array of { role, content }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: false, error: 'Messages are required' }, { status: 400 });
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
            content: `Bạn là Lemon Coach chuyên gia.
Phong cách: chuyên môn nhưng dễ hiểu, thực dụng.

Độ dài:
- 180-260 từ.
- Không lan man, không lặp ý.

Bố cục bắt buộc:
1) Đánh giá nhanh (1-2 câu, giọng chuyên gia)
2) Phân tích ngắn (2-3 câu, giải thích vì sao)
3) Theo dõi 3-7 ngày tới (2-3 ý)
4) Cảnh báo y tế nếu có (1 ý)

Quy tắc:
- Không chẩn đoán bệnh.
- Nếu thiếu dữ liệu -> hỏi thêm tối đa 1-2 câu.
- TRẢ LỜI ĐÚNG FORMAT JSON DƯỚI ĐÂY (không bọc code block). Trong trường 'reply', KHÔNG DÙNG MARKDOWN, chỉ dùng văn bản thường, dùng ký tự \\n để xuống dòng.

{
  "reply": "(Bài viết theo bố cục 4 phần trên, dạng văn bản thường không in đậm)",
  "actions_today": ["hành động 1", "hành động 2", "hành động 3"], // MỤC HÀNH ĐỘNG NGAY HÔM NAY (3-5 ý) 
  "warning": false // Bật true nếu có triệu chứng khẩn cấp
}`
          },
          ...messages
        ],
        response_format: { type: 'json_object' }
      }),
    });

    const aiData = await response.json();
    if (!response.ok) throw new Error(aiData.error?.message || 'AI Error');

    const aiContentRaw = aiData.choices[0].message.content;
    const aiResponse = JSON.parse(aiContentRaw);

    let activeSessionId = sessionId;

    try {
      if (!activeSessionId) {
        // Create new session
        const newSession = await prisma.chatSession.create({
          data: {
            userId,
            // Insert all history up to this point
            messages: {
              create: messages.map((m: any) => ({
                role: m.role,
                content: m.content
              }))
            }
          }
        });
        activeSessionId = newSession.id;
        
        // Append the AI reply to this new session
        await prisma.chatMessage.create({
          data: {
            sessionId: activeSessionId,
            role: 'assistant',
            content: aiContentRaw
          }
        });
      } else {
        // Just append the newly sent user message (the last one in array) and the AI response
        const lastUserMessage = messages[messages.length - 1];
        await prisma.chatMessage.createMany({
          data: [
            { sessionId: activeSessionId, role: 'user', content: lastUserMessage.content },
            { sessionId: activeSessionId, role: 'assistant', content: aiContentRaw }
          ]
        });
      }
    } catch (dbErr) {
       console.error("DB Save Chat Error", dbErr);
    }

    return NextResponse.json({ success: true, data: aiResponse, sessionId: activeSessionId });
  } catch (error: any) {
    console.error('Coach API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
