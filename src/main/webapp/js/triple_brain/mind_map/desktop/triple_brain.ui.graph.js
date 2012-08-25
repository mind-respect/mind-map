/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "jquery",
    "triple_brain/mind_map/triple_brain.point",
    "triple_brain/triple_brain.event_bus",
    "triple_brain/mind_map/desktop/triple_brain.ui.all"
],
    function (require, $, Point, EventBus, UiUtils ) {
        var api = {};
        var graphForTraversal;
        api.addHTML = function (html) {
            $("#drawn_graph").append(html);
        };
        api.removeAllArrowLines = function () {
            UiUtils.clearCanvas(
                api.canvas()
            );
            var Vertex = require("triple_brain/mind_map/desktop/vertex/triple_brain.ui.vertex");
            Vertex.redrawAllPropertiesIndicator();
        };
        api.canvas = function () {
            return $("#graphCanvas");
        };
        api.canvasContext = function () {
            return api.canvas()[0].getContext("2d");
        };
        api.canvasToMoveAVertex = function () {
            return $("#canvasToMoveVertex");
        };
        api.canvasContextToMoveAVertex = function () {
            return api.canvasToMoveAVertex()[0].getContext("2d");
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
        }

        api.numberOfEdgesBetween = function(vertexA, vertexB){
            return graphForTraversal.findGoal({
                start: graphForTraversal.getNode(vertexA.getId()),
                goal: graphForTraversal.getNode(vertexB.getId()),
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
            function(event, edge){
                removeEdgeInGraphForTraversal(edge);
            }
        );

        function removeEdgeInGraphForTraversal(edge){
            var sourceVertex = graphForTraversal.getNode(
                edge.sourceVertex().getId()
            );
            var destinationVertex = graphForTraversal.getNode(
                edge.destinationVertex().getId()
            );
            removeVertexInConnections(destinationVertex, sourceVertex.connections);
            removeVertexInConnections(sourceVertex, destinationVertex.connections);
            EventBus.publish(
                "/event/graph_traversal/edge/removed",
                [edge]
            );
        }

        EventBus.subscribe(
            '/event/ui/graph/vertex/deleted/',
            function(event, vertex){
                removeVertexInGraphForTraversal(vertex);
            }
        );

        function removeVertexInGraphForTraversal(vertex){
            graphForTraversal.removeNode(
                graphForTraversal.getNode(vertex.getId())
            );
            var node = findVertexInGraphForTraversalNodesAfterItWasDeleted(
                vertex
            );
            $.each(node.connections, function(){
                var connection = this;
                var connectedNode = graphForTraversal.getNode(connection.id);
                removeVertexInConnections(vertex, connectedNode.connections);
            });
        }
        function removeVertexInConnections(vertex, connections){
            for(var j in connections){
                var connection = connections[j];
                if(connection.id == vertex.getId()){
                    connections.splice(j,1);
                }
            }
        }

        function findVertexInGraphForTraversalNodesAfterItWasDeleted(vertex){
            for(var i in graphForTraversal.nodes){
                var node = graphForTraversal.nodes[i];
                if(node.id == vertex.getId()){
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
                edge.sourceVertex().getId()
            );
            var destinationVertex = graphForTraversal.getNode(
                edge.destinationVertex().getId()
            );
            sourceVertex.connectTo(
                destinationVertex
            );
        }
        return api;
    }
)
