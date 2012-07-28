/**
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.ui.graph == undefined) {
    (function ($) {
        var point = triple_brain.point;
        var graphStatic = triple_brain.ui.graph = {};
        var graphForTraversal = new crow.Graph();
        graphStatic.addHTML = function (html) {
            $("#drawn_graph").append(html);
        };
        graphStatic.removeAllArrowLines = function () {
            triple_brain.ui.all.clearCanvas(
                triple_brain.ui.graph.canvas()
            );
            triple_brain.ui.vertex.redrawAllPropertiesIndicator();
        };
        graphStatic.canvas = function () {
            return $("#graphCanvas");
        };
        graphStatic.canvasContext = function () {
            return triple_brain.ui.graph.canvas()[0].getContext("2d");
        };
        graphStatic.canvasToMoveAVertex = function () {
            return $("#canvasToMoveVertex");
        };
        graphStatic.canvasContextToMoveAVertex = function () {
            return triple_brain.ui.graph.canvasToMoveAVertex()[0].getContext("2d");
        };
        graphStatic.offset = function () {
            return point.fromCoordinates(
                $("body").width() / 2,
                $("body").height() / 2
            )
        };

        graphStatic.numberOfEdgesBetween = function(vertexA, vertexB){
            return graphForTraversal.findGoal({
                start: vertexInGraphForTraversal(vertexA),
                goal: vertexInGraphForTraversal(vertexB),
                algorithm: "dijkstra"
            }).length();
        };
        eventBus.subscribe(
            '/event/ui/html/vertex/created/',
            function(event, vertex){
                addVertexToGraphTraversal(vertex);
            }
        );

        eventBus.subscribe(
            '/event/ui/graph/vertex_and_relation/added/',
            function(event, triple){
                addVertexToGraphTraversal(triple.destinationVertex());
                connectVerticesOfEdgeForTraversal(triple.edge());
            }
        );
        eventBus.subscribe(
            '/event/ui/graph/vertex/deleted/',
            function(event, vertex){
                graphForTraversal.removeNode(
                    vertexInGraphForTraversal(vertex)
                );
            }
        );

        eventBus.subscribe(
            '/event/ui/html/edge/created/',
            function(event, edge){
                connectVerticesOfEdgeForTraversal(edge);
            }
        );

        function addVertexToGraphTraversal(vertex){
            graphForTraversal.addNode(vertex);
        }

        function connectVerticesOfEdgeForTraversal(edge){
            var sourceVertex = vertexInGraphForTraversal(
                edge.sourceVertex()
            );
            var destinationVertex = vertexInGraphForTraversal(
                edge.destinationVertex()
            );
            sourceVertex.connectTo(
                destinationVertex
            );
        }

        function vertexInGraphForTraversal(vertex){
            return graphForTraversal.map[vertex.getId()];
        }

    })(jQuery);

}
