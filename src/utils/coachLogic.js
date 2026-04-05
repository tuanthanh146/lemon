/**
 * Simulates the "Health Journal Coach" AI logic.
 * Persona: Health Journal Coach
 * Format:
 * - Quick summary (1 sentence)
 * - Suggestions (Max 3 bullets)
 * - Clarifying question (1, optional)
 */
export function getCoachResponse(entry, previousEntries) {
    const mood = Number(entry.mood || 5);
    const sleep = Number(entry.sleep || 0);
    const water = Number(entry.water || 0);
    const noteLower = (entry.note || "").toLowerCase();

    // 1. Analyze Context
    const isSleepIssue = noteLower.includes('ngủ') || noteLower.includes('mất ngủ') || sleep < 6;
    const isHydrationIssue = noteLower.includes('khát') || noteLower.includes('nước') || water < 4;
    const isStress = noteLower.includes('lo') || noteLower.includes('áp lực') || noteLower.includes('căng thẳng');
    const isHappy = mood >= 8;
    const isPain = noteLower.includes('đau') || noteLower.includes('mỏi');


    // 2. Build Response Parts
    let summary = "";
    let suggestions = [];
    let question = "";

    // A. Summary
    if (mood <= 4) {
        summary = "Có vẻ hôm nay là một ngày khá thử thách với bạn, hãy thả lỏng một chút nhé.";
    } else if (mood <= 7) {
        summary = "Cảm ơn bạn đã lắng nghe cơ thể, duy trì thói quen này rất tốt cho sức khỏe.";
    } else {
        summary = "Tuyệt vời! Năng lượng tích cực của bạn hôm nay thật đáng trân trọng.";
    }

    // B. Suggestions (Max 3)
    if (isSleepIssue || sleep < 6) {
        suggestions.push("😴 Thử tắt màn hình 30 phút trước khi ngủ để thư giãn sâu hơn.");
        suggestions.push("🍵 Một tách trà hoa cúc ấm có thể giúp bạn dễ ngủ hơn.");
    }

    if (isHydrationIssue || water < 4) {
        suggestions.push("💧 Đặt mục tiêu uống thêm 1 cốc nước ngay bây giờ nhé.");
    }

    if (isStress) {
        suggestions.push("🌬️ Thử bài tập thở 4-7-8: Hít 4s, giữ 7s, thở ra 8s.");
        suggestions.push("walk Đi bộ ngắn 5 phút để giải tỏa tâm trí.");
    }

    if (isPain) {
        suggestions.push("🧘 Nhẹ nhàng kéo giãn cơ hoặc chườm ấm vị trí đau.");
    }

    if (isHappy && suggestions.length < 2) {
        suggestions.push("✨ Ghi lại 1 điều bạn biết ơn để lưu giữ khoảnh khắc này.");
        suggestions.push("💪 Duy trì đà này cho ngày mai nhé!");
    }

    // Fallback suggestions if empty
    if (suggestions.length === 0) {
        suggestions.push("💧 Nhớ uống đủ nước cho phần còn lại của ngày.");
        suggestions.push("🚶 Đứng dậy vươn vai nhẹ sau mỗi giờ làm việc.");
    }

    // Limit to 3
    suggestions = suggestions.slice(0, 3);

    // C. Question (Optional - Contextual)
    if (isSleepIssue && sleep < 5) {
        question = "Bạn có hay bị thức giấc giữa đêm không?";
    } else if (isStress) {
        question = "Điều gì làm bạn lo lắng nhất lúc này?";
    } else if (mood < 4 && !isSleepIssue && !isStress) {
        question = "Có chuyện gì cụ thể làm bạn buồn phiền không?";
    }

    // 3. Format Output
    // Using simple markdown-like formatting that the chat component can render
    // Or just plain text with newlines
    let responseText = summary + "\n\n";
    suggestions.forEach(s => responseText += `• ${s}\n`);
    if (question) responseText += `\n${question}`;

    return responseText.trim();
}
