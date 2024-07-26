// ==UserScript==
// @name         Delorean V2 UserScript (NOT A REUPLOAD)
// @namespace    Delorean
// @version      3.0.1
// @description  Bypass AdLinks and executors like Work.ink, AdMaven, KeyRBLX, Pandadevelopment, BTTeam, Arceus X, Fluxus, etc.
// @run-at       document-body
// @license      MIT
// @homepageURL  https://discord.gg/Ah8hQwvMYh
// @supportURL   https://discord.gg/Ah8hQwvMYh
// @icon         https://dlr.kys.gay/mysaves/dlr_logo_old.png
// @match        https://dlr.kys.gay/bypass*


// @match        *://mboost.me/*
// @match        *://work.ink/*/*
// @match        *://workink.net/*/*
// @match        *://r.work.ink/*/*
// @match        *://flux.li/android/external/start.php?HWID=*
// @match        *://gateway.platoboost.com/*
// @match        *://spdmteam.com/key-system-1?hwid=*
// @match        *://trigonevo.com/*
// @match        *://*.pandadevelopment.*/getkey?*
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
// @description  Provides functionality to bypass AdLinks and various executors like Work.ink, AdMaven, KeyRBLX, Pandadevelopment, BTTeam, Arceus X, Fluxus, etc.
// @downloadURL https://update.greasyfork.org/scripts/499257/Delorean%20V2%20UserScript%20%28NOT%20A%20REUPLOAD%29.user.js
// @updateURL https://update.greasyfork.org/scripts/499257/Delorean%20V2%20UserScript%20%28NOT%20A%20REUPLOAD%29.meta.js
// ==/UserScript==

if (document.title === 'Just a moment...') { return; }

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createNotyf() {
  let notyfCss = GM_getResourceText("NOTYF_CSS");
  GM_addStyle(notyfCss);
  return new Notyf({ duration: 5000, position: { x: 'right', y: 'top' } });
}

const notyf = createNotyf();

function success(text) {
  try {
    notyf.success(text);
  } catch (error) {
    console.log(text);
  }
}

function error(text) {
  try {
    notyf.error({ message: text, icon: { className: 'fas fa-exclamation-circle', tagName: 'i', color: 'white' } });
  } catch (error) {
    console.log(text);
  }
}

async function getTurnstileResponse() {
  success('Please solve the captcha');
  let notif = setInterval(() => success('Please solve the captcha'), 5000);
  let res = '';

  while (true) {
    try {
      res = turnstile.getResponse();
      if (res) { break; }
    } catch (e) {
      // Handle errors or retries
    }
    await wait(1000);
  }

  clearInterval(notif);
  return res;
}

function adSpoof(link, tospoof) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: link,
      anonymous: true,
      headers: {
        "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; GO3C Build/OPM2.171019.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/88.0.4324.141 Mobile Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
        "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "referrer": tospoof,
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
      },
      onload: function (response) {
        window.location.href = link;
        var enlace = document.createElement('a');
        enlace.href = link;
        enlace.textContent = 'Bypass result';
        document.body.appendChild(enlace);
        enlace.click()

      },
      onerror: function (error) {
        console.log(error);
      }
    });
  });
}

async function lv_workink() {
  let info="Client-Side Bypassing, please wait..."
  if (location.hostname.includes("linkv") || location.hostname.includes("work.ink")) {
    setInterval(() => {
      document.body.innerHTML = info;
    }, 100);

    let r = new URL(window.location.href).searchParams.get("r");
    if (r) {
      const decoded = atob(r);
      info="Client-side bypass success! Please wait while we redirect you...";
      await wait(4000);
      adSpoof(decoded, window.location.href);
      return;
    } else {
      const apiUrl = 'https://dlr-backupapi.27x21zmd.workers.dev/api/deloreanv2/goatbypassersontop/free';
      const urlParam = encodeURIComponent(window.location.href);

      let retryCount = 0;
      const maxRetries = 100;

      while (retryCount < maxRetries) {
        try {
          const response = await fetch(`${apiUrl}?url=${urlParam}`);
          if (response.ok) {
            const data = await response.json();
            if (data.sucess && data.result && data.result.includes("http")) {
              info="Client-side bypass success! Please wait while we redirect you...";
              await wait(4000);
              var enlace = document.createElement('a');
              enlace.href = data.result;
              enlace.textContent = 'Bypass result';
              document.body.appendChild(enlace);
              enlace.click();
              return;
            } else {
              if (data.result.includes("bypass fail")){
                info="bypass fail! error bypassing your link : "+data.result
                await wait(9e9)
              }
              info="Bypassed! Result copied to clipboard!";
              GM_setClipboard(data.result); // Copy to clipboard
              await wait(9e9);
              return;
            }
          } else if (response.status === 429) {
            info="The api is getting Rate Limited by Cloudflare, please go to use our discord bot (https://discord.gg/U2GYWcW52S) to bypass this link"
          } else {
            info=`Error while getting the API result, error code : ${response.status} |-| Retrying... (Retrying ${retryCount}/${maxRetries}))`;
          }
        } catch (error) {
          console.error('Error al obtener los datos:', error);
        }

        retryCount++;
      }

      info=`Exceeded maximum retries (${maxRetries}). Unable to fetch data. |-| please go to use our discord bot (https://discord.gg/U2GYWcW52S) to bypass this link`;
      window.open("https://discord.gg/U2GYWcW52S")
      await wait(9e9);
    }
  }
}



async function bypass() {
  fetch('https://dlr-api.woozym.workers.dev/api/status') // Check API status
    .then(response => response.json())
    .then(data => {
      if (data.status === "OK") {
        success("API Status: " + data.status);
      } else {
        error("API is currently offline or overloaded. Official status: " + data.status);
      }
    });

  if (location.href.includes("https://dlr.kys.gay/bypass")) {
    let tobyp = new URL(window.location.href).searchParams.get('DeloreanOnTop');
    if (!tobyp) {
      return;
    }
    await wait(2000);
    document.getElementById("urlInput").value = tobyp; // Set bypass URL to the textbox
    let gg = await getTurnstileResponse(); // Wait for turnstile response
    await wait(1000);
    document.getElementById("elpapu").click(); // Click the button

    async function getBypass() {
      textarea = document.getElementById("resultTextbox");
      if (textarea.value) {
        try {
          let bpv = new URL(textarea.value); // Result to URL
          success("Bypassed! Please wait while we redirect you...");
          await wait(4000);
          adSpoof(textarea.value, bpv.hostname); // Redirect with referrer bypass
        } catch (error) {
          if (textarea.value.includes("bypass fail!")) {
            error("Error bypassing. Result: " + textarea.value); // Handle error return
            return;
          }
          success("Bypassed! Result copied to clipboard!");
          GM_setClipboard(textarea.value); // Copy to clipboard
        }
      } else {
        setTimeout(getBypass, 1000);
      }
    }
    getBypass(); // Wait for result
  } else {
    await lv_workink(); // Useless, this userscript does not support LV features (maybe)
    error("Client-side bypass failed! Please wait while we redirect you to our bypass website...");
    await wait(6000);
    var enlace = document.createElement('a');
    enlace.href = "https://dlr.kys.gay/bypass/?DeloreanOnTop=" + encodeURIComponent(window.location.href);;
    enlace.textContent = 'Bypass result';
    document.body.appendChild(enlace);
    enlace.click()
  }
}

bypass();
