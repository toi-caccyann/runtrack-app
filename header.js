window.addEventListener('DOMContentLoaded', () => {
    // 1. 各HTMLに用意した「header-area」を連れてくる
    const headerArea = document.getElementById('header-area');
    
    if (!headerArea) return; // もし枠がなければ処理を終了

    // 2. fetchを使って、外にある header.html を読み込む
    fetch('header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('ヘッダーファイルの読み込みに失敗しました');
            }
            return response.text(); // 読み込んだ中身をテキスト（HTML文字列）に変換
        })
        .then(data => {
            // 3. 変換したHTMLを枠の中にガチャンと流し込む！
            headerArea.innerHTML = data;

            // 4. 【おまけの職人技】いま開いているページに応じて、メニューに「active」クラスをつける
            highlightCurrentPage();
        })
        .catch(error => {
            console.error('エラー:', error);
        });
});

// 現在のURLを見て、一致するメニューに「active」クラスを付与する職人技
function highlightCurrentPage() {
    // いま開いているファイルのURL（例: "/timer.html"）を取得
    const path = window.location.pathname;

    // ヘッダー内のリンク（aタグ）をすべて取得
    const navLinks = document.querySelectorAll('.header-nav a');

    navLinks.forEach(link => {
        // リンク先（例: "timer.html"）を取得
        const href = link.getAttribute('href');
        
        // いまのURLにそのファイル名が含まれているか、またはホーム画面（/）ならホームを光らせる
        if (path.includes(href) || (href === 'index.html' && (path === '/' || path.endsWith('/')))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// alert()の代わりに使える簡易トースト
/* exported showToast */
function showToast(message, duration = 2500) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    // 一瞬待ってからshowを付けるとアニメーションが確実に発火する
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}