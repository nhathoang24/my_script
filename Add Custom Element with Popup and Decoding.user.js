// ==UserScript==
// @name         Add Custom Element with Popup and Decoding
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Adds a custom link for encoding/decoding Hex/Base64 with popup and copying functionality
// @author       You
// @match        *://voz.vn/t/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
    const hexRegex = /\b[a-fA-F0-9]{2}(?:\s+[a-fA-F0-9]{2})*\b|\b[a-fA-F0-9]+\b/;

    const decodeBase64 = str => {
        try {
            return atob(str);
        } catch {
            return 'Invalid Base64 string.';
        }
    };

    const decodeHex = str => {
        try {
            return String.fromCharCode(...str.replace(/\s+/g, '').match(/.{2}/g).map(byte => parseInt(byte, 16)));
        } catch {
            return 'Invalid Hex string.';
        }
    };

    const encodeBase64 = str => {
        try {
            return btoa(str);
        } catch {
            return 'Encoding to Base64 failed.';
        }
    };

    const encodeHex = str => {
        try {
            return Array.from(str).map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
        } catch {
            return 'Encoding to Hex failed.';
        }
    };

    const copyToClipboard = text => {
        navigator.clipboard.writeText(text).catch(err => alert('Failed to copy to clipboard: ' + err));
    };

    const openPopup = () => {
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
                        <option value="base64">Base64</option>
                        <option value="hex">Hex</option>
                        <option value="url">URL</option>
                    </select>
                    <textarea id="inputString" placeholder="Enter text here..."></textarea>
                    <textarea id="resultOutput" readonly placeholder="Result will be displayed here..."></textarea>
                    <div class="my-button-container">
                        <button id="actionButton">Decode/Encode</button>
                        <button id="copyButton">Copy to Clipboard</button>
                        <button id="clearHistoryButton">Clear All History</button>
                    </div>
                    <div class="my-history-container" id="historyDropdown"></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlayContainer);

        const elements = {
            closeButton: overlayContainer.querySelector('.my-overlay-titleCloser'),
            actionButton: overlayContainer.querySelector('#actionButton'),
            copyButton: overlayContainer.querySelector('#copyButton'),
            clearHistoryButton: overlayContainer.querySelector('#clearHistoryButton'),
            inputString: overlayContainer.querySelector('#inputString'),
            resultOutput: overlayContainer.querySelector('#resultOutput'),
            decodeTypeSelect: overlayContainer.querySelector('#decodeType'),
            operationTypeSelect: overlayContainer.querySelector('#operationType'),
            historyDropdown: overlayContainer.querySelector('#historyDropdown')
        };

        const MAX_HISTORY_ITEMS = 10;

        const handleAction = () => {
            const input = elements.inputString.value.trim();
            const type = elements.decodeTypeSelect.value;
            const operation = elements.operationTypeSelect.value;

            let result;
            if (operation === 'decode') {
                result = type === 'base64' ? (base64Regex.test(input) ? decodeBase64(input) : 'Invalid Base64 string.') :
                    type === 'hex' ? (hexRegex.test(input) ? decodeHex(input) : 'Invalid Hex string.') :
                    type === 'url' ? decodeURIComponent(input) : 'Invalid URL string.';
            } else {
                result = type === 'base64' ? encodeBase64(input) :
                    type === 'hex' ? encodeHex(input) :
                    type === 'url' ? encodeURIComponent(input) : '';
            }

            elements.resultOutput.value = result;
            elements.copyButton.style.display = result && !result.includes('Invalid') ? 'inline-block' : 'none';

            if (!result.includes('Invalid')) {
                const historyItems = JSON.parse(localStorage.getItem('history')) || [];
                historyItems.push({
                    date: new Date().toLocaleString('vi-VN', {
                        hour12: false
                    }),
                    result: result
                });

                // Giới hạn số lượng mục trong lịch sử
                if (historyItems.length > MAX_HISTORY_ITEMS) {
                    historyItems.shift(); // Xóa mục cũ nhất
                }

                localStorage.setItem('history', JSON.stringify(historyItems));
                updateHistory();
            }
        };

        const updateHistory = () => {
            const historyItems = JSON.parse(localStorage.getItem('history')) || [];
            const reversedHistory = historyItems.reverse(); // Đảo ngược thứ tự lịch sử để mục gần nhất lên đầu
            elements.historyDropdown.innerHTML = reversedHistory.map(item => `
                <div class="history-item" data-output="${item.result}">
                    <span class="history-date">${item.date}</span>
                    <span class="history-result">${item.result}</span>
                </div>
            `).join('');

            elements.historyDropdown.querySelectorAll('.history-item').forEach(item => {
                item.addEventListener('click', () => {
                    const result = item.getAttribute('data-output');
                    elements.resultOutput.value = result;
                    copyToClipboard(result);
                    elements.copyButton.textContent = 'Copied';
                    elements.copyButton.classList.add('copied');

                    // Thêm hiệu ứng nháy cho nút copied
                    elements.copyButton.classList.add('flash');
                    setTimeout(() => {
                        elements.copyButton.classList.remove('flash');
                        elements.copyButton.classList.remove('copied');
                        elements.copyButton.textContent = 'Copy to Clipboard';
                    }, 500);
                });
            });
        };


        elements.closeButton.addEventListener('click', () => document.body.removeChild(overlayContainer));
        elements.actionButton.addEventListener('click', handleAction);

        elements.copyButton.addEventListener('click', () => {
            if (elements.resultOutput.value && !elements.resultOutput.value.includes('Invalid')) {
                copyToClipboard(elements.resultOutput.value);
                elements.copyButton.textContent = 'Copied';
                elements.copyButton.classList.add('copied');
                elements.copyButton.classList.add('flash');
                setTimeout(() => {
                    elements.copyButton.classList.remove('flash');
                    elements.copyButton.classList.remove('copied');
                    elements.copyButton.textContent = 'Copy to Clipboard';
                }, 500);
            }
        });
        elements.clearHistoryButton.addEventListener('click', () => {
            localStorage.removeItem('history');
            updateHistory();
        });

        updateHistory();
    };

    const addCustomLink = () => {
        const container = document.querySelector('.p-navgroup.p-discovery');
        if (container) {
            const customLink = document.createElement('div');
            customLink.className = 'p-navgroup custom link';
            customLink.innerHTML = `
                <a class="p-navgroup-link p-navgroup-link--custom-popup-link" data-nav-id="customPopup">Show/Hide Decoder</a>
            `;
            customLink.querySelector('a').addEventListener('click', openPopup);
            container.parentElement.insertBefore(customLink, container.nextSibling);
        }
    };

    window.addEventListener('load', addCustomLink);

    GM_addStyle(`
    .my-overlay-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }
    .my-overlay {
        background: #e8e8e8;
        padding: 10px;
        border-radius: 10px;
        width: 100%;
        max-width: 600px;
        position: relative;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }
    .my-overlay-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
        margin-top: 5px;
    }
    .my-overlay-title-text {
        font-size: 26px;
        font-weight: bold;
        color: #080808;
        margin: 0 auto;
    }
    .my-overlay-titleCloser {
        font-size: 50px;
        cursor: pointer;
        color: #fc0303;
        margin-right: 10px;
        margin-top: -20px;
    }
    .my-overlay-content {
        display: flex;
        flex-direction: column;
    }
    .my-overlay-content textarea {
        width: 100%;
        height: 80px;
        margin-bottom: 10px;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }
    .my-button-container {
        display: flex;
        gap: 10px;
    }
    .my-button-container button {
        padding: 10px;
        font-size: 14px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        flex: 1; /* Nút chiếm đều không gian */
    }
    #actionButton {
        background-color: #007bff; /* Màu xanh cho Decode/Encode */
        color: #fff;
    }
    #actionButton:active {
        background-color: #003d80; /* Màu xanh đậm hơn khi nhấn */
    }
    #copyButton {
        background-color: #28a745; /* Màu xanh lá cho Copy to Clipboard */
        color: #fff;
    }
    #copyButton:active {
        background-color: #1f5c2d; /* Màu xanh lá đậm hơn khi nhấn */
    }
    #clearHistoryButton {
        background-color: #dc3545; /* Màu đỏ cho Clear All History */
        color: #fff;
    }
    #clearHistoryButton:active {
        background-color: #a71d2a; /* Màu đỏ đậm hơn khi nhấn */
    }
    #decodeType {
        margin-bottom: 10px;
    }
    #operationType {
        margin-bottom: 10px;
    }
    .my-history-container {
        margin-top: 10px;
        max-height: 135px; /* Giới hạn chiều cao của danh sách lịch sử */
        overflow-y: auto; /* Thêm thanh cuộn dọc nếu nội dung vượt quá chiều cao */
    }
    .history-item {
        cursor: pointer;
        margin-bottom: 5px;
        padding: 5px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #f9f9f9;
    }
    .history-date {
        font-weight: normal;
        color: #949494; /* Thay đổi màu chữ để làm mờ thời gian */
    }
    .history-result {
        font-weight: bold; /* Tô đậm chuỗi kết quả */
        color: #000; /* Đảm bảo màu chữ của chuỗi kết quả là đen */
    }
    #copyButton.flash {
        animation: flash 1s;
        background-color: #28a745; /* Màu xanh lá đậm khi nhấn */
    }
    @keyframes flash {
        0% { background-color: #28a745; }
        100% { background-color: #1f5c2d; } /* Màu xanh lá đậm hơn khi nhấn */
    }
    .p-navgroup-link--custom-popup-link {
        display: inline-block;
        padding: 10px 20px;
        background-color: #6f42c1 !important; /* Màu tím */
        color: #fff; /* Màu chữ trắng để nổi bật trên nền tím */
        text-decoration: none;
        border-radius: 5px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.3s, box-shadow 0.3s;
        font-weight: bold;
    }
    .p-navgroup-link--custom-popup-link:active {
        background-color: #4a269a !important; /* Màu tím đậm hơn khi nhấn */
    }
`);
})();