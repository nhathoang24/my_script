// ==UserScript==
// @name        Reject Service Worker Auto
// @namespace   rejectserviceWorkerAuto
// @match       *://*/*
// @run-at      document-start
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @version     1.4
// @description 10/4/2023, 5:07:06 PM
// ==/UserScript==

(() => {
    const defaultvalue = 'none';
    const name = 'rejectserviceWorkerAuto';
    const prefix = "autoinject" + name;
    const valueKey = `value${name}${document.domain}`;
    let hostarray = JSON.parse(GM_getValue(prefix, "[]")) || [];
    let injectedStatus = false;

    function inject() {
        if (injectedStatus) return;

        if (navigator.serviceWorker) {
            navigator.serviceWorker.register = () => new Promise((_, rej) => rej("This method is not allowed!"));
            window.ServiceWorkerContainer.prototype.register = () => new Promise((_, rej) => rej("This method is not allowed! 2"));
        }

        injectedStatus = true;
    }

    function manageHost(add = true) {
        const index = hostarray.indexOf(location.hostname);
        if (add && index === -1) {
            hostarray.push(location.hostname);
        } else if (!add && index > -1) {
            hostarray.splice(index, 1);
        }
        GM_setValue(prefix, JSON.stringify(hostarray));
    }

    function set() {
        const val = parseInt(window.prompt(`Enter ${name} ${document.domain} value`, defaultvalue), 10);
        if (!isNaN(val)) {
            GM_setValue(valueKey, val);
        }
    }

    function adjustValue(delta) {
        let value = parseInt(GM_getValue(valueKey, defaultvalue), 10);
        if (!isNaN(value)) {
            GM_setValue(valueKey, value + delta);
        }
    }

    try {
        if (typeof GM_getValue(valueKey) === 'number') {
            GM_registerMenuCommand("+", () => adjustValue(1));
            GM_registerMenuCommand("-", () => adjustValue(-1));
        }

        if (hostarray.includes(location.hostname)) {
            GM_registerMenuCommand(`Inject ${name}`, inject);
            GM_registerMenuCommand(`Auto-Inject on ${location.hostname}`, () => manageHost(false));
        } else {
            inject();
            GM_registerMenuCommand(`Stop Auto-Injecting ${name}`, () => manageHost(true));
        }
    } catch (err) {
        console.error(`Error adding Inject menu items: ${name}`, err);
    }
})();