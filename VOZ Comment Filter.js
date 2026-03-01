// ==UserScript==
// @name         VOZ Comment Filter
// @namespace    https://voz.vn/
// @version      2.2
// @description  Ẩn comment chứa từ khóa. Phần quote chỉ giữ lại "X said:", không lọc theo nội dung quote.
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
    ];
    // ──────────────────────────────────────────────────────────────────

    function getOwnText(body) {
        // Clone, xóa nội dung blockquote trước khi đọc text
        const clone = body.cloneNode(true);
        clone.querySelectorAll('blockquote .bbCodeBlock-content').forEach(el => el.remove());
        return clone.innerText.toLowerCase();
    }

    function collapseQuoteContents(post) {
        // Ẩn nội dung bên trong quote, giữ lại dòng "X said:"
        post.querySelectorAll('.bbCodeBlock--quote .bbCodeBlock-content').forEach(el => {
            el.style.display = 'none';
        });
    }

    function filterComments() {
        if (!KEYWORDS.length) return;

        document.querySelectorAll('.message--post:not([data-voz-filtered])').forEach(post => {
            post.setAttribute('data-voz-filtered', '1');
            const body = post.querySelector('.message-body');
            if (!body) return;

            // Bước 1: thu gọn nội dung quote trong mọi comment
            collapseQuoteContents(post);

            // Bước 2: kiểm tra từ khóa chỉ trên text của chính người đó
            const text = getOwnText(body);
            const hit = KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
            if (hit) post.style.display = 'none';
        });
    }

    new MutationObserver(filterComments).observe(document.body, { childList: true, subtree: true });

    filterComments();
})();
