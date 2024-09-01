// ==UserScript==
// @name        Reject serviceWorker Auto
// @namespace   rejectserviceWorkerAuto
// @match       *://*/*
// @run-at      document-start
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @version     1.4
// @description Automatically rejects service workers on matched domains
// ==/UserScript==

(function() {
    const DEFAULT_VALUE = 'none';
    const SCRIPT_NAME = 'rejectserviceWorkerAuto';
    const PREFIX = `autoinject_${SCRIPT_NAME}`;
    const DOMAIN_KEY = `value_${SCRIPT_NAME}_${document.domain}`;
    const value = GM_getValue(DOMAIN_KEY, DEFAULT_VALUE);
    let injected = false;
    let hostArray = [];

    function inject() {
        if (injected || !navigator.serviceWorker) return;
        navigator.serviceWorker.register = () => Promise.reject("This method is not allowed!");
        injected = true;
        console.log('injected Reject serviceWorker Auto');
    }

    function addHost() {
        if (!hostArray.includes(location.hostname)) {
            hostArray.push(location.hostname);
            GM_setValue(PREFIX, JSON.stringify(hostArray));
            inject();
        }
    }

    function removeHost() {
        const index = hostArray.indexOf(location.hostname);
        if (index > -1) {
            hostArray.splice(index, 1);
            GM_setValue(PREFIX, JSON.stringify(hostArray));
        }
    }

    function setValue() {
        const newValue = parseInt(window.prompt(`Enter ${SCRIPT_NAME} value for ${document.domain}`, DEFAULT_VALUE), 10);
        if (!isNaN(newValue)) {
            GM_setValue(DOMAIN_KEY, newValue);
        }
    }

    function modifyValue(delta) {
        const currentValue = parseInt(GM_getValue(DOMAIN_KEY, DEFAULT_VALUE), 10);
        GM_setValue(DOMAIN_KEY, currentValue + delta);
    }

    try {
        hostArray = JSON.parse(GM_getValue(PREFIX, "[]"));
        if (typeof value === 'number') {
            GM_registerMenuCommand("+", () => modifyValue(1));
            GM_registerMenuCommand("-", () => modifyValue(-1));
        }

        if (hostArray.includes(location.hostname)) {
            GM_registerMenuCommand(`Inject ${SCRIPT_NAME}`, inject);
            GM_registerMenuCommand(`Stop Auto-Injecting on ${location.hostname}`, removeHost);
        } else {
            inject();
            GM_registerMenuCommand(`Auto-Inject on ${location.hostname}`, addHost);
        }
    } catch (err) {
        console.error(`Error initializing ${SCRIPT_NAME}:`, err);
    }
})();