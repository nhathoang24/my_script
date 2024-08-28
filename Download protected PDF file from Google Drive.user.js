// ==UserScript==
// @name         Download protected PDF file from Google Drive
// @namespace    Download protected PDF file
// @description  You can download protected PDF file
// @version      1.1
// @match        https://drive.google.com/*
// @grant        GM_registerMenuCommand
// @require      https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js
// ==/UserScript==
(function() {
    'use strict';

    function rescale(origWidth, origHeight, targetWidth, targetHeight) {
        let scaleFactor = Math.min(targetWidth / origWidth, targetHeight / origHeight);
        return [origWidth * scaleFactor, origHeight * scaleFactor];
    }

    function imageToBase64Async(img) {
        return new Promise((resolve, reject) => {
            try {
                let canvas = document.createElement("canvas");
                let context = canvas.getContext("2d");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
                resolve(canvas.toDataURL("image/jpeg", 1)); // Adjust quality as needed
            } catch (e) {
                reject(e);
            }
        });
    }

    async function downloadPDF() {
        try {
            const jsPDF = window.jspdf.jsPDF;
            const pdf = new jsPDF();
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const elements = Array.from(document.getElementsByTagName("img"))
                .filter(img => /^blob:/.test(img.src));

            let pageAdded = false;

            for (let img of elements) {
                const imgData = await imageToBase64Async(img);
                const [newWidth, newHeight] = rescale(img.naturalWidth, img.naturalHeight, pdfWidth, pdfHeight);

                if (pageAdded) pdf.addPage();
                pdf.addImage(imgData, "JPEG", 0, 0, newWidth, newHeight);
                pageAdded = true;
            }

            if (pdf.internal.getNumberOfPages() === 1) {
                pdf.deletePage(1); // Remove the last blank page
            }

            pdf.save("download.pdf");
        } catch (e) {
            console.error("Error creating PDF:", e);
        }
    }

    GM_registerMenuCommand("Download PDF file", downloadPDF, "d");
})();
