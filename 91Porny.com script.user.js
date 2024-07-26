// ==UserScript==
// @name         91Porny.com script
// @namespace    http://tampermonkey.net/
// @version      0.3
// @icon         https://91porny.com/assets-static/icon/apple-touch-icon.png
// @author       Chat-gpt
// @match        http://91porny.com/*
// @match        https://91porny.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to click all skip buttons
    function clickSkipButtons() {
        // Select all elements with class 'skip-btn cursor-p'
        var skipButtons = document.querySelectorAll('.skip-btn.cursor-p');

        // If there are skip buttons present
        if (skipButtons.length > 0) {
            // Iterate over each skip button
            skipButtons.forEach(function(button) {
                button.click(); // Click the button
                console.log('Clicking skip button:', button); // Log the action
            });
        }
    }

    // Function to click all close buttons
    function clickCloseButtons() {
        // Select all button elements with classes 'btn btn-primary'
        var closeButtons = document.querySelectorAll('.modal-footer .btn-primary');
        console.log(closeButtons); // Log the buttons to verify they are selected

        // Iterate over each close button
        closeButtons.forEach(function(button) {
            button.click(); // Click the button
        });
    }

    // Event listener for when the window has fully loaded
    window.addEventListener('load', function() {
        clickSkipButtons(); // Click all skip buttons when the page loads
        setTimeout(clickCloseButtons, 300); // Wait 500 milliseconds then click close buttons
        clearTimeout(clickCloseButtons);
    });
})();



















