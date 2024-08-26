// ==UserScript==
// @name         Voz kia
// @match        https://voz.vn/*
// @icon         https://voz.vn/styles/next/xenforo/voz-logo-192.png?v=1
// @grant        none
// @run-at       document-start
// ==/UserScript==

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // Mảng lưu trữ các ID KIA
    let kiaIds = [];

    // Đánh dấu các phần tử có ID là KIA
    function markKIA(id) {
        if (!kiaIds.includes(id)) {
            kiaIds.push(id);
        }
    }

    // Áp dụng màu đỏ cho các phần tử có ID là KIA
    function applyKIAStyles() {
        kiaIds.forEach(id => {
            let els = document.querySelectorAll(".message-userDetails a.username[data-user-id='" + id + "'], .username.comment-user[data-user-id='" + id + "']");
            els.forEach(el => {
                el.style.color = "red";
                el.style.textDecoration = "line-through";
            });
        });
    }

    function findUser(id) {
        let token = document.getElementsByName("_xfToken")[0]?.value;
        if (!token) {
            console.error('Token not found');
            return;
        }
        let queryUrl = `https://voz.vn/index.php?members/find&q={username}&_xfRequestUri={requestUri}&_xfWithData=1&_xfToken=${token}&_xfResponseType=json`;
        let username;

        if (document.location.pathname.startsWith('/t/')) {
            username = document.querySelector(`.message-userDetails a.username[data-user-id='${id}']`)?.innerText;
        } else if (document.location.pathname.startsWith('/u/')) {
            username = document.querySelector(`.username.comment-user[data-user-id='${id}']`)?.innerText;

            // Lấy thông tin người dùng từ phần tử div.comment-contentWrapper
            const commentContentWrappers = document.querySelectorAll('div.comment-contentWrapper');
            commentContentWrappers.forEach(wrapper => {
                const userLink = wrapper.querySelector('a.username.comment-user');
                if (userLink) {
                    const userId = userLink.getAttribute('data-user-id');
                    const username = userLink.innerText.trim();
                    console.log('User ID:', userId);
                    console.log('Username:', username);
                }
            });

            // Lấy tất cả các phần tử h4 với lớp attribution
            const attributionElements = document.querySelectorAll('h4.attribution');
            attributionElements.forEach(attributionElement => {
                const userLink = attributionElement.querySelector('a.username');
                if (userLink) {
                    const userId = userLink.getAttribute('data-user-id');
                    const username = userLink.innerText.trim();
                    console.log('User ID:', userId);
                    console.log('Username:', username);
                }
            });
        }

        if (username) {
            queryUrl = queryUrl.replace("{username}", encodeURIComponent(username))
                .replace("{requestUri}", document.location.pathname);

            let httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = function() {
                if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
                    let isKIA = !JSON.parse(httpRequest.responseText).results.some(r => r.id === username);
                    gotResult(id, isKIA);
                }
            };

            httpRequest.open("GET", queryUrl);
            httpRequest.send();
        }
    }

    function gotResult(id, isKIA) {
        if (isKIA) {
            markKIA(id);
            applyKIAStyles();
        }
    }

    let handledIds = [];
    function inoHandler(entries, observer) {
        entries.forEach(entry => {
            let id = entry.target.getAttribute("data-user-id");
            if (handledIds.includes(id)) {
                observer.unobserve(entry.target);
            } else if (entry.isIntersecting) {
                findUser(id);
                handledIds.push(id);
            }
        });
    }

    let observer = new IntersectionObserver(inoHandler);

    // Áp dụng màu đỏ cho các ID đã được đánh dấu khi trang được tải lại
    applyKIAStyles();

    let els = document.querySelectorAll(".message-userDetails a.username, .username.comment-user");
    els.forEach(el => observer.observe(el));
});
