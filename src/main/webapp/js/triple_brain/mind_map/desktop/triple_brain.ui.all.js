window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

if (triple_brain.ui.all == undefined) {
    (function($) {
        triple_brain.ui.all = {
            clearCanvas : function(canvas){
                var canvasContext = canvas[0].getContext("2d");
                canvasContext.clearRect(0, 0, $(canvas).width(), $(canvas).height());
            }
        };
    })(jQuery);
}
