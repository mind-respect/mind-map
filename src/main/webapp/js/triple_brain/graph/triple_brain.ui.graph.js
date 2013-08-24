/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "jquery",
    "triple_brain.point",
    "triple_brain.event_bus",
    "triple_brain.ui.edge"
],
    function (require, $, Point, EventBus, Edge) {
        var api = {};
        var graphForTraversal;
        api.getVertexMouseOver = function () {
            return $("body").data("vertex_mouse_over");
        };
        api.setVertexMouseOver = function (vertex) {
            $("body").data("vertex_mouse_over", vertex);
        };
        api.unsetVertexMouseOver = function(){
            $("body").removeData("vertex_mouse_over");
        };
        api.getEdgeMouseOver = function () {
            return $("body").data("edge_mouse_over");
        };
        api.setEdgeMouseOver = function (edge) {
            $("body").data("edge_mouse_over", edge);
        };
        api.unsetEdgeMouseOver = function(){
            $("body").removeData("edge_mouse_over");
        };
        api.addHtml = function (html) {
            $("#drawn_graph").append(html);
        };
        api.resetDrawingCanvas = function(){
            if ($("body").data(("canvas"))) {
                $("body").data("canvas").remove();
            }
            $("body").data(
                "canvas",
                Raphael(0, 0, $("body").width(), $("body").height())
            );
        };
        api.canvas = function () {
            return $("body").data("canvas");
        };

        api.offset = function () {
            return Point.fromCoordinates(
                $("body").width() / 2,
                $("body").height() / 2
            )
        };

        api.reset = function(){
            if(graphForTraversal != undefined){
                graphForTraversal.invalidate();
            }
            graphForTraversal = new crow.Graph();
            var Edge = require("triple_brain.ui.edge");
            Edge.removeAllArrowLines();
            $("#drawn_graph").empty();
        };

        api.numberOfEdgesBetween = function(vertexA, vertexB){
            return graphForTraversal.findGoal({
                start: graphForTraversal.getNode(vertexA.getUri()),
                goal: graphForTraversal.getNode(vertexB.getUri()),
                algorithm: "dijkstra"
            }).length;
        };

        EventBus.subscribe(
            '/event/ui/html/vertex/created/',
            function(event, vertex){
                addVertexToGraphTraversal(vertex);
            }
        );

        EventBus.subscribe(
            '/event/ui/graph/vertex_and_relation/added/',
            function(event, triple){
                addVertexToGraphTraversal(triple.destinationVertex());
                connectVerticesOfEdgeForTraversal(triple.edge());
                EventBus.publish(
                    "/event/graph_traversal/triple_added",
                    triple
                );
            }
        );

        EventBus.subscribe(
            '/event/ui/graph/relation/deleted',
            function(event, edge, edgeUri, sourceVertexUri, destinationVertexUri){
                removeEdgeInGraphForTraversal(
                    sourceVertexUri,
                    destinationVertexUri
                );
                EventBus.publish(
                    "/event/graph_traversal/edge/removed",[
                        edgeUri,
                        sourceVertexUri,
                        destinationVertexUri
                    ]
                );
            }
        );

        function removeEdgeInGraphForTraversal(sourceVertexUri, destinationVertexUri){
            var sourceVertex = graphForTraversal.getNode(
                sourceVertexUri
            );
            var destinationVertex = graphForTraversal.getNode(
                destinationVertexUri
            );
            removeVertexInConnections(destinationVertexUri, sourceVertex.connections);
            removeVertexInConnections(sourceVertexUri, destinationVertex.connections);
        }

        EventBus.subscribe(
            '/event/ui/graph/vertex/deleted/',
            function(event, vertexUri){
                removeVertexInGraphForTraversal(vertexUri);
            }
        );

        function removeVertexInGraphForTraversal(vertexUri){
            graphForTraversal.removeNode(
                graphForTraversal.getNode(vertexUri)
            );
            var node = findVertexInGraphForTraversalNodesAfterItWasDeleted(
                vertexUri
            );
            $.each(node.connections, function(){
                var connection = this;
                var connectedNode = graphForTraversal.getNode(connection.id);
                removeVertexInConnections(vertexUri, connectedNode.connections);
            });
        }
        function removeVertexInConnections(vertexUri, connections){
            for(var j in connections){
                var connection = connections[j];
                if(connection.id == vertexUri){
                    connections.splice(j,1);
                }
            }
        }

        function findVertexInGraphForTraversalNodesAfterItWasDeleted(vertexUri){
            for(var i in graphForTraversal.nodes){
                var node = graphForTraversal.nodes[i];
                if(node.id == vertexUri){
                    return node;
                }
            }
        }


        EventBus.subscribe(
            '/event/ui/html/edge/created/',
            function(event, edge){
                connectVerticesOfEdgeForTraversal(edge);
                EventBus.publish(
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
                edge.sourceVertex().getUri()
            );
            var destinationVertex = graphForTraversal.getNode(
                edge.destinationVertex().getUri()
            );
            sourceVertex.connectTo(
                destinationVertex
            );
        }
        return api;
    }
)
