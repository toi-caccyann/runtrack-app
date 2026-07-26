// カロリー計算の共通ロジック（simulation.js / home.js の両方から読み込んで使用する）
/* exported calculateCalories, calculateWeightLoss */

const CALORIE_METS = 8.3; // ランニングのMETs値
const KCAL_PER_KG_FAT = 7200; // 脂肪1kgを消費するのに必要なカロリー

// 消費カロリー(kcal) = METs × 体重(kg) × 時間(時間) × 1.05
function calculateCalories(weightKg, minutes, mets = CALORIE_METS) {
    const hours = minutes / 60;
    return mets * weightKg * hours * 1.05;
}

function calculateWeightLoss(totalCalories) {
    return totalCalories / KCAL_PER_KG_FAT;
}
