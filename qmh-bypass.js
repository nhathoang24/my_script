// ==UserScript==
// @name         QMH Bypass v5.0
// @namespace    qmh-bypass
// @version      5.0
// @match        *://*.qmh.tld/*
// @match        *://video.qmh.tld/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const HOME        = location.href;
    const HOME_ORIGIN = location.origin;

    // ── Phát hiện redirect ra ngoài domain ──────────────────────────
    const isExternal = url => {
        if (!url) return false;
        try { return new URL(url, location.href).origin !== HOME_ORIGIN; }
        catch { return false; }
    };

    // ── Theo dõi user gesture ────────────────────────────────────────
    let byUser = false;
    document.addEventListener('mousedown', () => { byUser = true; }, true);
    document.addEventListener('keydown',   () => { byUser = true; }, true);

    const consumeGesture = () => { const v = byUser; byUser = false; return v; };

    // ── 1. location.assign / replace ────────────────────────────────
    const origAssign  = location.assign.bind(location);
    const origReplace = location.replace.bind(location);
    try {
        window.location.assign  = url => {
            if (!consumeGesture() && isExternal(url)) return;
            origAssign(url);
        };
        window.location.replace = url => {
            if (!consumeGesture() && isExternal(url)) return;
            origReplace(url);
        };
    } catch(e) {}

    // ── 2. window.open ───────────────────────────────────────────────
    const origOpen = window.open.bind(window);
    const safeOpen = (url, ...args) => {
        if (!consumeGesture() && isExternal(url)) {
            console.log('🚫 Auto window.open blocked:', url);
            return null;
        }
        return origOpen(url, ...args);
    };
    Object.defineProperty(window, 'open', {
        get: () => safeOpen,
        set: () => {},
        configurable: false
    });

    // ── 3. history API ───────────────────────────────────────────────
    const _pushState = history.pushState.bind(history);
    const _replState = history.replaceState.bind(history);
    history.pushState    = (s, t, url) => isExternal(url) ? undefined : _pushState(s, t, url);
    history.replaceState = (s, t, url) => isExternal(url) ? undefined : _replState(s, t, url);

    // ── 4. Poll cho location.href = ──────────────────────────────────
    const pollBad = () => {
        if (isExternal(location.href)) {
            _replState(null, '', HOME);
            origReplace(HOME);
        }
        requestIdleCallback(pollBad, { timeout: 500 });
    };
    requestIdleCallback(pollBad, { timeout: 500 });

    // ── 5. Giả mạo adblock ──────────────────────────────────────────
    window.adblockDetected = false;
    Object.defineProperty(window, 'adblockDetected', { get: () => false, set: () => {} });
    window.ninzoq = () => {};
    window.SimpleBlocker = {
        isBlocked: async () => false,
        check: async cb => { cb?.(false); return false; }
    };

    // ── 6. Hook iframe ───────────────────────────────────────────────
    const hookIframe = node => {
        node.addEventListener('load', () => {
            try {
                const w = node.contentWindow;
                if (w) Object.defineProperty(w, 'open', {
                    get: () => safeOpen,
                    set: () => {},
                    configurable: false
                });
            } catch(e) {}
        });
    };

    // ── 7. Observer head — script/meta ───────────────────────────────
    new MutationObserver(muts => {
        for (const m of muts) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1) continue;
                // Script inject từ domain lạ
                if (node.nodeName === 'SCRIPT' && isExternal(node.src)) {
                    node.remove(); continue;
                }
                // Meta refresh ra ngoài
                if (node.nodeName === 'META' &&
                    node.httpEquiv?.toLowerCase() === 'refresh' &&
                    isExternal(node.content?.match(/url=(.+)/i)?.[1])) {
                    node.remove();
                }
            }
        }
    }).observe(document.documentElement, { childList: true });

    // ── 8. Observer body — iframe + overlay ──────────────────────────
    const bodyObserver = new MutationObserver(muts => {
        for (const m of muts) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.nodeName === 'IFRAME') { hookIframe(node); continue; }
                if (node.classList?.contains('adblocker-page-overlay') ||
                    node.classList?.contains('adblocker-page-backdrop')) {
                    node.remove();
                }
            }
        }
    });

    if (document.body) {
        bodyObserver.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            bodyObserver.observe(document.body, { childList: true, subtree: true });
        }, { once: true });
    }

    // ── 9. CSS backup ────────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `.adblocker-page-overlay,.adblocker-page-backdrop{display:none!important}`;
    document.documentElement.appendChild(style);

})();
