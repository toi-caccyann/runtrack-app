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
    // 5. データの自動反映：④ 週間の走行距離グラフ（直近7日間）
    // ==========================================
    const weeklyChartElem = document.getElementById('weekly-chart');
    const weeklyChartTotalElem = document.getElementById('weekly-chart-total');

    if (weeklyChartElem) {
        renderWeeklyChart(weeklyChartElem, weeklyChartTotalElem, historyList);
    }

    // ==========================================
    // 6. データの自動反映：⑤ 累計実績の計算(全期間)
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
    // 7. データの自動反映：⑥ 直近の履歴（3件だけ抽出）
    // ==========================================
    const homeHistoryList = document.getElementById('home-history-list');

    if (historyList.length > 0) {
        // 枠内を一度空にする
        homeHistoryList.innerHTML = '';

        // 配列の先頭から最大3件だけを取り出す（sliceを使用）
        const recentRuns = historyList.slice(0, 3);

        recentRuns.forEach((record) => {
            const recordHtml = `
                <div style="background-color: var(--color-surface-elevated); padding: 12px; margin-bottom: 10px; border-radius: var(--radius-sm); border-left: 4px solid var(--color-accent); font-size: 13px;">
                    <strong style="color: var(--color-text-strong);">📅 ${record.date}</strong><br>
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

// 履歴から「直近7日間、各日の合計走行距離」を集計する
// ※ record.date（toLocaleDateStringの文字列）はロケール依存で解析が不安定なため、
//   timer.js側で保存しているrecord.timestamp（Unix time）を使う。
//   timestampを持たない古い記録（この機能追加前に保存された記録）は集計対象外になる。
function getWeeklyDistances(historyList) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        days.push({ date: day, total: 0 });
    }

    historyList.forEach(record => {
        if (typeof record.timestamp !== 'number') return;

        const recordDay = new Date(record.timestamp);
        recordDay.setHours(0, 0, 0, 0);

        const bucket = days.find(d => d.date.getTime() === recordDay.getTime());
        if (bucket) {
            const kmNum = parseFloat(record.distance);
            if (!isNaN(kmNum)) {
                bucket.total += kmNum;
            }
        }
    });

    return days;
}

// 週間グラフを描画する（棒グラフ：直近7日間の1日ごとの合計距離）
function renderWeeklyChart(container, totalElem, historyList) {
    const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
    const days = getWeeklyDistances(historyList);
    const maxValue = Math.max(...days.map(d => d.total), 0.1); // 0除算を避けるための下限
    const todayStr = new Date().toDateString();

    container.innerHTML = '';

    days.forEach(day => {
        const isToday = day.date.toDateString() === todayStr;

        const col = document.createElement('div');
        col.className = 'weekly-chart-col';

        const track = document.createElement('div');
        track.className = 'weekly-chart-bar-track';

        const bar = document.createElement('div');
        bar.className = 'weekly-chart-bar' + (isToday ? ' is-today' : '');
        const heightPercent = day.total > 0 ? Math.max((day.total / maxValue) * 100, 4) : 0;
        bar.style.height = `${heightPercent}%`;
        bar.title = `${day.date.getMonth() + 1}/${day.date.getDate()}（${WEEKDAY_LABELS[day.date.getDay()]}）: ${day.total.toFixed(2)} km`;

        const label = document.createElement('span');
        label.className = 'weekly-chart-label' + (isToday ? ' is-today' : '');
        label.textContent = WEEKDAY_LABELS[day.date.getDay()];

        track.appendChild(bar);
        col.appendChild(track);
        col.appendChild(label);
        container.appendChild(col);
    });

    if (totalElem) {
        const weekTotal = days.reduce((sum, d) => sum + d.total, 0);
        totalElem.textContent = `${weekTotal.toFixed(2)} km`;
    }
}