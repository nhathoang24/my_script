// ==UserScript==
// @name                YouTube: Force html5_exponential_memory_for_sticky
// @namespace           Violentmonkey Scripts
// @match               https://www.youtube.com/*
// @version             0.5.8
// @license             MIT
// @author              CY Fung
// @icon                https://raw.githubusercontent.com/cyfung1031/userscript-supports/main/icons/yt-engine.png
// @description         To prevent YouTube to change the video quality automatically during YouTube Live Streaming.
// @run-at              document-start
// @grant               none
// @unwrap
// @allFrames           true
// @inject-into         page
// @require             https://update.greasyfork.org/scripts/475632/1361351/ytConfigHacks.js
// @downloadURL https://update.greasyfork.org/scripts/471033/YouTube%3A%20Force%20html5_exponential_memory_for_sticky.user.js
// @updateURL https://update.greasyfork.org/scripts/471033/YouTube%3A%20Force%20html5_exponential_memory_for_sticky.meta.js
// ==/UserScript==

// html5_exponential_memory_for_sticky
/* "YouTube to change the video quality automatically during YouTube Live Streaming" refers to the following code:

k_=function(a){if(a.Tf){var b=a.Zi;var c=a.Tf;a=a.Dv();if(b.va.qt().isInline())var d=gO;else b.N("html5_exponential_memory_for_sticky")?d=.5>Jwa(b.Z.Wf,"sticky-lifetime")?"auto":TH[xL()]:d=TH[xL()],d=g.RH("auto",d,!1,"s");if(SH(d)){d=n_a(b,c);var e=d.compose,f;a:if((f=c.j)&&f.videoInfos.length){for(var h=g.u(f.videoInfos),l=h.next();!l.done;l=h.next()){l=l.value;var m=void 0;if(null==(m=l.u)?0:m.smooth){f=l.video.j;break a}}f=f.videoInfos[0].video.j}else f=0;Tma()&&!g.MM(b.Z)&&hI(c.j.videoInfos[0])&&
(f=Math.min(f,g.QH.large));d=e.call(d,new PH(0,f,!1,"o"));e=d.compose;f=4320;!b.Z.u||g.FM(b.Z)||b.Z.N("hls_for_vod")||b.Z.N("mweb_remove_360p_cap")||(f=g.QH.medium);(h=g.AL(b.Z.experiments,"html5_default_quality_cap"))&&c.j.j&&!c.videoData.aj&&!c.videoData.me&&(f=Math.min(f,h));h=g.AL(b.Z.experiments,"html5_random_playback_cap");l=/[a-h]$/;h&&l.test(c.videoData.clientPlaybackNonce)&&(f=Math.min(f,h));if(l=h=g.AL(b.Z.experiments,"html5_hfr_quality_cap"))a:{l=c.j;if(l.j)for(l=g.u(l.videoInfos),m=l.next();!m.done;m=
l.next())if(32<m.value.video.fps){l=!0;break a}l=!1}l&&(f=Math.min(f,h));(h=g.AL(b.Z.experiments,"html5_live_quality_cap"))&&c.videoData.isLivePlayback&&(f=Math.min(f,h));f=A_a(b,c,f);d=e.call(d,new PH(0,4320===f?0:f,!1,"d")).compose(z_a(b)).compose(B_a(b,c.videoData,c)).compose(y_a(b,c)).compose(q_a(b,c));SH(a)&&(d=d.compose(r_a(b,c)))}else b.N("html5_perf_cap_override_sticky")&&(d=d.compose(y_a(b,c))),b.N("html5_ustreamer_cap_override_sticky")&&(d=d.compose(r_a(b,c)));d=d.compose(q_a(b,c));b=c.videoData.Yx.compose(d).compose(c.videoData.lT).compose(a)}else b=
gO;return b};

*/

(() => {

  const win = this instanceof Window ? this : window;

  // Create a unique key for the script and check if it is already running
  const hkey_script = 'ezinmgkfbpgh';
  if (win[hkey_script]) throw new Error('Duplicated Userscript Calling'); // avoid duplicated scripting
  win[hkey_script] = true;

  /** @type {globalThis.PromiseConstructor} */
  const Promise = ((async () => { })()).constructor;

  let isMainWindow = false;
  try {
    isMainWindow = window.document === window.top.document
  } catch (e) { }

  window._ytConfigHacks.add((config_) => {

    let obj = null;
    try {
      obj = config_.WEB_PLAYER_CONTEXT_CONFIGS.WEB_PLAYER_CONTEXT_CONFIG_ID_KEVLAR_WATCH;
    } catch (e) { }

    if (obj) {

      const sflags = obj.serializedExperimentFlags
      if (typeof sflags === 'string') {
        if (sflags.includes('&h5_expr_b9Nkc=true')) return;
        let s = sflags.replace(/(^|&)(html5_exponential_memory_for_sticky|html5_perf_cap_override_sticky|html5_ustreamer_cap_override_sticky|html5_always_apply_default_quality_cap|html5_apply_pbr_cap_for_drm|manifestless_post_live_ufph|manifestless_post_live|hls_for_vod|mweb_remove_360p_cap)=\w+/, '') + '&html5_exponential_memory_for_sticky=true&h5_expr_b9Nkc=true';
        obj.serializedExperimentFlags = s.charCodeAt(0) === 38 ? s.substring(1) : s;
      }

    }

  });

})();
