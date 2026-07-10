// ==UserScript==
// @name         Bypass Adblock & Block Popunder
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Bypass SimpleBlocker và chặn click ẩn chuyển trang
// @include      /^https?:\/\/([a-z0-9-]+\.)*qmh\.[a-z]{2,}(:\d+)?\/.*$/
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- 1. BYPASS ANTI-ADBLOCK ---
    Object.defineProperty(window, 'adblockDetected', {
        get: () => false, set: () => {}, configurable: true
    });

    Object.defineProperty(window, 'SimpleBlocker', {
        get: () => ({
            isBlocked: async () => false,
            check: async (cb) => { if(cb) cb(false); return false; }
        }), set: () => {}, configurable: true
    });

    const originalDispatchEvent = document.dispatchEvent;
    document.dispatchEvent = function(event) {
        if (event && event.type === 'adblock-detected') {
            return originalDispatchEvent.call(this, new CustomEvent('adblock-detected', { detail: { detected: false } }));
        }
        return originalDispatchEvent.apply(this, arguments);
    };

    // --- 2. CHẶN POPUP & REDIRECT KHI CLICK ---
    // Khóa luôn hàm mở tab mới của trình duyệt
    window.open = function() {
        console.log("[Tampermonkey] Đã chặn một quảng cáo Popup/Popunder!");
        return null;
    };

    // Khi trang đã load xong, dọn dẹp các lớp phủ tàng hình
    window.addEventListener('DOMContentLoaded', () => {
        // Xóa các script liên quan đến quảng cáo popunder nếu có trong DOM
        document.querySelectorAll('script[src*="astronautlividlyreformer.com"]').forEach(el => el.remove());

        // Bắt mọi sự kiện click, nếu thẻ a có link lạ thì chặn luôn
        document.addEventListener('click', function(e) {
            // Tìm thẻ <a> gần nhất mà người dùng click vào
            let target = e.target.closest('a');
            if (target && target.href) {
                // Nếu link không cùng tên miền với web hoặc là link rác
                if (target.href.includes('javascript:void') || target.getAttribute('target') === '_blank') {
                    // Cấp phép nếu nó là link video hợp lệ, ngược lại thì chặn
                    if (!target.href.includes(window.location.hostname) && !target.href.includes('blob:')) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("[Tampermonkey] Đã chặn click chuyển hướng quảng cáo!");
                    }
                }
            }
        }, true); // Dùng capture phase để chặn từ sớm nhất
    });

    console.log("[Tampermonkey] Đã kích hoạt khiên chống Adblock & Popunder!");
})();
