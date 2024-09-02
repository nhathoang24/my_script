// ==UserScript==
// @name         Auto join/leave subreddits
// @namespace    http://tampermonkey.net/
// @version      1.5
// @icon https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-57x57.png
// @author       Bạn
// @match        *://old.reddit.com/*
// @grant        GM_registerMenuCommand
// ==/UserScript==

let mode = '';
const href = document.querySelector('.subscription-box .clear a')?.href;
console.log(href);

function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function clickWithDelay(selector) {
    const buttons = document.querySelectorAll(selector);
    if (buttons.length === 0) return;

    const total = buttons.length;
    let completed = 0;
    const actionText = mode === 'add' ? 'join' : 'leave';

    for (const [index, button] of Array.from(buttons).entries()) {
        button.click();
        const delay = getRandomDelay(1234, 5678);
        await new Promise(resolve => setTimeout(resolve, delay));
        completed++;
        console.log(`Đã ${actionText}: ${completed}/${total}`);
    }
    console.log("Đã hoàn thành!");
    window.close();
}

function addMode() {
    mode = 'add';
    clickWithDelay('span.fancy-toggle-button .option.active.add.login-required');
}

function removeMode() {
    mode = 'remove';
    clickWithDelay('span.fancy-toggle-button .option.active.remove.login-required');
}

GM_registerMenuCommand('Auto join subreddits', addMode);
GM_registerMenuCommand('Auto leave subreddits', removeMode);