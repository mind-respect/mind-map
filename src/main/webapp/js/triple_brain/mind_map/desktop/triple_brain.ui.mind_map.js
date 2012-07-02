if (triple_brain.ui.mind_map == undefined) {
    var point = triple_brain.point;
    var segment = triple_brain.segment;
    (function ($) {
        var eventBus = triple_brain.event_bus;
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
                $("#graphCanvas").mousedown(function(){
                    var mousePosition;
                    var graphCanvas = this;
                    $(graphCanvas).data("mousedown", true);
                    var numberOfMouseMove = 0;
                    $(graphCanvas).mousemove(moveHandler);
                    function moveHandler(moveEvent){
//                        console.log("moveEvent.which " + moveEvent.which);
                        numberOfMouseMove ++;
                        mousePosition = point.fromCoordinates(
                            moveEvent.pageX,
                            moveEvent.pageY
                        );
                        if(0== 0){
                            console.log("mouse position " +  mousePosition);
                            if($("#graphCanvas").data("mousedown")){
                                scroll();
                            }else{
                                $("#graphCanvas").unbind("mousemove");
                                //    clearInterval(scrollLoop);
                            }
                        }
                    }
                    //var scrollLoop = setInterval(scroll, 10);
                    $("body").mouseup(function(){
                      //  clearInterval(scrollLoop);
                        $("#graphCanvas").unbind("mousemove");
                        $("#graphCanvas").data("mousedown", false);
                    });
                    var lastPosition;
                    function scroll(){
                        $(graphCanvas).unbind("mousemove");
//                        console.log(new Date() + " is mouse down in scroll " + $("#graphCanvas").data("mousedown"));
                        if(!$("#graphCanvas").data("mousedown")){
                            $("#graphCanvas").unbind("mousemove");
                            //    clearInterval(scrollLoop);
                            return;
                        }
                        lastPosition = lastPosition === undefined ?
                            point.fromPoint(mousePosition) :
                            lastPosition;
                        var movementSegment = segment.withStartAndEndPoint(
                            lastPosition,
                            mousePosition
                        );
                        var distanceToScroll = distanceToScroll();
                        console.log("distance to scroll " +  distanceToScroll);
//                        if((Math.abs(distanceToScroll.x) + Math.abs(distanceToScroll.y)) < 2){
//                            $(graphCanvas).bind("mousemove", moveHandler);
//                            return;
//                        }
                        function distanceToScroll(){
                            var distanceToScroll = movementSegment.length();
                            distanceToScroll = distanceToScroll.invert();
                            distanceToScroll = distanceToScroll.multiply(1);
                            return distanceToScroll;
                        }
                        var scrollPosition = point.fromCoordinates(
                            $("body").scrollLeft(),
                            $("body").scrollTop()
                        )
                        var newScrollPosition = point.sumOfPoints(
                            distanceToScroll,
                            scrollPosition
                        );
//                        console.log("new scroll Position" +  newScrollPosition)
                        window.scrollTo(
                            newScrollPosition.x,
                            newScrollPosition.y
                        );
                        lastPosition = point.sumOfPoints(
                            distanceToScroll,
                            mousePosition
                        );
                        $(graphCanvas).bind("mousemove", moveHandler);
                    }
                });

            },
            disableOverScroll:function () {
//                $("body").removeOverscroll();
            }
        };
        $(document).ready(function(){
            handleIfNotAuthentifiedRedirectToAuthPage();
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
        });

        eventBus.subscribe(
            '/event/ui/graph/drawing_info/updated/',
            function (event, drawnGraph, centralVertexId) {
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
                triple_brain.ui.mind_map.applyOverScroll();
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
    })(jQuery);
}
