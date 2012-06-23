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
