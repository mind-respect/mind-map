/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.drawn_graph",
    "triple_brain.ui.vertex",
    "jquery-ui"
],
    function ($, DrawnGraph, Vertex) {
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
                            DrawnGraph.getWithNewCentralVertex(
                                Vertex.centralVertex()
                            );
                        }
                    }
                });
            }
        };
    }
);