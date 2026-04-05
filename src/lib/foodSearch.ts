import { prisma } from './prisma';

/**
 * Loại bỏ dấu tiếng Việt và chuyển thành chữ thường.
 */
export function normalize(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

/**
 * Tìm món ăn trong CSDL dựa trên string query. Tỉ lệ khớp cao thì return luôn.
 */
export async function findFood(query: string, portionInput?: string) {
  const normQuery = normalize(query);
  if (!normQuery) return null;

  // Lấy hết DB food ra (vì 50-100 items nhỏ xíu, nếu big table cần elasticsearch / full text search)
  const allFoods = await prisma.foodCalories.findMany();

  let bestMatch = null;
  let highestScore = 0;

  for (const food of allFoods) {
    const normFood = normalize(food.name);
    // Tính điểm tương đồng đơn giản
    let score = 0;
    
    // Khớp 1-1 hoàn toàn
    if (normFood === normQuery) {
        score = 100;
    } 
    // Chuỗi con nằm trong nhau
    else if (normFood.includes(normQuery) || normQuery.includes(normFood)) {
      // Ví dụ: query "phở bò nạm", food "Phở bò" -> "pho bo nam" bao gồm "pho bo"
      score = 80;
    } else {
      // Đếm số từ match
      const queryWords = normQuery.split(' ');
      let matchCount = 0;
      for (const w of queryWords) {
        if (normFood.includes(w)) matchCount++;
      }
      if (matchCount > 0) {
        score = (matchCount / queryWords.length) * 50; // Max 50 score
      }
    }

    if (score > highestScore && score >= 60) {
      highestScore = score;
      bestMatch = food;
    }
  }

  // Nếu điểm >= 80, tỉ lệ cao là trúng món. Trả ra luôn, bỏ qua OpenAI.
  if (highestScore >= 80 && bestMatch) {
    return {
      match: bestMatch,
      confidence: "Cao"
    };
  }

  return null;
}
