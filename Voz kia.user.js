// ==UserScript==
// @name         Voz kia
// @match        https://voz.vn/*
// @icon         https://voz.vn/styles/next/xenforo/voz-logo-192.png?v=1
// @grant        none
// @run-at       document-start
// ==/UserScript==

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    let observer = new IntersectionObserver(inoHandler);

    function applyKiaStyle(el) {
        el.style.color = 'red';
        el.style.textDecoration = "line-through";
        console.log('Applied KIA style to', el);
    }

    function getUsernameById(id) {
        let username = '';
        if (document.location.pathname.startsWith('/t/')) {
            username = document.querySelector(`.message-userDetails a.username[data-user-id='${id}']`)?.innerText;
        } else if (document.location.pathname.startsWith('/u/')) {
            username = document.querySelector(`.username.comment-user[data-user-id='${id}']`)?.innerText
                || document.querySelector(`h4.attribution a.username[data-user-id='${id}']`)?.innerText
                || document.querySelector(`.comment-contentWrapper a.username.comment-user[data-user-id='${id}']`)?.innerText;
        }
        return username;
    }

    function findUser(id, el) {
        let token = document.getElementsByName("_xfToken")[0]?.value;
        if (!token) {
            console.error('Token not found');
            return;
        }
        let username = getUsernameById(id);
        if (!username) return;

        let queryUrl = `https://voz.vn/index.php?members/find&q=${encodeURIComponent(username)}&_xfRequestUri=${document.location.pathname}&_xfWithData=1&_xfToken=${token}&_xfResponseType=json`;

        let httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
                let isKIA = !JSON.parse(httpRequest.responseText).results.some(r => r.id === username);
                if (isKIA) {
                    applyKiaStyle(el);
                }
            }
        };

        httpRequest.open("GET", queryUrl);
        httpRequest.send();
    }

    function inoHandler(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let id = entry.target.getAttribute("data-user-id");
                if (id) {
                    findUser(id, entry.target);
                }
            }
        });
    }

    function observeLoadMoreComments() {
        const loadMoreButton = document.querySelector('.message-responseRow.u-jsOnly.js-commentLoader a');
        if (loadMoreButton) {
            loadMoreButton.addEventListener('click', () => {
                setTimeout(() => {
                    observeAllUsernames();
                }, 1000);  // Chờ một chút để nội dung mới được tải
            });
        }
    }

    function observeAllUsernames() {
        let els = document.querySelectorAll(".message-userDetails a.username, .username.comment-user, h4.attribution a.username, .comment-contentWrapper a.username.comment-user");
        els.forEach(el => observer.observe(el));
    }

    observeAllUsernames();
    observeLoadMoreComments();

    const mutationObserver = new MutationObserver(() => {
        observeAllUsernames();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
});