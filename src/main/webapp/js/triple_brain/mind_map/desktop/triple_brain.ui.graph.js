/**
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.ui.graph == undefined) {

    (function($) {
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
            }
        }

    })(jQuery);

}
