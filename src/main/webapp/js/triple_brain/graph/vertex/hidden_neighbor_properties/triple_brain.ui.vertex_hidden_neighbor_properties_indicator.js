define([
    "require",
    "jquery",
    "triple_brain.ui.edge",
    "triple_brain.ui.vertex_hidden_neighbor_properties_indicator_dashed_segment",
    "triple_brain.point",
    "triple_brain.segment",
    "triple_brain.mind-map_template",
    "triple_brain.graph_element_menu",
    "triple_brain.ui.graph",
    "triple_brain.event_bus",
    "triple_brain.graph_displayer"
],
    function (require, $, Edge, DashedSegment, Point, Segment, MindMapTemplate, GraphElementMenu, GraphUi, EventBus, GraphDisplayer) {
        var api = {
            withVertex:function (vertex) {
                return new HiddenNeighborPropertiesIndicator(vertex);
            }
        };

        EventBus.subscribe(
            '/event/ui/graph/drawing_info/about_to/update',
            function(){
                EventBus.unsubscribe(
                    "/event/ui/graph/vertex/width-modified " +
                        "/event/ui/graph/vertex/position-changed",
                        adjustPositionOfVertexHandler
                );
                EventBus.unsubscribe(
                    "/event/ui/graph/edges/redrawn",
                    adjustPositionOfAllVerticesHandler
                );
                EventBus.subscribe(
                    '/event/ui/graph/drawn',
                    graphDrawnHandler
                );
        });

        EventBus.subscribe(
            "/event/ui/vertex/visit_after_graph_drawn",
            function(event, vertex){
                if(vertex.hasHiddenRelations()){
                    vertex.buildHiddenNeighborPropertiesIndicator();
                }
            }
        );

        function graphDrawnHandler(event){
            EventBus.unsubscribe(
                '/event/ui/graph/drawn',
                graphDrawnHandler
            );
            EventBus.subscribe(
                "/event/ui/graph/edges/redrawn",
                adjustPositionOfAllVerticesHandler
            );
            EventBus.subscribe(
                "/event/ui/graph/vertex/width-modified " +
                "/event/ui/graph/vertex/position-changed",
                adjustPositionOfVertexHandler
            );
        }
        return api;
        function adjustPositionOfAllVerticesHandler(){
            visitHiddenPropertiesContainers(function(){
                var vertex = $(this).data("vertex");
                vertex.getHiddenRelationsContainer().adjustPosition();
            });
        }
        function visitHiddenPropertiesContainers(visitor){
            $(".hidden-properties-container").each(visitor);
        }
        function adjustPositionOfVertexHandler(event, vertex){
            if(vertex.hasHiddenRelationsContainer()){
                vertex.getHiddenRelationsContainer().adjustPosition();
            }
        }
        function HiddenNeighborPropertiesIndicator(vertex) {
            var self = this;
            var hiddenNeighborPropertiesContainer;
            var dashSegments = [];
            this.build = function () {
                if (!vertex.hasHiddenRelations()) {
                    return;
                }
                var numberOfHiddenConnectedRelations = vertex.getTotalNumberOfEdges() - 1;
                var isLeftOriented = vertex.getChildrenOrientation() === "left";
                var defaultLengthOfHiddenPropertiesContainer = 40;
                var lengthInPixels = numberOfHiddenConnectedRelations == 1 ?
                    1 :
                    defaultLengthOfHiddenPropertiesContainer;
                var startPoint = Point.fromCoordinates(
                    vertex.position().x,
                    vertex.position().y + (vertex.height() / 2)
                );
                if(!isLeftOriented){
                    startPoint.x += vertex.width();
                }
                var distanceBetweenEachDashedSegment =
                    numberOfHiddenConnectedRelations == 1 ?
                        0 :
                        lengthInPixels / (numberOfHiddenConnectedRelations - 1);
                var plainSegment = Segment.withStartAndEndPointAtOrigin();
                plainSegment.startPoint = startPoint;
                var horizontalDistanceOfDashedSegment = 20;
                plainSegment.endPoint.x = vertex.position().x;
                if(isLeftOriented){
                    plainSegment.endPoint.x -= horizontalDistanceOfDashedSegment;
                }else{
                    plainSegment.endPoint.x += vertex.width() + horizontalDistanceOfDashedSegment;
                }
                for (var i = 0; i < numberOfHiddenConnectedRelations; i++) {
                    plainSegment.endPoint.y = startPoint.y -
                        (lengthInPixels / 2) +
                        (i * distanceBetweenEachDashedSegment);
                    var dashedSegment = DashedSegment.withSegment(plainSegment.clone());
                    dashedSegment.draw();
                    dashSegments.push(dashedSegment);
                }
                hiddenNeighborPropertiesContainer = $(
                    MindMapTemplate[
                        'hidden_property_container'
                        ].merge()
                );
                getGraphUi().addHtml(
                    hiddenNeighborPropertiesContainer
                );

                hiddenNeighborPropertiesContainer
                    .css('min-width', defaultLengthOfHiddenPropertiesContainer)
                    .css('min-height', defaultLengthOfHiddenPropertiesContainer)
                    .css('left', isLeftOriented ? startPoint.x - defaultLengthOfHiddenPropertiesContainer : startPoint.x)
                    .css('top', startPoint.y - (defaultLengthOfHiddenPropertiesContainer / 2))
                    .data("vertex", vertex)
                    .click(handleHiddenPropertiesContainerClick);
            };
            this.remove = function () {
                $(hiddenNeighborPropertiesContainer).remove();
                while (dashSegments.length != 0) {
                    var dashSegment = dashSegments.pop();
                    dashSegment.remove();
                }
            };
            this.adjustPosition = function(){
                self.remove();
                self.build();
            };
        }
        function getGraphUi(){
            if(GraphUi === undefined){
                GraphUi = require("triple_brain.ui.graph");
            }
            return GraphUi;
        }
        function handleHiddenPropertiesContainerClick(){
            if(!GraphDisplayer.canAddChildTree()){
                return;
            }
            var vertex = $(this).data("vertex");
            GraphDisplayer.addChildTree(
                vertex,
                function(drawnTree){
                    GraphDisplayer.integrateEdgesOfServerGraph(
                        drawnTree
                    );
                    Edge.redrawAllEdges();
                    vertex.visitChildren(function(child){
                        if(child.hasHiddenRelations()){
                            child.buildHiddenNeighborPropertiesIndicator();
                        }
                    });
                    vertex.getHtml().centerOnScreenWithAnimation();
                }
            );
        }
    }
);