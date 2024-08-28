// ==UserScript==
// @name         Voz KIA User Highlighter
// @description  Hiện các thành viên đã bị ban trên voz
// @match        https://voz.vn/t/*
// @match        https://voz.vn/whats-new/profile-posts/*
// @match        https://voz.vn/u/*
// @match        https://voz.vn/search/*
// @author       itisme
// @version      1.0
// @icon         https://voz.vn/styles/next/xenforo/voz-logo-192.png?v=1
// @grant        none
// @run-at       document-start
// ==/UserScript==

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const observer = new IntersectionObserver(handleIntersection);
    const mutationObserver = new MutationObserver(handleMutations);
    const cache = new Map();

    const selectors = [
        '.message-userDetails a.username',
        'h4.attribution a.username',
        '.comment-contentWrapper a.username.comment-user',
        '.memberTooltip-nameWrapper a.username'
    ];

    const token = document.getElementsByName("_xfToken")[0]?.value;
    if (!token) {
        console.error('Token not found');
        return;
    }

    function applyKiaStyle(el) {
        el.style.color = 'red';
        el.style.textDecoration = "line-through";
    }

    function getUsernameById(id) {
        for (const selector of selectors) {
            const element = document.querySelector(`${selector}[data-user-id='${id}']`);
            if (element) return element.innerText;
        }
        return '';
    }

    function findUser(id, el) {
        if (cache.has(id)) {
            if (cache.get(id)) applyKiaStyle(el);
            return;
        }

        const username = getUsernameById(id);
        if (!username) return;

        const queryUrl = `https://voz.vn/index.php?members/find&q=${encodeURIComponent(username)}&_xfRequestUri=${document.location.pathname}&_xfWithData=1&_xfToken=${token}&_xfResponseType=json`;

        fetch(queryUrl)
            .then(response => response.json())
            .then(data => {
                const isKIA = !data.results.some(r => r.id === username);
                cache.set(id, isKIA);
                if (isKIA) applyKiaStyle(el);
            })
            .catch(console.error);
    }

    function handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("data-user-id");
                if (id) findUser(id, entry.target);
            }
        });
    }

    function handleMutations(mutationsList) {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const newUsernames = node.querySelectorAll(selectors.join(','));
                        newUsernames.forEach(el => observer.observe(el));
                    }
                });
            }
        });
    }

    function observeLoadMoreButton() {
        const loadMoreButton = document.querySelector('.message-responseRow.u-jsOnly.js-commentLoader a');
        if (loadMoreButton) {
            loadMoreButton.addEventListener('click', () => {
                mutationObserver.observe(document.body, { childList: true, subtree: true });
            });
        }
    }

    function observeAllUsernames() {
        const els = document.querySelectorAll(selectors.join(','));
        els.forEach(el => observer.observe(el));
    }

    observeAllUsernames();
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    observeLoadMoreButton();

    document.addEventListener('ajaxComplete', () => {
        const newUsernames = document.querySelectorAll(selectors.join(','));
        newUsernames.forEach(el => observer.observe(el));
    });
});