if (triple_brain.ui.mind_map == undefined) {
    var point = triple_brain.point;
    var segment = triple_brain.segment;
    var users = triple_brain.user;
    (function ($) {
        var eventBus = triple_brain.event_bus;
        var dragScroll = triple_brain.drag_scroll;
        triple_brain.ui.mind_map = {
            offset:function () {
                var offset = {};
                var leftMargin = 150;
                var topMargin = 75;
                offset.left = $("#left-panel").width() + leftMargin;
                offset.top = topMargin;
                return offset;
            }
        };
        $(document).ready(function(){
            $("body").hide();
            users.isAuthenticated(
                callBackWhenIsAuthenticated,
                function(){
                    window.location = "login.html";
                }
            )
            function callBackWhenIsAuthenticated(){
                $("body").show();
                handleIfNotAuthentifiedRedirectToAuthPage();
                handleDisconnectButton();
                var sliderDefaultValue = 5;
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
                                            value : searchResult.label,
                                            id : searchResult.id
                                        }
                                    }));
                                }
                            );
                        },
                        select : function(event, ui){
                            var vertexUri = ui.item.id;
                            triple_brain.drawn_graph.getFromNewCentralVertexUri(
                                vertexUri
                            );
                        }
                    })
                }
            }
        });

        eventBus.subscribe(
            '/event/ui/graph/drawing_info/updated/',
            function (event, drawnGraph, centralVertexId) {
                triple_brain.ui.graph.reset();
                $("#drawn_graph").empty();
                drawnGraph.bounding_box_width = $("body").width();
                drawnGraph.bounding_box_height = $("body").height();
                var graphCanvas = triple_brain.template['graph_canvas'].merge(drawnGraph);
                $("#drawn_graph").append(graphCanvas);

                triple_brain.ui.vertex_creator.createWithArrayOfJsonHavingRelativePosition(
                    drawnGraph.vertices
                );

                triple_brain.ui.edge_creator.createWithArrayOfJsonHavingRelativePosition(
                    drawnGraph.edges
                );

                var centralVertex = triple_brain.ui.vertex.withId(centralVertexId);
                centralVertex.setAsCentral();
                centralVertex.scrollTo();

                $("body").on('click', "#drawn_graph", function () {
                    var outOfVertexMenus = $('.peripheral-menu');
                    $(outOfVertexMenus).remove();
                });
                dragScroll.start();
                eventBus.publish('/event/ui/graph/drawn');
            }
        );

        function handleIfNotAuthentifiedRedirectToAuthPage(){
            $("html").ajaxError(function (e, jqxhr, settings, exception){
                if(jqxhr.status == 403){
                    window.location = "login.html";
                }
            });
        }
        function handleDisconnectButton(){
            $("#disconnect-btn").click(function(){
                users.logout(function(){
                    window.location = "login.html";
                })
            })
        }
    })(jQuery);
}
