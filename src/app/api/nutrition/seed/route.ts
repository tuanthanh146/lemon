import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VIETNAMESE_FOODS = [
  // CƠM
  { name: 'Cơm tấm sườn bì chả', portion: '1 phần', calories: 650, category: 'Cơm' },
  { name: 'Cơm tấm sườn nướng', portion: '1 dĩa', calories: 550, category: 'Cơm' },
  { name: 'Cơm chiên dương châu', portion: '1 dĩa', calories: 600, category: 'Cơm' },
  { name: 'Cơm chiên hải sản', portion: '1 dĩa', calories: 580, category: 'Cơm' },
  { name: 'Cơm gà xối mỡ', portion: '1 phần', calories: 650, category: 'Cơm' },
  { name: 'Cơm lam', portion: '1 ống 100g', calories: 300, category: 'Cơm' },
  { name: 'Cơm trắng', portion: '1 chén 100g', calories: 130, category: 'Cơm' },
  { name: 'Cơm rang dưa bò', portion: '1 dĩa', calories: 650, category: 'Cơm' },
  { name: 'Cơm hến Huế', portion: '1 tô', calories: 350, category: 'Cơm' },

  // BÚN / PHỞ / MÌ
  { name: 'Phở bò chín', portion: '1 tô', calories: 430, category: 'Phở' },
  { name: 'Phở bò tái nạm', portion: '1 tô', calories: 450, category: 'Phở' },
  { name: 'Phở gà', portion: '1 tô', calories: 400, category: 'Phở' },
  { name: 'Bún bò Huế', portion: '1 tô', calories: 500, category: 'Bún' },
  { name: 'Bún chả Hà Nội', portion: '1 suất', calories: 550, category: 'Bún' },
  { name: 'Bún riêu cua', portion: '1 tô', calories: 380, category: 'Bún' },
  { name: 'Bún thịt nướng', portion: '1 tô', calories: 480, category: 'Bún' },
  { name: 'Bún đậu mắm tôm (full tooping)', portion: '1 suất', calories: 700, category: 'Bún' },
  { name: 'Bún cá', portion: '1 tô', calories: 400, category: 'Bún' },
  { name: 'Bún mắm', portion: '1 tô', calories: 480, category: 'Bún' },
  { name: 'Bún xào chay', portion: '1 dĩa', calories: 350, category: 'Bún' },
  { name: 'Mì Quảng', portion: '1 tô', calories: 540, category: 'Mì' },
  { name: 'Mì xào giòn', portion: '1 dĩa', calories: 600, category: 'Mì' },
  { name: 'Hủ tiếu Nam Vang', portion: '1 tô', calories: 400, category: 'Hủ tiếu' },
  { name: 'Hủ tiếu gõ', portion: '1 tô', calories: 350, category: 'Hủ tiếu' },
  { name: 'Bánh canh trảng bàng', portion: '1 tô', calories: 400, category: 'Bánh Canh' },
  { name: 'Bánh canh cua', portion: '1 tô', calories: 450, category: 'Bánh Canh' },

  // BÁNH / ĐỒ ĂN NHẸ
  { name: 'Bánh mì thịt chả', portion: '1 ổ', calories: 400, category: 'Bánh mì' },
  { name: 'Bánh mì ốp la', portion: '1 ổ (1 trứng)', calories: 320, category: 'Bánh mì' },
  { name: 'Bánh mì xíu mại', portion: '1 ổ', calories: 350, category: 'Bánh mì' },
  { name: 'Bánh xèo', portion: '1 cái vừa', calories: 350, category: 'Bánh' },
  { name: 'Bánh khọt', portion: '1 dĩa (5 cái)', calories: 250, category: 'Bánh' },
  { name: 'Bánh cuốn rắc hành phi', portion: '1 đĩa (100g)', calories: 200, category: 'Bánh' },
  { name: 'Bánh bao nhân thịt trứng cút', portion: '1 chiếc', calories: 300, category: 'Bánh' },
  { name: 'Bánh giò', portion: '1 cái', calories: 200, category: 'Bánh' },
  { name: 'Bánh chưng', portion: '100g', calories: 200, category: 'Bánh' },
  { name: 'Bánh tét', portion: '100g', calories: 200, category: 'Bánh' },
  { name: 'Bánh tráng trộn', portion: '1 bịch (100g)', calories: 300, category: 'Ăn vặt' },
  { name: 'Bánh tráng nướng', portion: '1 cái', calories: 380, category: 'Ăn vặt' },
  { name: 'Gỏi cuốn', portion: '1 cuốn', calories: 70, category: 'Ăn vặt' },
  { name: 'Nem rán (Chả giò)', portion: '1 cuốn', calories: 150, category: 'Ăn vặt' },
  { name: 'Hột vịt lộn', portion: '1 trứng', calories: 180, category: 'Ăn vặt' },
  { name: 'Bột chiên', portion: '1 dĩa', calories: 550, category: 'Ăn vặt' },
  { name: 'Cá viên chiên', portion: '1 xiên', calories: 100, category: 'Ăn vặt' },
  { name: 'Xúc xích chiên', portion: '1 cây', calories: 180, category: 'Ăn vặt' },

  // NƯỚC UỐNG
  { name: 'Trà sữa trân châu', portion: '1 ly (size M)', calories: 350, category: 'Nước uống' },
  { name: 'Cà phê sữa đá', portion: '1 ly', calories: 150, category: 'Nước uống' },
  { name: 'Cà phê đen đá (có đường)', portion: '1 ly', calories: 60, category: 'Nước uống' },
  { name: 'Nước ép cam (không đường)', portion: '1 ly', calories: 110, category: 'Nước uống' },
  { name: 'Nước dừa tươi', portion: '1 trái', calories: 45, category: 'Nước uống' },
  { name: 'Sữa đậu nành', portion: '1 ly', calories: 120, category: 'Nước uống' },
  { name: 'Sữa chua', portion: '1 hộp', calories: 100, category: 'Nước uống' }
];

export async function GET(req: Request) {
  try {
    // Delete existing to start fresh
    await prisma.foodCalories.deleteMany({});
    
    // Insert array
    await prisma.foodCalories.createMany({
      data: VIETNAMESE_FOODS
    });

    return NextResponse.json({
      success: true,
      message: `Đã nạp thành công ${VIETNAMESE_FOODS.length} món ăn Việt Nam vào DataBase.`,
      foods: VIETNAMESE_FOODS
    });

  } catch (error: any) {
    console.error('Seed API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
