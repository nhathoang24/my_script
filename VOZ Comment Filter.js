// ==UserScript==
// @name         VOZ Comment Filter
// @namespace    https://voz.vn/
// @version      2.4
// @description  Ẩn comment chứa từ khóa. Thêm từ khóa vào mảng KEYWORDS bên dưới.
// @author       You
// @match        https://voz.vn/*
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
        'bodo'
    ];
    // ──────────────────────────────────────────────────────────────────

    function containsKeyword(text) {
        return KEYWORDS.some(kw => text.toLowerCase().includes(kw.toLowerCase()));
    }

    function filterComments() {
        if (!KEYWORDS.length) return;

        document.querySelectorAll('.message--post:not([data-voz-filtered])').forEach(post => {
            post.setAttribute('data-voz-filtered', '1');
            const body = post.querySelector('.message-body');
            if (!body) return;

            // 1. Kiểm tra từng quote: nếu nội dung quote chứa từ khóa → ẩn nội dung quote đó
            body.querySelectorAll('.bbCodeBlock--quote').forEach(quote => {
                const content = quote.querySelector('.bbCodeBlock-content');
                if (content && containsKeyword(content.innerText)) {
                    content.style.display = 'none';
                }
            });

            // 2. Kiểm tra text của chính người đó (bỏ qua quote) → nếu có từ khóa thì ẩn cả comment
            const clone = body.cloneNode(true);
            clone.querySelectorAll('blockquote').forEach(el => el.remove());
            if (containsKeyword(clone.innerText)) {
                post.style.display = 'none';
            }
        });
    }

    new MutationObserver(filterComments).observe(document.body, { childList: true, subtree: true });

    filterComments();
})();
