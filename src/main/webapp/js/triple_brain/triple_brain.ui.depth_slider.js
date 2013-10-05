/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.ui.vertex",
    "triple_brain.graph_displayer",
    "triple_brain.ui.graph",
    "jquery-ui"
],
    function ($, Vertex, GraphDisplayer, GraphUi){
        return {
            init:function() {
                var sliderDefaultValue = 1;
                $("#sub-vertices-depth-index").text(sliderDefaultValue);
                $("#sub-vertices-depth-slider").slider({
                    value:sliderDefaultValue,
                    min:1,
                    max:5,
                    step:1,
                    orientation:"horizontal",
                    slide:function (event, ui) {
                        $("#sub-vertices-depth-index").text(ui.value);
                    },
                    change:function (event, ui) {
                        $("#sub-vertices-depth-index").text(ui.value);
                        if (event.originalEvent) {
                            GraphUi.resetDrawingCanvas();
                            GraphDisplayer.displayUsingNewCentralVertex(
                                Vertex.centralVertex()
                            );
                        }
                    }
                });
            },
            currentDepth : function(){
                return $("#sub-vertices-depth-slider").slider('value');
            }
        };
    }
);