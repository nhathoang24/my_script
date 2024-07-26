// ==UserScript==
// @name         Voz kia
// @match        https://voz.vn/t/*
// @icon         https://voz.vn/styles/next/xenforo/voz-logo-192.png?v=1
// @grant        none
// @run-at       document-start
// ==/UserScript==

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    function findUser(id) {
        let token = document.getElementsByName("_xfToken")[0].value;
        let queryUrl = "https://voz.vn/index.php?members/find&q={username}&_xfRequestUri={requestUri}&_xfWithData=1&_xfToken={token}&_xfResponseType=json";
        let username = document.querySelector(".message-userDetails a.username[data-user-id='" + id + "']").innerText;
        queryUrl = queryUrl.replace("{username}", encodeURIComponent(username))
            .replace("{requestUri}", document.location.pathname)
            .replace("{token}", token);

        let httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
                let isKIA = !JSON.parse(httpRequest.responseText).results.some(function (r) { return r.id === username; });
                gotResult(id, isKIA);
            }
        }

        httpRequest.open("GET", queryUrl);
        httpRequest.send();
    }

    function gotResult(id, isKIA) {
      if (isKIA) {
        let els = document.querySelectorAll(".message-userDetails a.username[data-user-id='" + id + "']");
        els.forEach(el => {
          el.style.color = "red";
          el.style.textDecoration = "line-through";
        });
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

    let els = document.querySelectorAll(".message-userDetails a.username");
    els.forEach(el => observer.observe(el));
});