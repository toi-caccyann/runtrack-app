// 1. 画面の部品（HTML要素）をJavaScriptに連れてくる
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const saveBtn = document.getElementById('save-btn');
const distanceDisplay = document.getElementById('distance-display');
const speedDisplay = document.getElementById('speed-display');
const clearBtn = document.getElementById('clear-btn');
const StorageBtn = document.getElementById('storage-btn');
const simulationBtn = document.getElementById('simulation-btn');
const historyModal = document.getElementById('history-modal');
const closeModalBtn = document.getElementById('close-modal-btn');



// 2. 記憶スペース（状態を管理する変数）を作る
let seconds = 0;       // 画面表示用のトータル秒数
let startTime = null;  // スタートした「現実の時刻」を覚える箱
let elapsedTime = 0;   // ストップした時までに貯まった秒数（一時停止用）
let timerId = null;   // タイマーの「予約券」を入れておく箱（最初は空っぽ）
let distance = 0.0;
let lastPosition = null;
let geolocationWatchId = null;

const MAX_GPS_ACCURACY_METERS = 50;
const MAX_RUNNING_SPEED_KMH = 25;

function startLocationTracking() {
    if (!navigator.geolocation || geolocationWatchId !== null) return;

    // 計測の開始直後は、最初に取得できた位置を基準点にする。
    lastPosition = null;
    geolocationWatchId = navigator.geolocation.watchPosition(handlePosition, handlePositionError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
}

function stopLocationTracking() {
    if (geolocationWatchId !== null) {
        navigator.geolocation.clearWatch(geolocationWatchId);
        geolocationWatchId = null;
    }
    lastPosition = null;
}

function handlePosition(position) {
    // 精度が低い位置情報は距離に反映しない。
    if (position.coords.accuracy > MAX_GPS_ACCURACY_METERS) return;

    const currentPosition = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        timestamp: position.timestamp
    };

    if (lastPosition !== null) {
        const chunkDistance = calculateDistance(
            lastPosition.lat,
            lastPosition.lon,
            currentPosition.lat,
            currentPosition.lon
        );
        const elapsedSeconds = (currentPosition.timestamp - lastPosition.timestamp) / 1000;
        const chunkSpeedKmh = elapsedSeconds > 0 ? (chunkDistance * 3600) / elapsedSeconds : Infinity;

        // GPSの位置飛びによる不自然な高速移動を除外する。
        if (chunkSpeedKmh <= MAX_RUNNING_SPEED_KMH) {
            distance += chunkDistance;
            distanceDisplay.textContent = distance.toFixed(2) + ' km';
            updateSpeed();
        }
    }

    lastPosition = currentPosition;
}

function handlePositionError(error) {
    console.error('位置情報の取得に失敗しました:', error);
}


startBtn.addEventListener('click', () => {
    
    if (timerId !== null) {
        return; 
         document.querySelector('.tracker-app').classList.add('is-recording');
    }

   // 「今この瞬間の時刻」から「すでに走った分の秒数」を引き算してスタート時刻を決定します
    const now = Date.now();
    startTime = now - (elapsedTime * 1000);
    document.querySelector('.tracker-app').classList.add('is-recording');
    startLocationTracking();

    timerId = setInterval(() => {
        // 今の時刻 − スタートした時刻 ＝ 経過ミリ秒
        const diffMilliSeconds = Date.now() - startTime;
        
        // ミリ秒を秒（整数）に直して seconds に入れる
        seconds = Math.floor(diffMilliSeconds / 1000);
        
        // 画面の時計表示を更新する
        updateFormatTime();

        
    }, 1000);
});

// 4. 「ストップ」ボタンが押されたときの仕掛け
stopBtn.addEventListener('click', () => {
    
    // もしタイマーが動いていたら（予約券が空っぽじゃなかったら）停止処理をする
    if (timerId !== null) {
        // ブラウザに「この予約番号のタイマーを止めて！」と命令する
        clearInterval(timerId);
        document.querySelector('.tracker-app').classList.remove('is-recording');
        stopLocationTracking();
        
        // タイマーが止まったので、（変数）を空っぽ（null）に戻す
        timerId = null;

        // ストップした時点の秒数を記憶しておく
        elapsedTime = seconds;
    }
});


// 6. 平均速度を計算して画面に表示する関数
function updateSpeed() {
    if (seconds === 0) {
        return;
    }

    // 【算数の式】(距離 × 3600) ÷ 秒数 で時速を計算する
    const kmlh = (distance * 3600) / seconds;

    // 小数点第1位（0.0の形）に綺麗に整えて、画面に表示する
    speedDisplay.textContent = kmlh.toFixed(1) + ' km/h';
}

// 秒数を「時:分:秒（00:00:00）」の形に整えて画面に表示する関数
function updateFormatTime() {
    // 1. 「時間・分・秒」をそれぞれ計算する
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
// 2. 文字列に変換しつつ、頭に「0」を詰めて常に2桁（ゼロパディング）にする
    const strHours = String(hours).padStart(2, '0');
    const strMinutes = String(minutes).padStart(2, '0');
    const strSeconds = String(remainingSeconds).padStart(2, '0');

    // 3. 綺麗なデジタル時計の形（00:00:00）に組み立てる
    const formatTime = `${strHours}:${strMinutes}:${strSeconds}`;

    // 4. 画面の表示を書き換える
    timeDisplay.textContent = formatTime;

}


// 7. 「リセット」ボタンが押されたときの仕掛け
clearBtn.addEventListener('click', () => {
    // ① 動いているタイマーを止める（ストップボタンと同じ処理）
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
    stopLocationTracking();
    document.querySelector('.tracker-app').classList.remove('is-recording');

    // ② 裏側の記憶データをすべて最初の状態（初期値）に戻す
    seconds = 0;
    startTime = null;
    elapsedTime = 0;
    distance = 0.0;
    lastPosition = null; // 【おまけ】位置情報もリセット

    // ③ 画面の表示をすべて最初の表示に書き換える
    timeDisplay.textContent = '00:00:00';
    distanceDisplay.textContent = '0.00 km';
    speedDisplay.textContent = '0.0 km/h';
});

//【数学の公式】2つの緯度・経度から距離（km）を計算する関数
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球の半径 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInKm = R * c; // 計算された距離 (km)
    
    return distanceInKm;
}

// 8. 「保存」ボタンが押されたときの仕掛け
saveBtn.addEventListener('click', () => {
    if (seconds === 0) {
        showToast("ランニング記録がありません");
        return;
    }

    if (timerId !== null) {
        showToast('ストップボタンを押してから保存してください'); 
        return;
    }

    const timeString = timeDisplay.textContent;
    const currentSpeed = speedDisplay.textContent;
    const currentDistance = distance.toFixed(2) + ' km'; // 小数点2桁に固定


    const lastRunData = {
        distance: distance, // タイマーで計測された現在の距離
        runtime: Math.floor(seconds / 60) // タイマーで計測された現在の時間（分）
    };
    localStorage.setItem('lastRunData', JSON.stringify(lastRunData));

    showToast(`ランニング記録を保存しました！
【走行時間】${timeString}
【走行距離】${currentDistance}
【平均速度】${currentSpeed}`);

// === ここからローカルストレージへの保存処理を追記 ===
    //今回保存したいデータを、1つのきれいな「オブジェクト（塊）」にする
    const newRecord = {
        date: new Date().toLocaleDateString(), // 💡今日の日付（例: 2026/6/20）を自動取得
        time: timeString,
        distance: currentDistance,
        speed: currentSpeed,
        timestamp: Date.now() // 週間グラフの日付集計用（date文字列はロケール依存で解析しづらいため）
    };

    // 2. スマホの物置から、すでに保存されている「過去の履歴リスト」を取り出す
    // （もし物置がまだ空っぽだったら、新しく空のリスト `[]` を作る）
    let historyList = JSON.parse(localStorage.getItem('runningHistory')) || [];

    // 3. 過去の履歴リストの先頭に、今回の新しい記録を追加する（unshiftで上に積む）
    historyList.unshift(newRecord);

    // 4. リストを「1行の文字（JSON）」にギュッと圧縮して、物置にしっかりと上書き保存する
    localStorage.setItem('runningHistory', JSON.stringify(historyList));

});

// 9. 「履歴を見る」ボタンが押されたら、ポップアップを表示する
StorageBtn.addEventListener('click', () => {

    // ① スマホの物置からデータを引っ張り出して、JavaScriptのリストに復元する
            const historyList = JSON.parse(localStorage.getItem('runningHistory')) || [];
            
            // 履歴を流し込むターゲットのエリア（history-log-area）を特定する
            const logArea = document.getElementById('history-log-area');

            // 一度、中身をスッキリ空っぽに掃除する
            logArea.innerHTML = '';

            // ② もし履歴が1件もなかったら、メッセージを出す
            if (historyList.length === 0) {
                logArea.innerHTML = '<p class="empty-message">保存された記録はまだありません。</p>';
            } else {
                // ③ 履歴がある場合：ループ処理（forEach）を使って、1件ずつHTMLのカードを組み立てる
                historyList.forEach((record, index) => {
                    const recordHtml = `
                        <div style="background-color: var(--color-surface-elevated); padding: 12px; margin-bottom: 10px; border-radius: var(--radius-sm); border-left: 4px solid var(--color-accent); font-size: 14px; color: var(--color-text)">
                            <strong style="color: var(--color-text-strong);">📅 ${record.date} (NO.${historyList.length - index})</strong><br>
                            ⏱️ 時間: ${record.time} | 🏃‍♂️ 距離: ${record.distance} | ⚡ 速度: ${record.speed}
                        </div>
                    `;
                    // 組み立てたHTMLを、エリアにどんどん注ぎ込んでいく
                    logArea.innerHTML = logArea.innerHTML + recordHtml;
                });
            }

    historyModal.style.display = 'flex';
});

// 10. ポップアップの中の「閉じる」ボタンが押されたら、非表示に戻す
closeModalBtn.addEventListener('click', () => {
    //再び非表示（none）にして、画面から隠す
    historyModal.style.display = 'none';
});

simulationBtn.addEventListener('click', () => {
    const lastRunData = {
        distance: Number(distance.toFixed(2)),
        runtime: Math.floor(seconds / 60)
    };

    //ローカルストレージに最新データを保存
    localStorage.setItem('lastRunData', JSON.stringify(lastRunData));

    //データの保存が完了したあとに、安全に別タブでシミュレーターを開く
    window.open('simulation.html', '_blank');



});

// スマホのスリープ復帰・タブ切り替え復帰を検知する
document.addEventListener('visibilitychange', () => {
    // バックグラウンド中はGPS監視を解除して電池消費を抑える。
    if (document.visibilityState === 'hidden') {
        stopLocationTracking();
        return;
    }

    // 画面が「見える状態」に戻り、かつタイマーが動いているとき
    if (document.visibilityState === 'visible' && timerId !== null) {
        
        // ① スリープ中に止まっていた setInterval を一度リセット
        clearInterval(timerId);

        // ② 画面表示を今すぐ正しい時刻に更新（復帰直後の空白をなくす）
        const diffMilliSeconds = Date.now() - startTime;
        seconds = Math.floor(diffMilliSeconds / 1000);
        updateFormatTime();
        updateSpeed();

        // ③ setInterval を新鮮な状態で再スタート
        timerId = setInterval(() => {
            const diffMilliSeconds = Date.now() - startTime;
            seconds = Math.floor(diffMilliSeconds / 1000);
            updateFormatTime();
            updateSpeed();
        }, 1000);

        // 復帰後は現在位置を新しい基準点としてGPS計測を再開する。
        startLocationTracking();
    }
});

// ページを離れるときも位置情報の監視を確実に解除する。
window.addEventListener('pagehide', stopLocationTracking);
