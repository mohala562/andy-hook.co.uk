// Module - Polyfill - Load polyfills unconditionally and for every build. This avoids race conditions where a feature is needed but the script has not loaded
// --------------------------------------------------
requirejs([
    'polyfill/matchMedia',
    'polyfill/matchMedia.addListener',
    'polyfill/requestAnimationFrame'
    ]);