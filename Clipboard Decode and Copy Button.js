// ==UserScript==
// @name         Clipboard Decode and Copy Button
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Nút kéo thả đọc và giải mã nội dung clipboard (hex/base64), sao chép kết quả và thông báo cho người dùng
// @author       Your Name
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    const button = document.createElement("button");
    button.innerHTML = "Decode";
    button.id = "myDecodeButton";
    document.body.appendChild(button);

    GM_addStyle(`
        #myDecodeButton {
            position: fixed;
            z-index: 10000;
            padding: 8px 12px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            width: 80px;
            height: 40px;
            box-sizing: border-box;
            background-color: #007BFF;
            color: white;
            text-align: center;
            right: 0;
            bottom: 0;
        }
        #myDecodeButton:hover {
            background-color: #0056b3;
        }
    `);

    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
    const hexRegex = /\b([0-9A-Fa-f]{2}\s*){4,}\b/;

    let isDragging = false;
    let initialX, initialY;

    // Đọc vị trí lưu trữ
    const savedPosition = GM_getValue('buttonPosition', null);
    if (savedPosition && savedPosition.right && savedPosition.bottom) {
        button.style.right = savedPosition.right;
        button.style.bottom = savedPosition.bottom;
    } else {
        // Vị trí mặc định nếu không có vị trí lưu trữ
        button.style.right = '0px';
        button.style.bottom = '0px';
    }

    button.addEventListener("mousedown", function(e) {
        initialX = e.clientX;
        initialY = e.clientY;
        isDragging = false;
    });

    button.addEventListener("mousemove", function(e) {
        if (!isDragging) {
            if (Math.abs(initialX - e.clientX) > 3 || Math.abs(initialY - e.clientY) > 3) {
                isDragging = true;
            }
        }
    });

    button.addEventListener("mouseup", function(e) {
        if (!isDragging) {
            readClipboard();
        }
    });

    function readClipboard() {
        navigator.clipboard.readText()
            .then(text => {
                text = text.trim();
                if (text.length === 0) {
                    alert("Vui lòng nhập chuỗi có độ dài lớn hơn 0");
                    return;
                }
                let decodedText;
                if (hexRegex.test(text)) {
                    decodedText = decodeHex(text);
                } else if (base64Regex.test(text)) {
                    decodedText = decodeBase64(text);
                } else {
                    alert("Không phải là Base64 hoặc Hex");
                    return;
                }
                navigator.clipboard.writeText(decodedText)
                    .then(() => showNotification("Đã sao chép: " + decodedText))
                    .catch(err => console.log("Lỗi khi sao chép: " + err));
                button.style.display = 'none';
            })
            .catch(err => console.log("Không thể đọc nội dung clipboard: " + err));
    }

    function showNotification(message) {
        if (Notification.permission === 'granted') {
            let notification = new Notification(message, {
                body: message,
                icon: 'https://via.placeholder.com/100'
            });
            setTimeout(() => {
                if (notification) {
                    notification.close();
                }
            }, 5000);
            notification.onclick = () => {
                notification.close();
            };
        } else if (Notification.permission === 'default') {
            // Yêu cầu quyền thông báo từ người dùng nếu chưa được cấp
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showNotification(message); // Gọi lại hàm nếu quyền được cấp
                } else {
                    alert(message);
                }
            });
        } else {
            alert(message);
        }
    }

    function decodeBase64(str) {
        try {
            if (typeof str !== 'string') throw new Error('Đầu vào không phải là chuỗi.');
            const decodedStr = atob(str.replace(/\s/g, ''));
            return /^[ -~]*$/.test(decodedStr) ? decodedStr : 'Lỗi khi giải mã Base64: Chuỗi giải mã chứa ký tự không hợp lệ.';
        } catch (err) {
            return "Lỗi khi giải mã Base64: " + err.message;
        }
    }

    function decodeHex(str) {
        try {
            const hex = str.replace(/\s+/g, '');
            if (hex.length % 2 !== 0) throw new Error('Độ dài chuỗi Hex không hợp lệ.');
            let result = '';
            for (let i = 0; i < hex.length; i += 2) {
                result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            }
            return result;
        } catch (err) {
            return "Lỗi khi giải mã Hex: " + err.message;
        }
    }

    dragElement(button);

    function dragElement(elmnt) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        elmnt.onmousedown = function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        };

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            elmnt.style.bottom = (parseInt(window.getComputedStyle(elmnt).bottom) + pos2) + "px";
            elmnt.style.right = (parseInt(window.getComputedStyle(elmnt).right) + pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;

            // Save position
            GM_setValue('buttonPosition', {
                bottom: elmnt.style.bottom,
                right: elmnt.style.right
            });
        }
    }

    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
})();