// ==UserScript==
// @name         Rphang - Anti Popunder
// @namespace    https://github.com/local/rphang-blocker
// @version      3.1
// @description  Chặn popunder theo HÀNH VI + vô hiệu shouldShow/venorShouldShow. Không phụ thuộc domain.
// @author       Local
// @match        *://rphang.tld/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const PAGE_HOST = location.hostname;

    // ═══════════════════════════════════════════════════════════════════════
    // LỚP 1 — Vô hiệu từ gốc: override shouldShow & venorShouldShow
    //
    // Ý tưởng từ script so sánh — rất hiệu quả:
    // Popunder kiểm tra 2 hàm này trước khi chạy:
    //   if (!popMagic.shouldShow() || !popMagic.venorShouldShow()) return;
    // → Ép cả 2 trả về false = popunder không bao giờ kích hoạt
    //
    // Dùng polling vì pemsrv.js load async, popMagic chưa có ngay
    // Kết hợp với Lớp 4 (bẫy setter) để bắt ngay khi popMagic được gán
    // ═══════════════════════════════════════════════════════════════════════

    const killPopMagicMethods = () => {
        const pm = window.__realPopMagic;
        if (!pm || pm.__disabled) return false;
        pm.shouldShow = () => false;
        pm.venorShouldShow = () => false;
        pm.isValidUserEvent = () => false;
        pm.__disabled = true;
        console.info('[RPH] ✅ Lớp 1: Đã vô hiệu hóa popMagic methods');
        return true;
    };

    const pollId = setInterval(() => {
        if (killPopMagicMethods()) clearInterval(pollId);
    }, 10);
    setTimeout(() => clearInterval(pollId), 10_000);


    // ═══════════════════════════════════════════════════════════════════════
    // LỚP 2 — Chặn document.location redirect theo HÀNH VI
    //
    // Popunder luôn theo trình tự này (bất kể domain):
    //   (1) click → (2) window.open(legitimateUrl, "_blank")
    //              → (3) document.location = adUrl  ← CHẶN ở đây
    //
    // Lưu ý: script kia check isPemsrvUrl trong window.open là SAI vì
    // window.open nhận legitimateUrl, không phải adUrl.
    // adUrl đi vào document.location — đó là chỗ cần chặn.
    // ═══════════════════════════════════════════════════════════════════════

    let openCalledDuringClick = false;
    let openCalledTimer = null;
    let insideClickHandler = false;

    document.addEventListener('click', () => { insideClickHandler = true; }, true);
    document.addEventListener('click', () => { insideClickHandler = false; }, false);

    const _windowOpen = window.open.bind(window);
    window.open = function (url, target, features) {
        if (insideClickHandler) {
            openCalledDuringClick = true;
            clearTimeout(openCalledTimer);
            openCalledTimer = setTimeout(() => { openCalledDuringClick = false; }, 500);
        }
        return _windowOpen(url, target, features);
    };

    function patchLocationHref(locationObj, label) {
        try {
            const proto = Object.getPrototypeOf(locationObj);
            const desc = Object.getOwnPropertyDescriptor(proto, 'href');
            if (!desc || !desc.set) return;
            Object.defineProperty(locationObj, 'href', {
                get: desc.get,
                set(newUrl) {
                    if (openCalledDuringClick) {
                        const targetHost = (() => {
                            try { return new URL(newUrl).hostname; } catch { return ''; }
                        })();
                        if (targetHost && targetHost !== PAGE_HOST) {
                            console.warn(`[RPH] 🛡️ Lớp 2: Chặn redirect (${label}) → ${newUrl}`);
                            openCalledDuringClick = false;
                            return; // ← CHẶN
                        }
                    }
                    desc.set.call(this, newUrl);
                },
                configurable: true,
            });
        } catch (e) { /* silent */ }
    }

    patchLocationHref(window.location, 'window.location');
    patchLocationHref(document.location, 'document.location');
    try {
        if (window.top && window.top !== window)
            patchLocationHref(window.top.location, 'top.location');
    } catch (e) { /* cross-origin */ }


    // ═══════════════════════════════════════════════════════════════════════
    // LỚP 3 — Chặn script load theo THUỘC TÍNH & NỘI DUNG
    //
    // ExoClick/Clickadu PHẢI truyền config qua attribute → không đổi được
    // dù domain có thay đổi
    // ═══════════════════════════════════════════════════════════════════════

    const BLOCKED_SCRIPT_ATTRS = [
        'data-exo-idzone', 'data-exo-trigger_method',
        'data-exo-popup_fallback', 'data-exo-frequency_period', 'data-clbaid',
    ];
    const BLOCKED_SCRIPT_ID = [/popmagic/i, /popunder/i, /adldr/i, /adloader/i];
    const BLOCKED_INLINE = [
        /popMagic\s*=/, /executeOnRedirect/, /venorShouldShow/,
        /popmagicldr/i, /data-exo-idzone/,
    ];
    const TRUSTED_HOSTS = [
        'fonts.googleapis.com', 'fonts.gstatic.com',
        'www.googletagmanager.com', 'www.google-analytics.com',
        'cdnjs.cloudflare.com', 'rphang.bar',
    ];

    function isAdScript(node) {
        if (!node || node.tagName !== 'SCRIPT') return false;
        if (BLOCKED_SCRIPT_ATTRS.some(a => node.hasAttribute(a))) return true;
        if (BLOCKED_SCRIPT_ID.some(p => p.test(node.id || ''))) return true;
        const c = node.textContent || '';
        if (c.length > 0 && c.length < 300000 && BLOCKED_INLINE.some(p => p.test(c))) return true;
        return false;
    }

    function isForeignHost(url) {
        try {
            const host = new URL(url.startsWith('//') ? 'https:' + url : url).hostname;
            return !TRUSTED_HOSTS.some(t => host === t || host.endsWith('.' + t));
        } catch { return false; }
    }

    const observer = new MutationObserver(mutations => {
        for (const { addedNodes } of mutations) {
            for (const node of addedNodes) {
                if (node.nodeType !== 1) continue;
                if (isAdScript(node)) {
                    console.warn('[RPH] 🛡️ Lớp 3: Xóa ad script:', node.src || '[inline]');
                    node.remove();
                }
                if (node.tagName === 'LINK' && node.rel === 'preconnect' && isForeignHost(node.href)) {
                    console.warn('[RPH] 🛡️ Lớp 3: Xóa preconnect lạ:', node.href);
                    node.remove();
                }
            }
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });


    // ═══════════════════════════════════════════════════════════════════════
    // LỚP 4 — Bẫy window.popMagic bằng getter/setter
    //
    // Khi popunder script gán window.popMagic = {...}:
    // - Setter bắt được, lưu vào __realPopMagic
    // - Gọi killPopMagicMethods() ngay lập tức để override shouldShow
    // - Getter trả null ra ngoài để engine không dùng được
    // ═══════════════════════════════════════════════════════════════════════

    Object.defineProperty(window, 'popMagic', {
        get() { return null; },
        set(v) {
            window.__realPopMagic = v;
            killPopMagicMethods(); // vô hiệu ngay lập tức
            console.warn('[RPH] 🛡️ Lớp 4: Bắt gán window.popMagic → đã disable');
        },
        configurable: false,
    });


    // ═══════════════════════════════════════════════════════════════════════
    // Cleanup sau DOMContentLoaded
    // ═══════════════════════════════════════════════════════════════════════

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('script').forEach(s => {
            if (isAdScript(s)) { console.warn('[RPH] 🛡️ Late-remove:', s.src); s.remove(); }
        });
        document.querySelectorAll('link[rel="preconnect"]').forEach(l => {
            if (isForeignHost(l.href)) { l.remove(); }
        });
        console.info('[RPH] ✅ Anti-Popunder v3.0 sẵn sàng!');
    }, { once: true });

    console.info('[RPH] ✅ document-start — v3.0 (Behavior + Method Override)');

})();
