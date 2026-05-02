// ==UserScript==
// @name         VOZ Comment Filter
// @namespace    https://voz.vn/
// @version      3.0
// @description  Ẩn comment chứa từ khóa, hiện nút Show để xem lại
// @author       You
// @match        https://voz.vn/t/*
// @icon         https://voz.vn/styles/next/xenforo/voz-logo-192.png?v=1
// @grant        none
// @run-at       document-idle
// ==/UserScript==
(function () {
    'use strict';

    // ── Thêm/xóa từ khóa tại đây ──────────────────────────────────────
    const KEYWORDS = [
        'bò đỏ',
        'tàu cẩu',
        'cẩu nô',
        'ngú tro',
        'nga vàng',
        'tàu nô',
        'bodo',
        'orc vàng',
        'orcvang',
        'vằn vện',
        'cổ nâu',
        'vino',
        'vin nô'
    ];
    // ──────────────────────────────────────────────────────────────────

    function injectStyle() {
        if (document.querySelector('#voz-keyword-style')) return;
        const style = document.createElement('style');
        style.id = 'voz-keyword-style';
        style.textContent = `
            .voz-kw-bar {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                font-size: 12px;
                font-family: system-ui, sans-serif;
                color: #7a5050;
                background: #f8f0f0;
                border-left: 3px solid #c87676;
                border-bottom: 1px solid #e0c0c0;
            }
            .voz-kw-bar .voz-kw-label { color: #9a6060; font-size: 11.5px; }
            .voz-kw-bar .voz-kw-word { color: #7a4040; font-weight: 600; font-size: 11.5px; }
            .voz-kw-dot { color: #c08888; font-size: 10px; }
            .voz-kw-btn {
                margin-left: 4px;
                padding: 2px 10px;
                background: #fff;
                color: #bf4a4a;
                border: 1px solid #e0aaaa;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                font-family: system-ui, sans-serif;
                font-weight: 500;
                letter-spacing: 0.02em;
                transition: all 0.15s;
                line-height: 1.8;
                white-space: nowrap;
                box-shadow: 0 1px 2px rgba(0,0,0,0.06);
            }
            .voz-kw-btn:hover { background: #bf4a4a; color: #fff; border-color: #bf4a4a; }
            .voz-kw-btn:active { background: #af3a3a; border-color: #af3a3a; }
            .voz-quote-hidden-bar {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                font-size: 11.5px;
                font-family: system-ui, sans-serif;
                color: #9a6060;
                background: #fdf5f5;
                border: 1px solid #e8cccc;
                border-radius: 4px;
                margin: 4px 0;
            }
            .voz-quote-btn {
                margin-left: 4px;
                padding: 1px 8px;
                background: #fff;
                color: #bf4a4a;
                border: 1px solid #e0aaaa;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                font-family: system-ui, sans-serif;
                transition: all 0.15s;
                line-height: 1.8;
            }
            .voz-quote-btn:hover { background: #bf4a4a; color: #fff; border-color: #bf4a4a; }
        `;
        document.head.appendChild(style);
    }

    function containsKeyword(text) {
        return KEYWORDS.find(kw => text.toLowerCase().includes(kw.toLowerCase())) || null;
    }

    function collapsePost(post, matchedKw) {
        if (post.querySelector('.voz-kw-bar')) return;

        const contentChildren = Array.from(post.children);
        contentChildren.forEach(child => {
            child.style.display = 'none';
            child.dataset.vozKwHidden = '1';
        });

        const bar = document.createElement('div');
        bar.className = 'voz-kw-bar';
        bar.innerHTML = `
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c87676" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:0.8">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span class="voz-kw-label">Từ khóa bị lọc</span>
            <span class="voz-kw-dot">·</span>
            <span class="voz-kw-word">${matchedKw}</span>
            <button class="voz-kw-btn">👁 Show</button>
        `;

        bar.querySelector('.voz-kw-btn').addEventListener('click', () => {
            bar.style.opacity = '0';
            bar.style.transition = 'opacity 0.15s';
            setTimeout(() => {
                bar.remove();
                contentChildren.forEach(child => {
                    if (child.dataset.vozKwHidden) {
                        child.style.display = '';
                        delete child.dataset.vozKwHidden;
                    }
                });
            }, 150);
        });

        post.insertBefore(bar, post.firstChild);
    }

    function collapseQuote(quote, matchedKw) {
        const content = quote.querySelector('.bbCodeBlock-content');
        if (!content || content.querySelector('.voz-quote-hidden-bar')) return;

        content.style.display = 'none';

        const bar = document.createElement('div');
        bar.className = 'voz-quote-hidden-bar';
        bar.innerHTML = `
            <span>Quote chứa từ khóa: <b>${matchedKw}</b></span>
            <button class="voz-quote-btn">👁 Show</button>
        `;

        bar.querySelector('.voz-quote-btn').addEventListener('click', () => {
            bar.remove();
            content.style.display = '';
        });

        quote.insertBefore(bar, content);
    }

    function filterComments() {
        if (!KEYWORDS.length) return;

        document.querySelectorAll('.message--post:not([data-voz-filtered])').forEach(post => {
            post.setAttribute('data-voz-filtered', '1');
            const body = post.querySelector('.message-body');
            if (!body) return;

            // 1. Kiểm tra từng quote
            body.querySelectorAll('.bbCodeBlock--quote').forEach(quote => {
                const content = quote.querySelector('.bbCodeBlock-content');
                if (content) {
                    const kw = containsKeyword(content.innerText);
                    if (kw) collapseQuote(quote, kw);
                }
            });

            // 2. Kiểm tra text chính (bỏ qua quote)
            const clone = body.cloneNode(true);
            clone.querySelectorAll('blockquote').forEach(el => el.remove());
            const kw = containsKeyword(clone.innerText);
            if (kw) collapsePost(post, kw);
        });
    }

    injectStyle();

    let scanTimer = null;
    new MutationObserver(() => {
        clearTimeout(scanTimer);
        scanTimer = setTimeout(filterComments, 300);
    }).observe(document.body, { childList: true, subtree: true });

    filterComments();

    console.log('[VOZ Filter v3.0] Keyword filter đã khởi động');
})();
