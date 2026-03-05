// ==UserScript==
// @name         VOZ - Ẩn comment tài khoản mới
// @namespace    http://tampermonkey.net/
// @version      3.8
// @description  Ẩn comment của user có tài khoản dưới 1 tháng tuổi, có nút Show để xem lại
// @match        https://voz.vn/t/*
// @icon         https://voz.vn/styles/next/xenforo/voz-logo-192.png?v=1
// ==/UserScript==
(function () {
    'use strict';

    const AGE_THRESHOLD_MS = 13 * 24 * 60 * 60 * 1000;
    const MAX_CONCURRENT = 5;

    let activeRequests = 0;
    const queue = [];
    const sessionCache = {};

    function getDaysJoined(joinedTs) {
        if (!joinedTs || isNaN(joinedTs)) return null;
        const ms = Date.now() - joinedTs * 1000;
        const days = Math.floor(ms / (24 * 60 * 60 * 1000));
        return days >= 0 ? days : null;
    }

    function injectStyle() {
        if (document.querySelector('#voz-filter-style')) return;
        const style = document.createElement('style');
        style.id = 'voz-filter-style';
        style.textContent = `
            .voz-notice-bar {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                font-size: 12px;
                font-family: system-ui, sans-serif;
                color: #7a6a50;
                background: #f5f0e8;
                border-left: 3px solid #c8a876;
                border-bottom: 1px solid #e0d5c0;
            }
            .voz-notice-bar .voz-label { color: #9a8060; font-size: 11.5px; }
            .voz-notice-bar .voz-username { color: #7a6040; font-weight: 600; font-size: 11.5px; }
            .voz-notice-bar .voz-days {
                color: #b07840;
                font-size: 11px;
                font-weight: 500;
                background: #ecdfc8;
                padding: 1px 6px;
                border-radius: 3px;
                white-space: nowrap;
            }
            .voz-dot { color: #c0aa88; font-size: 10px; }
            .voz-show-btn {
                margin-left: 4px;
                padding: 2px 10px;
                background: #fff;
                color: #4a7abf;
                border: 1px solid #aac0e0;
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
            .voz-show-btn:hover { background: #4a7abf; color: #fff; border-color: #4a7abf; }
            .voz-show-btn:active { background: #3a6aaf; border-color: #3a6aaf; }
            .voz-quote-hidden {
                display: none !important;
            }
            .voz-quote-bar {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                font-size: 11.5px;
                font-family: system-ui, sans-serif;
                color: #9a8060;
                background: #f9f5ee;
                border: 1px solid #e0d5c0;
                border-radius: 4px;
                margin: 4px 0;
                cursor: default;
            }
            .voz-quote-bar .voz-show-btn { margin-left: auto; }
        `;
        document.head.appendChild(style);
    }

    function getUsernameFromMessage(messageEl, userId) {
        const authorEl = messageEl.querySelector(`.message-userDetails [data-user-id="${userId}"]`)
                      || messageEl.querySelector(`[data-user-id="${userId}"]`);
        return authorEl?.textContent?.trim() || `#${userId}`;
    }

    // ── NEW: collapse quoted blocks that belong to a hidden user ──────────────
    function collapseQuotesForUser(userId, username, joinedTs) {
        const days = getDaysJoined(joinedTs);
        const daysLabel = days === null ? '?' : days === 0 ? 'Hôm nay' : `${days} ngày`;

        // XenForo stores the quoted member id in data-attributes as "member: <id>"
        document.querySelectorAll(`.bbCodeBlock--quote[data-attributes*="member: ${userId}"]`).forEach(quoteEl => {
            if (quoteEl.dataset.vozQuoteHidden) return; // already processed

            quoteEl.dataset.vozQuoteHidden = '1';
            quoteEl.classList.add('voz-quote-hidden');

            const bar = document.createElement('div');
            bar.className = 'voz-quote-bar';
            bar.innerHTML = `
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c8a876" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:0.8">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>Quote từ tài khoản mới</span>
                <span class="voz-dot">·</span>
                <span class="voz-username" style="color:#7a6040;font-weight:600">${username}</span>
                <span class="voz-dot">·</span>
                <span class="voz-days" style="color:#b07840;font-size:11px;font-weight:500;background:#ecdfc8;padding:1px 6px;border-radius:3px">🕐 ${daysLabel}</span>
                <button class="voz-show-btn">👁 Show</button>
            `;

            bar.querySelector('.voz-show-btn').addEventListener('click', () => {
                bar.remove();
                quoteEl.classList.remove('voz-quote-hidden');
                delete quoteEl.dataset.vozQuoteHidden;
            });

            quoteEl.parentNode.insertBefore(bar, quoteEl);
        });
    }
    // ─────────────────────────────────────────────────────────────────────────

    function collapsePost(messageEl, userId, joinedTs) {
        if (messageEl.querySelector('.voz-notice-bar')) return;

        const username = getUsernameFromMessage(messageEl, userId);
        const days = getDaysJoined(joinedTs);
        const daysLabel = days === null ? '?' : days === 0 ? 'Hôm nay' : `${days} ngày`;

        const contentChildren = Array.from(messageEl.children);
        contentChildren.forEach(child => {
            child.style.display = 'none';
            child.dataset.vozHidden = '1';
        });

        const bar = document.createElement('div');
        bar.className = 'voz-notice-bar';
        bar.innerHTML = `
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c8a876" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:0.8">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span class="voz-label">Tài khoản mới</span>
            <span class="voz-dot">·</span>
            <span class="voz-username">${username}</span>
            <span class="voz-dot">·</span>
            <span class="voz-days">🕐 ${daysLabel}</span>
            <button class="voz-show-btn">👁 Show</button>
        `;

        bar.querySelector('.voz-show-btn').addEventListener('click', () => {
            bar.style.opacity = '0';
            bar.style.transition = 'opacity 0.15s';
            setTimeout(() => {
                bar.remove();
                contentChildren.forEach(child => {
                    if (child.dataset.vozHidden) {
                        child.style.display = '';
                        delete child.dataset.vozHidden;
                    }
                });
            }, 150);
        });

        messageEl.insertBefore(bar, messageEl.firstChild);
    }

    function hidePostsByUserId(userId, joinedTs) {
        const username = (() => {
            const el = document.querySelector(`[data-user-id="${userId}"]`);
            return el?.textContent?.trim() || `#${userId}`;
        })();

        document.querySelectorAll(`.message [data-user-id="${userId}"]`).forEach(el => {
            const messageEl = el.closest('.message');
            if (messageEl) collapsePost(messageEl, userId, joinedTs);
        });

        // Also collapse any quotes of this user inside other people's posts
        collapseQuotesForUser(userId, username, joinedTs);
    }

    function processNext() {
        if (queue.length === 0 || activeRequests >= MAX_CONCURRENT) return;
        const { userId, username } = queue.shift();
        activeRequests++;

        fetch(`/u/${username}.${userId}/`)
            .then(r => r.text())
            .then(html => {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const joinedDt = Array.from(doc.querySelectorAll('.pairs dt'))
                    .find(dt => dt.textContent.trim() === 'Joined');

                if (joinedDt) {
                    const timeEl = joinedDt.nextElementSibling?.querySelector('time');
                    if (timeEl) {
                        const joinedTs = parseInt(timeEl.dataset.timestamp);
                        if (!joinedTs || isNaN(joinedTs)) return;
                        const isNew = (Date.now() - joinedTs * 1000) < AGE_THRESHOLD_MS;
                        sessionCache[userId] = { isNew, joinedTs };
                        if (isNew) hidePostsByUserId(userId, joinedTs);
                    }
                }
            })
            .catch(() => { sessionCache[userId] = { isNew: false, joinedTs: 0 }; })
            .finally(() => {
                activeRequests--;
                processNext();
            });
    }

    function enqueue(userId, username) {
        if (userId in sessionCache) {
            const cached = sessionCache[userId];
            if (cached?.isNew === true) hidePostsByUserId(userId, cached.joinedTs);
            return;
        }
        sessionCache[userId] = 'pending';
        queue.push({ userId, username });
        processNext();
    }

    function scanPosts() {
        document.querySelectorAll('.message [data-user-id]').forEach(el => {
            const userId = el.dataset.userId;
            const username = el.getAttribute('aria-label') || el.textContent.trim();
            if (userId && username && !(userId in sessionCache)) {
                enqueue(userId, username);
            }
        });
    }

    injectStyle();
    scanPosts();

    let scanTimer = null;
    const observer = new MutationObserver(() => {
        clearTimeout(scanTimer);
        scanTimer = setTimeout(scanPosts, 300);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[VOZ Filter v3.8] Đã khởi động');
})();
