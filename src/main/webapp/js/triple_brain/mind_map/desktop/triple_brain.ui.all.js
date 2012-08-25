define([
    "jquery"
],
    function ($) {
        return {
            clearCanvas:function (canvas) {
                var canvasContext = canvas[0].getContext("2d");
                canvasContext.clearRect(0, 0, $(canvas).width(), $(canvas).height());
            }
        };
    });



