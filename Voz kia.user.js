// ==UserScript==
// @name         Voz kia
// @match        https://voz.vn/*
// @icon         https://voz.vn/styles/next/xenforo/voz-logo-192.png?v=1
// @grant        none
// @run-at       document-start
// ==/UserScript==

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const observer = new IntersectionObserver(handleIntersection);
    const mutationObserver = new MutationObserver(observeAllUsernames);

    function applyKiaStyle(el) {
        el.style.color = 'red';
        el.style.textDecoration = "line-through";
    }

    function getUsernameById(id) {
        const selectors = [
            `.message-userDetails a.username[data-user-id='${id}']`,
            `.username.comment-user[data-user-id='${id}']`,
            `h4.attribution a.username[data-user-id='${id}']`,
            `.comment-contentWrapper a.username.comment-user[data-user-id='${id}']`,
            `.memberTooltip-nameWrapper a.username[data-user-id='${id}']`
        ];
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) return element.innerText;
        }
        return '';
    }

    function findUser(id, el) {
        const token = document.getElementsByName("_xfToken")[0]?.value;
        if (!token) {
            console.error('Token not found');
            return;
        }

        const username = getUsernameById(id);
        if (!username) return;

        const queryUrl = `https://voz.vn/index.php?members/find&q=${encodeURIComponent(username)}&_xfRequestUri=${document.location.pathname}&_xfWithData=1&_xfToken=${token}&_xfResponseType=json`;

        fetch(queryUrl)
            .then(response => response.json())
            .then(data => {
                const isKIA = !data.results.some(r => r.id === username);
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

    function observeAllUsernames() {
        const selectors = [
            '.message-userDetails a.username',
            '.username.comment-user',
            'h4.attribution a.username',
            '.comment-contentWrapper a.username.comment-user',
            '.memberTooltip-nameWrapper a.username'
        ];
        const els = document.querySelectorAll(selectors.join(','));
        els.forEach(el => observer.observe(el));
    }

    function observeLoadMoreComments() {
        const loadMoreButton = document.querySelector('.message-responseRow.u-jsOnly.js-commentLoader a');
        if (loadMoreButton) {
            loadMoreButton.addEventListener('click', () => {
                setTimeout(observeAllUsernames, 1000);
            });
        }
    }

    observeAllUsernames();
    observeLoadMoreComments();

    mutationObserver.observe(document.body, { childList: true, subtree: true });
});