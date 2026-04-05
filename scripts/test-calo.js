require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findFood(foodName, portion) {
  const normalize = (str) =>
    str.toLowerCase()
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '')
       .replace(/[^a-z0-9 ]/g, '')
       .trim();
  
  const foods = await prisma.foodCalories.findMany();
  const searchName = normalize(foodName);
  
  const match = foods.find(f => normalize(f.name).includes(searchName) || searchName.includes(normalize(f.name)));
  if (match) return match;
  return null;
}

async function estimateCalories(foodName, portion) {
  const localMatch = await findFood(foodName, portion);
  
  if (localMatch) {
    return {
      source: "Local DB (Seed)",
      food: localMatch.name,
      portion: portion || localMatch.portion,
      calories: localMatch.calories,
      confidence: "Cao"
    };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Bạn là trợ lý dinh dưỡng. Hãy ước tính calo món ăn dựa trên mô tả văn bản: Tên món ăn và Khẩu phần. Trả JSON nguyên bản: {"calories": number, "items": [...], "confidence": "Cao"|"Vừa"|"Thấp"}`
        },
        {
          role: 'user',
          content: `Món ăn: ${foodName}. Khẩu phần: ${portion || 'Không rõ, tự chuẩn hóa'}`
        }
      ],
      response_format: { type: 'json_object' }
    }),
  });

  const aiData = await response.json();
  const data = JSON.parse(aiData.choices[0].message.content);
  return {
    source: "OpenAI gpt-4o-mini",
    food: foodName,
    portion: portion,
    calories: data.calories,
    confidence: data.confidence
  };
}

const testCases = [
  { name: "Phở bò", portion: "1 tô" },
  { name: "Cơm tấm sườn bì chả", portion: "1 phần" },
  { name: "Trà sữa trân châu đường đen", portion: "1 ly lớn" },
  { name: "Pizza hải sản", portion: "1 lát" },
  { name: "Bún đậu mắm tôm", portion: "1 mẹt" },
  { name: "1 quả táo", portion: "1 quả" }
];

async function run() {
  console.log("🚀 Bắt đầu test độ nhạy API tính Calo (Dual Engine)...\n");
  const results = [];
  
  for (const t of testCases) {
    try {
      const res = await estimateCalories(t.name, t.portion);
      results.push(res);
      console.log(`✅ [${res.source}] ${t.name} (${t.portion}) -> ${res.calories} kcal (Tin cậy: ${res.confidence})`);
    } catch (e) {
      console.error(`❌ Lỗi test ${t.name}:`, e.message);
    }
  }
  
  console.log("\n📊 Đã hoàn tất!");
  prisma.$disconnect();
}

run();
