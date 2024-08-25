  // ==UserScript==
  // @name         Encode/Decode Base64 or Hex with Copy Option
  // @namespace    http://tampermonkey.net/
  // @version      1.7
  // @description  Encode or decode Base64 or Hex strings and copy to clipboard
  // @author       itisme
  // @include      https://*
  // @include      http://*
  // @icon         https://data.voz.vn/styles/next/xenforo/smilies/popopo/sexy_girl.png?v=01
  // @license      GPL-3.0
  // @grant        GM_addStyle
  // ==/UserScript==
  (function() {
    'use strict';
    GM_addStyle(`
           :root {
              --overlay-bg: rgba(0, 0, 0, 0.6);
              --overlay-color: #fff;
              --font-color: #333;
              --close-color: #f44336;
              --close-hover-color: #d32f2f;
              --button-bg: #007bff;
              --button-active-bg: #0056b3;
              --copy-bg: #28a745;
              --copy-active-bg: #195427;
              --copy-hover-bg: #218838;
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
              max-height: vh;
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
              color: var(--close-hover-color);
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

          #actionButton:hover,
          #actionButton:active {
              background-color: var(--button-active-bg);
          }

          #copyButton {
              background-color: var(--copy-bg);
              color: #fff;
          }

          #copyButton:hover {
              background-color: var(--copy-hover-bg);
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
              position: fixed;  /* Đảm bảo nút luôn nằm cố định trên màn hình */
              width: 40px;
              height: 40px;
              background-image: url('https://data.voz.vn/styles/next/xenforo/smilies/popopo/sexy_girl.png?v=01');
              background-size: cover;
              background-position: center;
              border: none;
              cursor: pointer;
              z-index: 10000;
              user-select: none;
              background-color: transparent; /* Đảm bảo nút không có màu nền */
          }
      `);
    const createToggleButton = () => {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'custom-popup-link';
        document.body.appendChild(toggleButton);
        // Load saved position
        const savedPosition = JSON.parse(localStorage.getItem('toggleButtonPosition')) || {
            top: 680,
            left: 1460
        };
        Object.assign(toggleButton.style, {
            top: `${savedPosition.top}px`,
            left: `${savedPosition.left}px`
        });
        makeDraggable(toggleButton);
    };
    const makeDraggable = (element) => {
        if(!element) return console.error('Phần tử không tồn tại.');
        let offsetX, offsetY, startX, startY, isDragging = false;
        const moveElement = (e) => {
            if(!isDragging && (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5)) {
                isDragging = true;
            }
            if(isDragging) {
                Object.assign(element.style, {
                    left: `${e.clientX - offsetX}px`,
                    top: `${e.clientY - offsetY}px`
                });
            }
        };
        const stopDragging = (e) => {
            if(isDragging) {
                localStorage.setItem('toggleButtonPosition', JSON.stringify({
                    top: parseInt(element.style.top, 10),
                    left: parseInt(element.style.left, 10)
                }));
            } else if(e.button === 0) {
                toggleOverlay();
            }
            document.removeEventListener('mousemove', moveElement);
            document.removeEventListener('mouseup', stopDragging);
            isDragging = false;
        };
        element.addEventListener('mousedown', (e) => {
            if(e.button !== 0) return;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            startX = e.clientX;
            startY = e.clientY;
            document.addEventListener('mousemove', moveElement);
            document.addEventListener('mouseup', stopDragging);
        });
    };
    const toggleOverlay = () => {
        const overlayContainer = document.querySelector('.my-overlay-container');
        if(overlayContainer) {
            overlayContainer.style.display = (overlayContainer.style.display === 'none') ? 'flex' : 'none';
        } else if(typeof createOverlay === 'function') {
            createOverlay();
            const newOverlayContainer = document.querySelector('.my-overlay-container');
            if(newOverlayContainer) {
                newOverlayContainer.style.display = 'flex';
            } else {
                console.error('Không thể tìm thấy phần tử .my-overlay-container sau khi tạo.');
            }
        } else {
            console.error('Hàm createOverlay không tồn tại.');
        }
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
                      <label>Select Operation:</label>
                      <select id="operationType">
                          <option value="decode">Decode</option>
                          <option value="encode">Encode</option>
                      </select>
                      <label>Select Type:</label>
                      <select id="decodeType">
                          <option value="hex">Hex</option>
                          <option value="base64">Base64</option>
                          <option value="url">URL</option>
                      </select>
                      <textarea id="inputString" placeholder="Enter text..."></textarea>
                      <textarea id="resultOutput" readonly placeholder="Result..."></textarea>
                      <div class="my-button-container">
                          <button id="actionButton">Decode/Encode</button>
                          <button id="copyButton">Copy</button>
                      </div>
                  </div>
              </div>
          `;
        document.body.appendChild(overlayContainer);
        const closeButton = document.querySelector('.my-overlay-titleCloser');
        closeButton.addEventListener('click', () => {
            overlayContainer.style.display = 'none';
            document.getElementById('inputString').value = '';
            document.getElementById('resultOutput').value = '';
            document.getElementById('operationType').value = "decode";
            document.getElementById('decodeType').value = "hex";
        });
        const encodeHex = s => Array.from(s, c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ').toUpperCase();
        const decodeHex = h => {
            const cleanedHex = h.replace(/\s+/g, '');
            return /^[a-fA-F0-9]+$/.test(cleanedHex) ? cleanedHex.match(/../g).map(b => String.fromCharCode(parseInt(b, 16))).join('') : h;
        };
        const decodeBase64 = b => /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(b) ? atob(b) : b;
        const encodeBase64 = b => btoa(b);
        document.getElementById('actionButton').addEventListener('click', () => {
            const op = document.getElementById('operationType').value;
            const type = document.getElementById('decodeType').value;
            const input = document.getElementById('inputString').value.trim();
            if(!input) return alert('Vui lòng nhập chuỗi.');
            try {
                const result = (type === 'base64') ? (op === 'decode' ? decodeBase64(input) : encodeBase64(input)) : (type === 'hex') ? (op === 'decode' ? decodeHex(input) : encodeHex(input)) : (op === 'decode' ? decodeURIComponent(input) : encodeURIComponent(input));
                if(result === input) throw new Error('Invalid input');
                document.getElementById('resultOutput').value = result;
            } catch {
                alert('Lỗi: Chuỗi không hợp lệ.');
            }
        });
        document.getElementById('copyButton').addEventListener('click', async () => {
            const resultOutput = document.getElementById('resultOutput');
            const textToCopy = resultOutput.value.trim();
            if(!textToCopy) {
                alert('Không có gì để sao chép!');
                return;
            }
            try {
                await navigator.clipboard.writeText(textToCopy);
                alert('Đã sao chép vào clipboard!');
                const copyButton = document.getElementById('copyButton');
                copyButton.classList.add('flash');
                setTimeout(() => copyButton.classList.remove('flash'), 1000);
            } catch (err) {
                console.error('Error copying to clipboard:', err);
                alert('Lỗi khi sao chép vào clipboard.');
            }
        });
    };
    createToggleButton();
  })();