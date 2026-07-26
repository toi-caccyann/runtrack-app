window.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. 各画面のデータを物置（localStorage）から取ってくる
    // ==========================================
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    const lastRunData = JSON.parse(localStorage.getItem('lastRunData'));
    const historyList = JSON.parse(localStorage.getItem('runningHistory')) || [];

    // ==========================================
    // 2. データの自動反映：① ウェルカムメッセージ
    // ==========================================
    const welcomeMessage = document.getElementById('welcome-message');
    if (savedProfile && savedProfile.nickname) {
        welcomeMessage.textContent = `こんにちは、${savedProfile.nickname}さん！`;
    }

    // ==========================================
    // 3. データの自動反映：② 前回のランニング
    // ==========================================
    const lastDistance = document.getElementById('last-distance');
    const lastTime = document.getElementById('last-time');

    if (lastRunData) {
        // タイマー側で数値化して保存したデータを反映
        lastDistance.innerHTML = `${lastRunData.distance.toFixed(2)} <small>km</small>`;
        
        // 分数を「〇分」の形にするか、履歴にある綺麗な文字列（00:30:00など）を使う
        // 今回は履歴の先頭（一番最新）に綺麗な時間文字列が入っているので、それがあれば活用します
        if (historyList.length > 0) {
            lastTime.textContent = historyList[0].time; // 例: "00:25:30"
        } else {
            lastTime.textContent = `${lastRunData.runtime} 分`;
        }
    }

    // ==========================================
    // 4. データの自動反映：③ 未来予測ポテンシャル（簡易シミュレーション）
    // ==========================================
    const potentialWeight = document.getElementById('potential-weight');

    // プロフィール（体重）と前回の走行データがあれば、1ヶ月（仮に月10回走行として）の予測を計算
    if (savedProfile && lastRunData && savedProfile.weight) {
        const weight = savedProfile.weight;
        const minutes = lastRunData.runtime; // 分

        // 消費カロリーの計算（calorie-calc.js の共通関数を使用）
        const caloriesPerRun = calculateCalories(weight, minutes);
        // 1ヶ月に10回走ると仮定
        const monthlyCalories = caloriesPerRun * 10;
        const estimatedWeightLoss = calculateWeightLoss(monthlyCalories);

        // 画面に表示
        potentialWeight.innerHTML = `${estimatedWeightLoss.toFixed(1)} <small>kg</small>`;
    }

    // ==========================================
    // 5. データの自動反映：④ 累計実績の計算
    // ==========================================
    const totalDistanceElem = document.getElementById('total-distance');

    let totalKm = 0;

    // 履歴リストをループして、これまでの総距離を合計する
    historyList.forEach(record => {
        // record.distance は "5.25 km" のような文字になっているので、数値に変換
        const kmNum = parseFloat(record.distance);
        if (!isNaN(kmNum)) {
            totalKm += kmNum;
        }
    });

    // 合計した総距離をカウントアップ演出付きで画面に反映する
    if (totalDistanceElem) {
        animateCount(totalDistanceElem, totalKm, 'km');
    }

    // ==========================================
    // 6. データの自動反映：⑤ 直近の履歴（3件だけ抽出）
    // ==========================================
    const homeHistoryList = document.getElementById('home-history-list');

    if (historyList.length > 0) {
        // 枠内を一度空にする
        homeHistoryList.innerHTML = '';

        // 配列の先頭から最大3件だけを取り出す（sliceを使用）
        const recentRuns = historyList.slice(0, 3);

        recentRuns.forEach((record) => {
            const recordHtml = `
                <div style="background-color: #334155; padding: 12px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #38bdf8; font-size: 13px;">
                    <strong style="color: #ffffff;">📅 ${record.date}</strong><br>
                    ⏱️ ${record.time} | 🏃‍♂️ ${record.distance} | ⚡ ${record.speed}
                </div>
            `;
            homeHistoryList.innerHTML += recordHtml;
        });
    }
});

function animateCount(el, endValue, suffix = '', duration = 800) {
    const start = 0;
    const startTime = performance.now();
    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out
        const current = (start + (endValue - start) * eased).toFixed(2);
        el.innerHTML = `${current} <small>${suffix}</small>`;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}