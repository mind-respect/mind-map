/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.ui.vertex",
    "triple_brain.graph_displayer",
    "jquery-ui"
],
    function ($, Vertex, GraphDisplayer){
        return {
            init:function() {
                var sliderDefaultValue = 5;
                $("#sub-vertices-depth-index").text(sliderDefaultValue);
                $("#sub-vertices-depth-slider").slider({
                    value:sliderDefaultValue,
                    min:0,
                    max:20,
                    step:1,
                    orientation:"horizontal",
                    slide:function (event, ui) {
                        $("#sub-vertices-depth-index").text(ui.value);
                    },
                    change:function (event, ui) {
                        $("#sub-vertices-depth-index").text(ui.value);
                        if (event.originalEvent) {
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