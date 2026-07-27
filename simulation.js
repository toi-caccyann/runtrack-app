const weightInput = document.getElementById('weight-input');
const runtimeInput = document.getElementById('runtime-input');
const distanceInput = document.getElementById('distance-input');
const simulationBtn = document.getElementById('simulation');

// 結果を表示するHTMLのエリア
const calorieResult = document.getElementById('calorie-result');

// 画面が開いた瞬間に実行する
window.addEventListener('DOMContentLoaded', () => {

    // 1. 物置から最新の1件（lastRunData）を取り出す
    const savedRunData = JSON.parse(localStorage.getItem('lastRunData'));

    // 2. データが存在していたら、シミュレーターの入力欄に自動でセットする
    if (savedRunData) {
        if (distanceInput) distanceInput.value = savedRunData.distance;
        if (runtimeInput) runtimeInput.value = savedRunData.runtime;

        console.log("タイマーからの最新データを自動反映しました！", savedRunData);
    }
});

simulationBtn.addEventListener('click', () => {

// ボタンが押されたら値を取り出す
let weight = parseFloat(weightInput.value); // 小数点対応の数値に変換
let minutes = parseFloat(runtimeInput.value);
let distance = parseFloat(distanceInput.value);

//もし入力が空（NaN）なら計算しない
if (isNaN(weight) || isNaN(minutes) || isNaN(distance)) {
  showToast("すべての項目に数値を入力してください");
  return; // ここで処理を終了

}

// 消費カロリーの計算（calorie-calc.js の共通関数を使用）
const calories = calculateCalories(weight, minutes);

//1ヶ月（30日）続けた場合のシミュレーション
const monthCalories = calories * 30;
const loseWeight = calculateWeightLoss(monthCalories);

//小数点以下を四捨五入して画面に表示
//caloriesDisplay.textContent = Math.round(calories) + ' kcal';

// === 4. 画面への表示（書き換え） ===   Math.round() で四捨五入、toFixed(2) で小数点第2位までに丸める
calorieResult.textContent = `${Math.round(calories)} kcal (1ヶ月で約 ${loseWeight.toFixed(2)} kg 減量チャンス！)`;


});