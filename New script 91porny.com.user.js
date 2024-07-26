// ==UserScript==
// @name        New script 91porny.com
// @namespace   Violentmonkey Scripts
// @match        http://91porny.com/*
// @match        https://91porny.com/*
// @grant       none
// @version     1.0
// @author      -
// @description 7/27/2024, 12:17:47 AM
// ==/UserScript==


window.onload = function() {
    setTimeout(doStuff, 500); // Wait 1 second before trying to click
};

function doStuff() {
    var e = document.querySelectorAll("button.btn.btn-primary");
    console.log(e); // Log the element to verify it’s selected
    for(var i = 0; i < e.length; i++) {
        e[i].click();
    }
}
doStuff();