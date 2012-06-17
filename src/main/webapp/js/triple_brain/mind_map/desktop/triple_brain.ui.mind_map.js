require("Logger", "triple_brain.ui");

if (triple_brain.ui.mind_map == undefined) {
    (function ($) {
        triple_brain.ui.mind_map = {
            offset:function () {
                var offset = {};
                var leftMargin = 150;
                var topMargin = 75;
                offset.left = $("#left-panel").width() + leftMargin;
                offset.top = topMargin;
                return offset;
            },
            applyOverScroll:function () {
//                $("[data-role='page']").overscroll({
//                    zIndex : 1,
//                    wheelDelta : 20,
//                    scrollDelta : 4,
//                    hoverThumbs : true,
//                    showThumbs : false,
//                    cancelOn : ""
//                })
//                $("[data-role='page']").on('click', function(){
//                    var outOfVertexMenus = $('.peripheral-menu');
//                    $(outOfVertexMenus).remove();
//                    $("input[type=text]:focus").blur();
//                });
            },
            disableOverScroll:function () {
//                $("[data-role='page']").removeOverscroll();
            }
        };

        triple_brain.bus.local.topic('/event/ui/view/create/mind_map').subscribe(function (page) {
        });

        triple_brain.bus.local.topic('/event/ui/view/beforeshow/mind_map').subscribe(function (page) {
            handleIfNotAuthentifiedRedirectToAuthPage();
            var sliderDefaultValue = 1;
            $("#sub-vertices-depth-index").val(sliderDefaultValue);
            $("#sub-vertices-depth-slider").slider({
                value:sliderDefaultValue,
                min:0,
                max:10,
                step:1,
                orientation:"horizontal",
                slide:function (event, ui) {
                    $("#sub-vertices-depth-index").val(ui.value);
                },
                change:function (event, ui) {
                    $("#sub-vertices-depth-index").val(ui.value);
                    if (event.originalEvent) {
                        triple_brain.drawn_graph.getWithNewCentralVertex(
                            triple_brain.ui.vertex.centralVertex()
                        );
                    }
                }
            });
            triple_brain.user.authenticatedUser(function(authenticatedUser){
                triple_brain.authenticatedUser = authenticatedUser;
                triple_brain.drawn_graph.getWithDefaultCentralVertex();
            });

            $("#redraw-graph-btn").click(function (e) {
                triple_brain.drawn_graph.getWithNewCentralVertex(
                    triple_brain.ui.vertex.centralVertex()
                );
            });
            triple_brain.ui.mind_map.applyOverScroll();
            prepareSearchFeature();
            function prepareSearchFeature(){
                $("#vertex-search-input").autocomplete({
                    source : function(request, response){
                        triple_brain.search.search_for_auto_complete(
                            request.term,
                            function(searchResults){
                                response($.map(searchResults, function(searchResult){
                                    return {
                                        label : searchResult.label,
                                        value : searchResult.label
                                    }
                                }));
                            }
                        );
                    }
                })
            }
        });

        triple_brain.bus.local.topics('/event/ui/graph/drawing_info/updated/').subscribe(function (drawnGraph, centralVertexId) {
            $("#drawn_graph").empty();
            var graphCanvasSizeCoefficient = 3;
            var graphCanvasSizeConstant = 400;
            drawnGraph.bounding_box_width = drawnGraph.bounding_box_width * graphCanvasSizeCoefficient + graphCanvasSizeConstant;
            drawnGraph.bounding_box_height = drawnGraph.bounding_box_height * graphCanvasSizeCoefficient + graphCanvasSizeConstant;
            var graphCanvas = triple_brain.template['graph_canvas'].merge(drawnGraph);
            $("#drawn_graph").append(graphCanvas);
            triple_brain.ui.edge_creator.createWithArrayOfJsonHavingRelativePosition(
                drawnGraph.edges
            );
            triple_brain.ui.vertex_creator.createWithArrayOfJsonHavingRelativePosition(
                drawnGraph.vertices
            );
            var centralVertex = triple_brain.ui.vertex.withId(centralVertexId);
            centralVertex.setAsCentral();

            $("[data-role='page']").on('click', "#drawn_graph", function () {
                var outOfVertexMenus = $('.peripheral-menu');
                $(outOfVertexMenus).remove();
            });

            triple_brain.bus.local.topic('/event/ui/graph/drawn').publish();
        });
        function handleIfNotAuthentifiedRedirectToAuthPage(){
            $("html").ajaxError(function (e, jqxhr, settings, exception){
                if(jqxhr.status == 403){
                    window.location = "login.html";
                }
            });
        }
    })(jQuery);
}
