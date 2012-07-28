/**
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.ui.graph == undefined) {
    (function ($) {
        var point = triple_brain.point;
        var graphStatic = triple_brain.ui.graph = {};
        var graphForTraversal;

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

        graphStatic.reset = function(){
            if(graphForTraversal != undefined){
                graphForTraversal.invalidate();
            }
            graphForTraversal = new crow.Graph();
        }

        graphStatic.numberOfEdgesBetween = function(vertexA, vertexB){
            return graphForTraversal.findGoal({
                start: graphForTraversal.getNode(vertexA.getId()),
                goal: graphForTraversal.getNode(vertexB.getId()),
                algorithm: "dijkstra"
            }).length;
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
                eventBus.publish(
                    "/event/graph_traversal/triple_added",
                    triple
                );
            }
        );

        eventBus.subscribe(
            '/event/ui/graph/vertex/deleted/',
            function(event, vertex){
                removeVertexInGraphForTraversal(vertex);
            }
        );

        function removeVertexInGraphForTraversal(vertex){
            graphForTraversal.removeNode(
                graphForTraversal.getNode(vertex.getId())
            );
            for(var i in graphForTraversal.nodes){
                var node = graphForTraversal.nodes[i];
                if(node.id == vertex.getId()){
                    $.each(node.connections, function(){
                        var connection = this;
                        var connectedNodeInMap = graphForTraversal.map[
                            connection.id
                            ];
                        for(var j in connectedNodeInMap.connections){
                            var connection = connectedNodeInMap.connections[j];
                            if(connection.id == vertex.getId()){
                                connectedNodeInMap.connections.splice(j,1);
                            }
                        }
                    });
                    graphForTraversal.nodes.splice(
                        i,1
                    );
                }
            }
        }

        eventBus.subscribe(
            '/event/ui/html/edge/created/',
            function(event, edge){
                connectVerticesOfEdgeForTraversal(edge);
                eventBus.publish(
                    "/event/graph_traversal/edge_added",
                    edge
                );
            }
        );

        function addVertexToGraphTraversal(vertex){
            graphForTraversal.addNode(vertex);
        }

        function connectVerticesOfEdgeForTraversal(edge){
            var sourceVertex = graphForTraversal.getNode(
                edge.sourceVertex().getId()
            );
            var destinationVertex = graphForTraversal.getNode(
                edge.destinationVertex().getId()
            );
            sourceVertex.connectTo(
                destinationVertex
            );
        }
    })(jQuery);

}
