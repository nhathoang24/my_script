// ==UserScript==
// @name         Encode/Decode Base64 or Hex with Copy Option
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Encode or decode Base64 or Hex strings and copy to clipboard
// @author       abcd
// @match        *://voz.vn/*
// @match        *://vn-z.vn/*
// @icon         https://data.voz.vn/styles/next/xenforo/smilies/popopo/sexy_girl.png?v=01
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Add CSS styles
    GM_addStyle(`
        :root {
            --overlay-bg: rgba(0, 0, 0, 0.6);
            --overlay-color: #fff;
            --font-color: #333;
            --close-color: #f44336;
            --button-bg: #007bff;
            --button-active-bg: #0056b3;
            --copy-bg: #28a745;
            --copy-active-bg: #195427;
            --clear-bg: #dc3545;
            --clear-active-bg: #c82333;
            --shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            --transition: 0.3s ease;
        }

        .my-overlay-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--overlay-bg);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            max-height: 800px;
            overflow: auto;
        }

        .my-overlay {
            background: var(--overlay-color);
            padding: 20px;
            border-radius: 8px;
            width: 100%;
            max-width: 600px;
            position: relative;
            box-shadow: var(--shadow);
            transition: var(--transition);
        }

        .my-overlay-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            position: relative;
        }

        .my-overlay-title-text {
            font-size: 24px;
            font-weight: 600;
            color: var(--font-color);
        }

        .my-overlay-titleCloser {
            font-size: 30px;
            cursor: pointer;
            color: var(--close-color);
            transition: var(--transition);
        }

        .my-overlay-titleCloser:hover {
            color: #d32f2f;
        }

        .my-overlay-content {
            display: flex;
            flex-direction: column;
        }

        .my-overlay-content label {
            margin-bottom: 5px;
            font-weight: bold;
        }

        .my-overlay-content select,
        .my-overlay-content textarea {
            width: 100%;
            margin-bottom: 15px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-sizing: border-box;
        }

        .my-overlay-content textarea {
            height: 100px;
            font-size: 14px;
            line-height: 1.4;
            resize: vertical;
        }

        .my-button-container {
            display: flex;
            gap: 15px;
        }

        .my-button-container button {
            padding: 12px 20px;
            font-size: 14px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            flex: 1;
            transition: background-color var(--transition), box-shadow var(--transition);
            box-shadow: var(--shadow);
        }

        #actionButton {
            background-color: var(--button-bg);
            color: #fff;
        }

        #actionButton:hover {
            background-color: var(--button-active-bg);
        }

        #actionButton:active {
            background-color: var(--button-active-bg);
        }

        #copyButton {
            background-color: var(--copy-bg);
            color: #fff;
        }

        #copyButton:hover {
            background-color: #218838;
        }

        #copyButton:active {
            background-color: var(--copy-active-bg);
        }

        #copyButton.flash {
            animation: flash 1s;
            background-color: var(--copy-bg);
        }

        @keyframes flash {
            0% { background-color: var(--copy-bg); }
            100% { background-color: var(--copy-active-bg); }
        }

        .custom-popup-link {
            position: fixed;
            width: 50px;
            height: 50px;
            background-image: url('https://data.voz.vn/styles/next/xenforo/smilies/popopo/sexy_girl.png?v=01');
            background-size: cover;
            background-position: center;
            border: none;
            cursor: pointer;
            z-index: 10000;
            user-select: none;
            background-color: transparent; /* Ensure the button is transparent */
            transition: background-color var(--transition), background-image var(--transition);
        }

        .custom-popup-link:hover,
        .custom-popup-link:active {
            background-color: rgba(0, 0, 0, 0.0); /* Slightly visible background color */
            background-image: url('https://data.voz.vn/styles/next/xenforo/smilies/popopo/sexy_girl.png?v=01'); /* Keep the icon visible */
        }

    `);

    const createToggleButton = () => {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'p-navgroup-link custom-popup-link';
        document.body.appendChild(toggleButton);

        // Load saved position
        const savedPosition = JSON.parse(localStorage.getItem('toggleButtonPosition')) || { top: 10, left: 10 };
        toggleButton.style.top = `${savedPosition.top}px`;
        toggleButton.style.left = `${savedPosition.left}px`;

        const makeDraggable = (element) => {
            let offsetX, offsetY, startX, startY, isDragging = false;

            element.addEventListener('mousedown', (e) => {
                if (e.button === 0) {
                    offsetX = e.clientX - element.getBoundingClientRect().left;
                    offsetY = e.clientY - element.getBoundingClientRect().top;
                    startX = e.clientX;
                    startY = e.clientY;
                    isDragging = false;
                    document.addEventListener('mousemove', moveElement);
                    document.addEventListener('mouseup', stopDragging);
                }
            });

            const moveElement = (e) => {
                if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
                    isDragging = true;
                    const newX = e.clientX - offsetX;
                    const newY = e.clientY - offsetY;
                    element.style.left = `${newX}px`;
                    element.style.top = `${newY}px`;
                }
            };

            const stopDragging = (e) => {
                if (isDragging) {
                    isDragging = false;
                    localStorage.setItem('toggleButtonPosition', JSON.stringify({
                        top: parseInt(element.style.top, 10),
                        left: parseInt(element.style.left, 10)
                    }));
                } else if (e.button === 0) {
                    toggleOverlay();
                }
                document.removeEventListener('mousemove', moveElement);
                document.removeEventListener('mouseup', stopDragging);
            };
        };

        const toggleOverlay = () => {
            const overlayContainer = document.querySelector('.my-overlay-container');
            if (overlayContainer) {
                overlayContainer.style.display = (overlayContainer.style.display === 'none') ? 'flex' : 'none';
            } else {
                createOverlay();
                document.querySelector('.my-overlay-container').style.display = 'flex';
            }
        };

        makeDraggable(toggleButton);
    };

    const createOverlay = () => {
        const overlayContainer = document.createElement('div');
        overlayContainer.className = 'my-overlay-container';
        overlayContainer.innerHTML = `
            <div class="my-overlay">
                <div class="my-overlay-title">
                    <span class="my-overlay-title-text">Encode/Decode Input</span>
                    <a class="my-overlay-titleCloser" role="button" aria-label="Close">×</a>
                </div>
                <div class="my-overlay-content">
                    <label for="operationType">Select Operation:</label>
                    <select id="operationType">
                        <option value="decode">Decode</option>
                        <option value="encode">Encode</option>
                    </select>
                    <label for="decodeType">Select Type:</label>
                    <select id="decodeType">
                        <option value="hex">Hex</option>
                        <option value="base64">Base64</option>
                        <option value="url">URL</option>
                    </select>
                    <textarea id="inputString" placeholder="Enter text here..."></textarea>
                    <textarea id="resultOutput" readonly placeholder="Result will be displayed here..."></textarea>
                    <div class="my-button-container">
                        <button id="actionButton">Decode/Encode</button>
                        <button id="copyButton">Copy to Clipboard</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlayContainer);

        document.querySelector('.my-overlay-titleCloser').addEventListener('click', () => {
            overlayContainer.style.display = 'none';
        });

        function encodeHex(inputString) {
            let hexString = '';
            for (let i = 0; i < inputString.length; i++) {
                hexString += ('0' + inputString.charCodeAt(i).toString(16)).slice(-2);
            }
            return hexString.toUpperCase();
        }


        function decodeHex(hexString) {
            hexString = hexString.replace(/\s+/g, '');
            if (!/^[0-9A-Fa-f]+$/.test(hexString)) return hexString; // Kiểm tra tính hợp lệ của chuỗi hex
            let decodedString = '';
            try {
                for (let i = 0; i < hexString.length; i += 2) {
                    decodedString += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
                }
                return decodedString;
            } catch {
                return hexString;
            }
        }

        function decodeBase64(base64String) {
            if (!/^[A-Za-z0-9+/=]+$/.test(base64String)) return base64String; // Kiểm tra tính hợp lệ của chuỗi base64
            try {
                return atob(base64String);
            } catch {
                return base64String;
            }
        }

        function encodeBase64(inputString) {
            try {
                return btoa(inputString);
            } catch {
                return inputString;
            }
        }

        document.getElementById('actionButton').addEventListener('click', () => {
            const operation = document.getElementById('operationType').value;
            const type = document.getElementById('decodeType').value;
            const input = document.getElementById('inputString').value.trim();
            const outputElement = document.getElementById('resultOutput');

            // Kiểm tra chuỗi đầu vào
            if (input.length === 0) {
                alert('Vui lòng nhập chuỗi để thực hiện thao tác.');
                return;
            }

            let result;

            try {
                if (type === 'base64') {
                    if (operation === 'decode') {
                        result = decodeBase64(input);
                        if (result === input) {
                            alert('Chuỗi base64 không hợp lệ.');
                            return;
                        }
                    } else {
                        result = encodeBase64(input);
                    }
                } else if (type === 'hex') {
                    if (operation === 'decode') {
                        if (!/^[a-fA-F0-9]+$/.test(input) || input.length % 2 !== 0) {
                            alert('Chuỗi hex không hợp lệ.');
                            return;
                        }
                        result = decodeHex(input);
                    } else {
                        result = encodeHex(input);
                    }
                } else if (type === 'url') {
                    try {
                        result = operation === 'decode' ? decodeURIComponent(input) : encodeURIComponent(input);
                    } catch (error) {
                        alert('Chuỗi URL không hợp lệ.');
                        return;
                    }
                }

                outputElement.value = result;
            } catch (error) {
                alert('Đã xảy ra lỗi trong quá trình thực hiện thao tác.');
            }
        });

        document.getElementById('copyButton').addEventListener('click', () => {
            const resultOutput = document.getElementById('resultOutput');
            navigator.clipboard.writeText(resultOutput.value).then(() => {
                // Thay đổi màu của nút khi sao chép thành công
                document.getElementById('copyButton').classList.add('flash');
                setTimeout(() => document.getElementById('copyButton').classList.remove('flash'), 1000);
            }).catch(err => {
                alert('Lỗi khi sao chép vào clipboard.');
            });
        });

    };

    const showMessage = (message, type) => {
        alert(message);
    };

    createToggleButton();
})();