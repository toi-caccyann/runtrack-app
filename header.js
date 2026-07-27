window.addEventListener('DOMContentLoaded', () => {
    // 1. 各HTMLに用意した「header-area」を連れてくる
    const headerArea = document.getElementById('header-area');

    if (headerArea) {
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
    }

    renderFooter();
});

// 全ページ共通のフッター（プライバシーポリシーへの導線）を末尾に追加する
function renderFooter() {
    const footer = document.createElement('footer');
    footer.className = 'app-footer';
    footer.innerHTML = '<a href="privacy.html">プライバシーポリシー</a>';
    document.body.appendChild(footer);
}

// PWA化：Service Workerを登録して、オフラインでも画面が表示できるようにする
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch((error) => {
            console.error('Service Workerの登録に失敗しました:', error);
        });
    });
}

// 現在のURLを見て、一致するメニューに「active」クラスを付与する職人技
function highlightCurrentPage() {
    // いま開いているファイルのURL（例: "/timer.html"）を取得
    const path = window.location.pathname;

    // ヘッダー内のリンク（aタグ）をすべて取得（上部ナビ・下部タブバー共通）
    const navLinks = document.querySelectorAll('.nav-link');

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

// 履歴カードなどで使う小さなSVGアイコンの定義。
// home.js/timer.jsは履歴データ（record）をtextContentで描画するが、
// アイコン部分だけはこの固定データからDOM APIで組み立てる（innerHTMLは使わない）。
const SVG_NS = 'http://www.w3.org/2000/svg';
const ICON_DEFS = {
    calendar: { fill: 'none', children: [
        { tag: 'rect', attrs: { x: 3, y: 4, width: 18, height: 17, rx: 2 } },
        { tag: 'path', attrs: { d: 'M3 9h18' } },
        { tag: 'path', attrs: { d: 'M8 2v4M16 2v4' } },
    ] },
    stopwatch: { fill: 'none', children: [
        { tag: 'line', attrs: { x1: 9, y1: 2, x2: 15, y2: 2 } },
        { tag: 'line', attrs: { x1: 12, y1: 2, x2: 12, y2: 5 } },
        { tag: 'circle', attrs: { cx: 12, cy: 14, r: 8 } },
        { tag: 'line', attrs: { x1: 12, y1: 14, x2: 12, y2: 10 } },
        { tag: 'line', attrs: { x1: 12, y1: 14, x2: 15, y2: 15.5 } },
    ] },
    route: { fill: 'none', children: [
        { tag: 'path', attrs: { d: 'M12 21c-4-4.5-7-8-7-11.5A7 7 0 0 1 19 9.5C19 13 16 16.5 12 21z' } },
        { tag: 'circle', attrs: { cx: 12, cy: 9.5, r: 2.5 } },
    ] },
    bolt: { fill: 'currentColor', children: [
        { tag: 'path', attrs: { d: 'M13 2 4 14h6l-1 8 9-12h-6z' } },
    ] },
};

/* exported createIcon */
function createIcon(name) {
    const def = ICON_DEFS[name];
    if (!def) return null;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', def.fill);
    svg.setAttribute('aria-hidden', 'true');
    if (def.fill === 'none') {
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
    }

    def.children.forEach((child) => {
        const el = document.createElementNS(SVG_NS, child.tag);
        Object.entries(child.attrs).forEach(([key, value]) => el.setAttribute(key, value));
        svg.appendChild(el);
    });

    return svg;
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