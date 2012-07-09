/**
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.ui.graph == undefined) {
    (function($) {
        var point = triple_brain.point;
        triple_brain.ui.graph = {
            addHTML : function(html){
                $("#drawn_graph").append(html);
            },
            clear: function() {
                triple_brain.ui.all.clearCanvas(
                    triple_brain.ui.graph.canvas()
                );
            },
            canvas : function(){
                    return $("#graphCanvas");
            },
            canvasContext: function(){
                return triple_brain.ui.graph.canvas()[0].getContext("2d");
            },
            canvasToMoveAVertex: function(){
                return $("#canvasToMoveVertex");
            },
            canvasContextToMoveAVertex: function(){
                return triple_brain.ui.graph.canvasToMoveAVertex()[0].getContext("2d");
            },
            offset : function(){
                return point.fromCoordinates(
                    $("body").width() / 2,
                    $("body").height() / 2
                )
            }
        }

    })(jQuery);

}
