// ==UserScript==
// @name         Encode/Decode Base64 or Hex with Copy Option
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Encode or decode Base64 or Hex strings and copy to clipboard
// @author       abcd
// @match        *://voz.vn/*
// @match        *://vn-z.vn/*
// @icon         https://data.voz.vn/styles/next/xenforo/smilies/popopo/sexy_girl.png?v=01
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create and style UI elements
    const container = document.createElement('div');
    container.style.cssText =
        'position: fixed; top: 45px; right: 15px; padding: 15px;' +
        'background: #fff; border: 1px solid #ddd; border-radius: 5px;' +
        'box-shadow: 0px 0px 10px rgba(0,0,0,0.2); z-index: 10000;' +
        'display: none; width: 300px; max-width: calc(100% - 30px);' +
        'max-height: calc(100vh - 90px); overflow: auto;';

    const inputField = document.createElement('textarea');
    inputField.style.cssText =
        'width: 100%; height: 80px; margin-bottom: 10px; resize: none;' +
        'border: 1px solid #ddd; border-radius: 5px; padding: 10px;';
    inputField.placeholder = 'Enter the string to encode/decode...';

    const modeSelector = document.createElement('select');
    const actionSelector = document.createElement('select');
    ['Base64', 'Hex'].forEach(v => modeSelector.add(new Option(v, v.toLowerCase())));
    ['Decode', 'Encode'].forEach(v => actionSelector.add(new Option(v, v.toLowerCase())));

    // Set default mode to Hex
    modeSelector.value = 'hex';

    const executeButton = document.createElement('button');
    executeButton.style.cssText =
        'width: 100%; border: none; border-radius: 5px; padding: 10px;' +
        'cursor: pointer; background: #3498db; color: white; transition: background-color 0.3s;';
    executeButton.textContent = 'Execute';

    const copyButton = document.createElement('button');
    copyButton.style.cssText =
        'width: 100%; border: none; border-radius: 5px; padding: 10px;' +
        'cursor: pointer; background: #2ecc71; color: white; transition: background-color 0.3s;';
    copyButton.textContent = 'Copy to Clipboard';

    const toggleButton = document.createElement('button');
    toggleButton.style.cssText =
        'position: fixed; top: 0px; right: 5px; width: 40px; height: 40px;' +
        'border-radius: 50%; z-index: 10000; background: transparent;' +
        'border: none; cursor: pointer; background-image: url("https://data.voz.vn/styles/next/xenforo/smilies/popopo/sexy_girl.png?v=01");' +
        'background-size: cover; background-position: center;';

    container.append(inputField, modeSelector, actionSelector, executeButton, copyButton);
    document.body.append(container, toggleButton);

    // Drag functionality for toggle button
    let isDragging = false, startX, startY, startLeft, startTop;
    toggleButton.addEventListener('mousedown', e => {
        isDragging = true;
        startX = e.clientX; startY = e.clientY;
        startLeft = parseInt(getComputedStyle(toggleButton).left, 10) || 0;
        startTop = parseInt(getComputedStyle(toggleButton).top, 10) || 0;
        toggleButton.style.cursor = 'move';
    });

    document.addEventListener('mousemove', e => {
        if (isDragging) {
            const dx = e.clientX - startX, dy = e.clientY - startY;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                const newLeft = Math.min(window.innerWidth - toggleButton.offsetWidth - 10, Math.max(0, startLeft + dx));
                const newTop = Math.min(window.innerHeight - toggleButton.offsetHeight - 10, Math.max(0, startTop + dy));
                toggleButton.style.left = `${newLeft}px`;
                toggleButton.style.top = `${newTop}px`;
                container.style.left = `${Math.max(0, newLeft - container.offsetWidth)}px`;
                container.style.top = `${Math.max(0, Math.min(newTop + toggleButton.offsetHeight, window.innerHeight - container.offsetHeight))}px`;
                container.style.right = 'auto';
            }
        }
    });

    document.addEventListener('mouseup', e => {
        if (isDragging) {
            isDragging = false;
            toggleButton.style.cursor = 'pointer';
            if (Math.abs(e.clientX - startX) < 5 && Math.abs(e.clientY - startY) < 5) {
                container.style.display = container.style.display === 'none' ? 'block' : 'none';
            }
        }
    });

    // Encode and decode functions
    const encodeBase64 = input => btoa(input);
    const encodeHex = input => Array.from(input).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ').toUpperCase();
    const decodeBase64 = input => atob(input);
    const decodeHex = input => decodeURIComponent(input.replace(/\s+/g, '').match(/.{1,2}/g).map(byte => `%${byte}`).join(''));

    // Validate hex string
    const isValidHex = input => /^[a-fA-F0-9\s]*$/.test(input) && input.replace(/\s+/g, '').length % 2 === 0;

    // Event listeners for buttons
    executeButton.addEventListener('click', () => {
        const input = inputField.value.trim();
        let result;

        if (modeSelector.value === 'hex' && !isValidHex(input) && actionSelector.value === 'decode') {
            inputField.style.backgroundColor = '#f8d7da'; // red background for invalid hex
            inputField.placeholder = 'Invalid Hex String';
            return;
        } else {
            inputField.style.backgroundColor = '#fff'; // reset background color
            inputField.placeholder = 'Enter the string to encode/decode...';
        }

        try {
            result = (actionSelector.value === 'encode' ?
                (modeSelector.value === 'base64' ? encodeBase64 : encodeHex) :
                (modeSelector.value === 'base64' ? decodeBase64 : decodeHex))(input);
            inputField.value = result;
        } catch (e) {
            inputField.style.backgroundColor = '#f8d7da'; // red background for decode error
            inputField.placeholder = 'Error during decoding';
            console.error(e);
        }

        if (actionSelector.value === 'decode') {
            executeButton.style.backgroundColor = '#03089c';
            setTimeout(() => executeButton.style.backgroundColor = '#3498db', 1000);
        }
    });

    copyButton.addEventListener('click', () => {
        if (inputField.value) {
            navigator.clipboard.writeText(inputField.value)
                .then(() => {
                    copyButton.style.backgroundColor = '#0fad03';
                    copyButton.textContent = 'Copied!';
                })
                .catch(() => {
                    copyButton.style.backgroundColor = '#e74c3c';
                    copyButton.textContent = 'Copy Failed!';
                })
                .finally(() => setTimeout(() => {
                    copyButton.style.backgroundColor = '#2ecc71';
                    copyButton.textContent = 'Copy to Clipboard';
                }, 1000));
        } else {
            copyButton.style.backgroundColor = '#e74c3c';
            copyButton.textContent = 'Nothing to Copy!';
            setTimeout(() => {
                copyButton.style.backgroundColor = '#2ecc71';
                copyButton.textContent = 'Copy to Clipboard';
            }, 1000);
        }
    });
})();