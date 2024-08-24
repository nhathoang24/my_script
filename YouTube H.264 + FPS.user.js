// ==UserScript==
// @name YouTube H.264 + FPS
// @name:ru YouTube H.264 + FPS
// @namespace https://www.youtube.com
// @version 2023.11.20.2
// @description Clone of h264ify with optional limit up to 30 FPS.
// @description:ru Клон h264ify с опциональным ограничением до 30 FPS.
// @match *://*.youtube.com/*
// @match *://*.youtube-nocookie.com/*
// @match *://*.youtubekids.com/*
// @license MIT
// @grant none
// @run-at document-start
// ==/UserScript==

// Constants for video settings

const DISALLOWED_TYPES_REGEX = /webm|vp8|vp9|av01/i;

(function() {
    const codecsToCheck = [
    'video/webm; codecs="vp8"',         // WebM with VP8 codec
    'video/webm; codecs="vp9"',         // WebM with VP9 codec
    'video/webm; codecs="av01"',        // WebM with AV1 codec
    'video/mp4; codecs="avc1.42E01E"',  // MP4 with H.264 codec
    'video/mp4; codecs="hev1.1.6.L93.B0"', // MP4 with HEVC codec
    'video/ogg; codecs="theora"',       // Ogg with Theora codec
    'video/ogg; codecs="vp8"',          // Ogg with VP8 codec
    'video/ogg; codecs="vp9"',          // Ogg with VP9 codec
    'video/mp4; codecs="vp9"',          // MP4 with VP9 codec
    'video/mp4; codecs="av01"',         // MP4 with AV1 codec
    'video/x-matroska; codecs="avc1.42E01E"', // Matroska with H.264 codec
    'video/x-matroska; codecs="vp9"',   // Matroska with VP9 codec
    'video/x-matroska; codecs="av01"'   // Matroska with AV1 codec
];
    const mediaSource = window.MediaSource;

    if (!mediaSource) return;

    const originalIsTypeSupported = mediaSource.isTypeSupported.bind(mediaSource);

    mediaSource.isTypeSupported = (type) => {
        if (typeof type !== 'string') return false;

        if (DISALLOWED_TYPES_REGEX.test(type)) return false;

        return originalIsTypeSupported(type);
    };
    codecsToCheck.forEach(type => {
    const isSupported = MediaSource.isTypeSupported(type);
    console.log(`${type} supported:`, isSupported);
});
})();
