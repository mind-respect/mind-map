if (window.platform == undefined) {

    window.platform = {};

    var width = screen.width;
    var height = screen.height;

    window.platform.isWebkitMobile = (/iphone|ipad|android/gi).test(navigator.appVersion);
    window.platform.isWebos = (/(webOS)\/([\d.]+)/).test(navigator.appVersion);
    window.platform.isBlackberry = (/(BlackBerry).*Version\/([\d.]+)/).test(navigator.appVersion);
    window.platform.hasTouch = 'ontouchstart' in window;

    window.platform.isMobile = (( window.platform.isWebkitMobile || window.platform.isWebos || window.platform.isBlackberry) && screen.width < 768 && window.platform.hasTouch);
    window.platform.isTablet = (( window.platform.isWebkitMobile || window.platform.isWebos || window.platform.isBlackberry) && screen.width >= 768 && screen.height >= 1024 && window.platform.hasTouch);
    window.platform.isDesktop = !( window.platform.isWebkitMobile || window.platform.isWebos || window.platform.isBlackberry);

    window.platform.skin = (
        //TODO: teos '400x240'
        height == 452 && width == 320 ? 'nexus-s' : // nexus s
        height == 494 && width == 320 ? 'nexus-s' : // nexus s
        height == 245 && width == 320 ? 'nexus-s' : // nexus s
        height == 1130 && width == 800 ? 'nexus-s' : // nexus s
        height == 854 && width == 480 ? 'motorola' : // motorola
        height == 554 && width == 369 ? 'htc-desire-hd' : // htc desireHD
        height == 510 && width == 320 ? 'htc-desire' : // htc desire
        height == 473 && width == 320 ? 'htc-desire' : // htc desire
        height == 480 && width == 320 && !navigator.standalone ? 'ios-browser' : // iphone
        height == 480 && width == 320 && navigator.standalone ? 'ios-fullscreen' : 'other'
    );

}