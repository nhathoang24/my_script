// ==UserScript==
// @name         91Porny.com script
// @namespace    http://tampermonkey.net/
// @version      0.5
// @icon         https://91porny.com/assets-static/icon/apple-touch-icon.png
// @author       Chat-gpt
// @match        http://91porny.com/*
// @match        https://91porny.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function clickSkipButtons() {
        document.querySelectorAll('.skip-btn.cursor-p').forEach(button => button.click());
    }

    function clickCloseButtons() {
        document.querySelectorAll('.modal-footer .btn-primary').forEach(button => button.click());
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function observeDOMChanges() {
        const observer = new MutationObserver(debounce(() => {
            clickSkipButtons();
            clickCloseButtons();
        }, 200)); // 200ms debounce time

        observer.observe(document.body, { childList: true, subtree: true });
    }

    window.addEventListener('load', () => {
        clickSkipButtons();
        clickCloseButtons();
        observeDOMChanges();
    });
})();