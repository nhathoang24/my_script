// ==UserScript==
// @name         Delorean V3 UserScript | Admaven, LootLabs & Linkvertis* Killer
// @namespace    Delorean
// @version      3.9.1
// @description  Bypass AdLinks and various executors.
// @run-at       document-body
// @license      MIT
// @homepageURL  https://discord.gg/Ah8hQwvMYh
// @supportURL   https://discord.gg/Ah8hQwvMYh
// @icon         https://dlr.kys.gay/mysaves/dlr_logo_old.png
// @match        https://dlr.kys.gay/bypass*

// @match        *://linkvertis*.com/*

// @match        *://mboost.me/*
// @match        *://work.ink/*/*
// @match        *://workink.net/*/*
// @match        *://r.work.ink/*/*
// @match        *://flux.li/android/external/start.php?HWID=*
// @match        *://gateway.platoboost.com/*
// @match        *://keyrblx.com/getkey/*
// @match        *://keysystem-gateway.btteam.net/?hwid=*
// @match        *://loot-link.com/s?*
// @match        *://loot-links.com/s?*
// @match        *://ebaticalfel.com/s?*
// @match        *://onepiecered.co/s?*
// @match        *://lootlink.org/s?*
// @match        *://lootlinks.co/s?*
// @match        *://lootdest.info/s?*
// @match        *://lootdest.org/s?*
// @match        *://lootdest.com/s?*
// @match        *://links-loot.com/s?*
// @match        *://linksloot.net/s?*
// @match        *://mega-guy.com/s?*
// @match        *://ofpacksmega.com/s?*
// @match        *://depravityweb.co/s?*
// @match        *://secretpack-links.com/s?*
// @match        *://secret-links.com/s?*
// @match        *://tavernleaks.com/s?*
// @match        *://free-leaks.com/s?*
// @match        *://hotstars-leaks.com/s?*
// @match        *://thepremium.online/s?*
// @match        *://admiregirls-byme.com/s?*
// @match        *://all-fans.online/s?*
// @match        *://pnp-drops.me/s?*
// @match        *://megadropz.com/s?*
// @match        *://goldmega.online/s?*
// @match        *://badgirlsdrop.com/s?*
// @match        *://rareofhub.com/s?*
// @match        *://only-fun.xyz/s?*
// @match        *://megadumpz.com/s?*
// @match        *://leakutopia.site/s?*
// @match        *://xprmpacks.com/s?*
// @match        *://onlymega.co/s?*
// @match        *://tomxcontent.com/s?*
// @match        *://newsociety0.co/s?*
// @match        *://cemendemons.com/s?*
// @match        *://fansmega.com/s?*
// @match        *://premiumstashdrop.com/s?*
// @match        *://paster.so/*
// @match        *://*.*/s?*
// @connect      https://dlr.kys.gay/bypass/
// @connect      https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css
// @connect      https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource     NOTYF_CSS https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css
// @require      https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js
// @author       iWoozy_real
// @description  Provides functionality to bypass AdLinks and various executors.
// @downloadURL https://update.greasyfork.org/scripts/499257/Delorean%20V3%20UserScript%20%7C%20Admaven%2C%20LootLabs%20%20Linkvertis%2A%20Killer.user.js
// @updateURL https://update.greasyfork.org/scripts/499257/Delorean%20V3%20UserScript%20%7C%20Admaven%2C%20LootLabs%20%20Linkvertis%2A%20Killer.meta.js
// ==/UserScript==

if (document.title === 'Just a moment...') return;
if (document.title.includes("Just a second...")) {return;}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const notyf = createNotyf();
function createNotyf() {
    GM_addStyle(GM_getResourceText("NOTYF_CSS"));
    return new Notyf({
        duration: 5000,
        position: { x: 'right', y: 'top' }
    });
}

const notify = (type, text) => {
    try {
        notyf[type](text);
    } catch {
        console.log(text);
    }
};


async function checkEndpoints() {
    return "https://dlr.kys.gay/"
}

async function getTurnstileResponse() {
    notify('success', 'Please solve the captcha');
    const intervalId = setInterval(() => notify('success', 'Please solve the captcha'), 5000);
    let response;

    while (!(response = turnstile.getResponse())) await wait(1000);

    clearInterval(intervalId);
    return response;
}

function adSpoof(link, referrer) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: link,
            anonymous: true,
            headers: {
                "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; GO3C Build/OPM2.171019.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/88.0.4324.141 Mobile Safari/537.36",
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-encoding": "gzip, deflate, br",
                "accept-language": "en-US,en;q=0.9",
                "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": "\"Android\"",
                "referrer": referrer,
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1"
            },
            onload: () => {
                window.location.href = link;
                const linkElement = document.createElement('a');
                linkElement.href = link;
                linkElement.textContent = 'Bypass result';
                document.body.appendChild(linkElement);
                linkElement.click();
            },
            onerror: reject
        });
    });
}

async function lvBotBypass() {
    const checkInterval = setInterval(() => {
        if (document.body.innerHTML.includes(" More from Linkverti") && document.body.innerHTML.includes(" Views ")) {
            clearInterval(checkInterval);
            try {
                const primaryButton = document.querySelector('.lv-lib-button--primary');
                if (primaryButton) {
                    primaryButton.click();
                } else {
                    throw new Error("Primary button not found");
                }
            } catch (error) {
                notify("error", "[BOTMODE]: Failed to click the primary button");
            }

            setTimeout(() => {
                setInterval(() => {
                    document.querySelectorAll('div').forEach(div => {
                        if (div.textContent.toLowerCase().includes('skip')) div.click();
                    });
                }, 100);

                const secondaryButtonInterval = setInterval(async () => {
                    const secondaryButton = document.querySelector(".lv-lib-button--secondary");
                    if (secondaryButton && !document.body.innerHTML.includes("Get Access in ")) {
                        secondaryButton.textContent = "Unlocked by https://dlr.kys.gay";
                        Object.assign(secondaryButton.style, {
                            position: "fixed",
                            top: "0",
                            left: "0",
                            width: "100%",
                            height: "100%",
                            zIndex: "9999",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.5em",
                            backgroundColor: "#28a745",
                            color: "#fff",
                            border: "none",
                            textAlign: "center"
                        });
                        const additionalText = document.createElement("div");
                        additionalText.textContent = "Delorean's Bypasser ON TOP";
                        Object.assign(additionalText.style, {
                            marginTop: "20px",
                            fontSize: "1em",
                            color: "#fff"
                        });

                        secondaryButton.appendChild(additionalText);
                        clearInterval(secondaryButtonInterval);
                        await wait(500);
                        secondaryButton.click();
                        setTimeout(() => window.location.href = "https://dlr.kys.gay", 5000);
                    }
                }, 1000);
            }, 2000);
        }
    }, 100);
}

async function ClientSide() {
    const endpoint = await checkEndpoints();
    if (!endpoint) {
        notify('error', "All of Delorean's Bypasser network is offline. Please use our Discord server to bypass your link");
        window.open("https://discord.com/invite/Ah8hQwvMYh")
        await wait(9e9);
        return;
    }

    let info = "Client-Side Bypassing, please wait...";
    if (location.href.includes("work.ink") || location.href.includes("linkvert") || location.href.includes("/s?") || location.href.includes("https://paster.so/")) {
        setInterval(() => document.body.innerHTML = info, 100);

        const r = new URL(window.location.href).searchParams.get("r");
        if (r) {
            const decoded = atob(r);
            info = "Client-side bypass success! Please wait while we redirect you...";
            await wait(4000);
            adSpoof(decoded, window.location.href);
            return;
        }

        const apiUrl = `${endpoint}api/free/bypass`;
        const urlParam = encodeURIComponent(window.location.href);

        for (let retryCount = 0; retryCount < 100; retryCount++) {
            try {
                const response = await fetch(`${apiUrl}?url=${urlParam}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.result.startsWith("http")) {
                        info = "Client-side bypass success! Please wait while we redirect you...";
                        if (!location.href.includes("linkverti")){
                          await wait(2000);
                        }else{
                          info = "Client-side bypass success! Please wait while we redirect you (Waiting 10s to avoid detections)...";
                          if (data.result.includes("hash=")){
                            await wait(1);
                          }else{
                            await wait(10000)
                          }
                        }
                        adSpoof(data.result, window.location.href);
                        return;
                    }

                    if (data.result.includes("bypass fail")) {
                        info = "Bypass fail! Error bypassing your link: " + data.result;
						window.stop()
                        await wait(9e9);
                        return;
                    }

                    info = "Bypassed! Result copied to clipboard!";
                    GM_setClipboard(data.result);
					window.stop()
                    await wait(9e9);
                    return;
                }

                info = response.status === 500
                    ? "The API is being rate-limited by Cloudflare. Please use our Discord bot to bypass this link."
                    : `Error while getting the API result, error code: ${response.status}. Retrying... (${retryCount}/100)`;
            } catch {
                console.error('Error while fetching data.');
            }
        }

        info = "Exceeded maximum retries. Unable to fetch data. Please use our Discord bot to bypass this link.";
        await wait(9e9);
    }
}

async function bypass() {
    if (location.href.includes("https://dlr.kys.gay/bypass")) {
        const tobyp = new URL(window.location.href).searchParams.get('DeloreanOnTop');
        if (!tobyp) return;

        await wait(2000);
        document.getElementById("urlInput").value = tobyp; // Set bypass URL to the textbox
        await getTurnstileResponse(); // Wait for turnstile response
        await wait(1000);
        document.getElementById("elpapu").click(); // Click the button

        async function getBypass() {
            const textarea = document.getElementById("resultTextbox");
            if (textarea.value) {
                try {
                    const resultUrl = new URL(textarea.value);
                    notify('success', "Bypassed! Please wait while we redirect you...");
                    await wait(4000);
                    adSpoof(textarea.value, resultUrl.hostname);
                } catch {
                    if (textarea.value.includes("bypass fail!")) {
                        notify('error', "Error bypassing. Result: " + textarea.value);
                    } else {
                        notify('success', "Bypassed! Result copied to clipboard!");
                        GM_setClipboard(textarea.value);
                    }
                }
            } else {
                setTimeout(getBypass, 1000);
            }
        }
        getBypass();
    } else {
        await ClientSide();
        notify('error', "Client-side bypass failed! Redirecting to our bypass website...");
        if (!await checkEndpoints()) {
            notify('error', "All of Delorean's Bypasser network is offline. Please use our Discord server to bypass your link");
            window.open("https://discord.com/invite/Ah8hQwvMYh")
            await wait(9e9);
        }
        await wait(6000);
        const linkElement = document.createElement('a');
        linkElement.href = `https://dlr.kys.gay/bypass/?DeloreanOnTop=${encodeURIComponent(window.location.href)}`;
        linkElement.textContent = 'Bypass result';
        document.body.appendChild(linkElement);
        linkElement.click();
    }
}

notify('success', "Delorean's Bypasser Userscript LOADED!");
bypass();

