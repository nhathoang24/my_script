// ==UserScript==
// @name         VOZ - Hiển thị ngày tham gia
// @namespace    https://voz.vn/
// @version      5.0.0
// @description  Hiển thị ngày tham gia (Joined) dưới tên thành viên
// @author       hoang
// @match        https://voz.vn/t/*
// @icon         https://voz.vn/styles/next/xenforo/voz-logo-192.png?v=1
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const cache = {};

    const style = document.createElement('style');
    style.textContent = `
        .voz-joindate {
            font-size: 11px;
            color: #888;
            margin-top: 2px;
            line-height: 1.3;
        }
    `;
    document.head.appendChild(style);

    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            io.unobserve(entry.target);
            fetchAndRender(entry.target);
        }
    }, { rootMargin: '200px 0px' });

    function getXfToken() {
        try { return window.XF?.config?.csrf; } catch (e) { return null; }
    }

    function parseJoinDate(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        for (const dt of doc.querySelectorAll('dt')) {
            if (dt.textContent.trim() === 'Joined') {
                const dd = dt.nextElementSibling;
                if (dd) {
                    const timeEl = dd.querySelector('time');
                    return timeEl
                        ? (timeEl.getAttribute('data-date') || timeEl.textContent.trim())
                        : dd.textContent.trim();
                }
            }
        }
        return null;
    }

    function fetchJoinDate(userId, username) {
        if (cache[userId]) return cache[userId];

        const token = getXfToken();
        const params = new URLSearchParams({
            tooltip: 'true',
            _xfResponseType: 'json',
            _xfWithData: '1',
            _xfRequestUri: location.pathname,
            _xfToken: token || '',
        });

        const url = `/u/${username}.${userId}/?${params}`;

        cache[userId] = fetch(url, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
            },
        })
        .then(res => {
            if (!res.ok) {
                console.warn(`[VOZ JoinDate] ${userId} → ${res.status}`);
                return null;
            }
            return res.json();
        })
        .then(data => {
            if (!data) return null;
            const html = data?.html?.content ?? data?.html ?? null;
            if (!html) return null;
            return parseJoinDate(html);
        })
        .catch(e => {
            console.warn('[VOZ JoinDate] error', e);
            return null;
        });

        return cache[userId];
    }

    async function fetchAndRender(userCell) {
        const avatarLink = userCell.querySelector('.message-avatar-wrapper a[data-user-id]');
        if (!avatarLink) return;

        const userId = avatarLink.getAttribute('data-user-id');
        if (!userId) return;

        const href = avatarLink.getAttribute('href') || '';
        const match = href.match(/\/u\/([^.]+)\.\d+\//);
        const username = match ? match[1] : null;
        if (!username) return;

        const userDetails = userCell.querySelector('.message-userDetails');
        if (!userDetails) return;
        if (userDetails.querySelector('.voz-joindate')) return;

        const el = document.createElement('div');
        el.className = 'voz-joindate';
        userDetails.appendChild(el);

        const joinDate = await fetchJoinDate(userId, username);

        if (joinDate) {
            el.textContent = `Joined: ${joinDate}`;
        } else {
            el.remove();
        }
    }

    function observePost(article) {
        const userCell = article.querySelector('.message-cell--user');
        if (!userCell || userCell.dataset.vozObserved) return;
        userCell.dataset.vozObserved = '1';
        io.observe(userCell);
    }

    const mo = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.matches?.('article.message--post')) observePost(node);
                else node.querySelectorAll?.('article.message--post').forEach(observePost);
            }
        }
    });

    mo.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll('article.message--post').forEach(observePost);

})();
