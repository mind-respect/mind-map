/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.event_bus",
    "crow"
], function(EventBus){
    var graphForTraversal;
    var api = {};
    api.numberOfEdgesBetween = function(vertexA, vertexB){
        return graphForTraversal.findGoal({
            start: graphForTraversal.getNode(vertexA.getId()),
            goal: graphForTraversal.getNode(vertexB.getId()),
            algorithm: "dijkstra"
        }).length;
    };
    api._reset = function(){
        if(graphForTraversal !== undefined){
            graphForTraversal.invalidate();
        }
        graphForTraversal = new crow.Graph();
    };
    api._removeVertexInGraphForTraversal = function(vertexId){
        graphForTraversal.removeNode(
            graphForTraversal.getNode(vertexId)
        );
        var node = findVertexInGraphForTraversalNodesAfterItWasDeleted(
            vertexId
        );
        $.each(node.connections, function(){
            var connection = this;
            var connectedNode = graphForTraversal.getNode(connection.id);
            if(connectedNode === undefined){
                return;
            }
            removeVertexInConnections(vertexId, connectedNode.connections);
        });
    };
    api._addVertexToGraphTraversal = function(vertex){
        graphForTraversal.addNode(
            new VertexAsCrowNode(vertex)
        );
    };
    api._connectVerticesOfEdgeForTraversal = function(edge){
        var sourceVertex = graphForTraversal.getNode(
            edge.getSourceVertex().getId()
        );
        var destinationVertex = graphForTraversal.getNode(
            edge.getDestinationVertex().getId()
        );
        sourceVertex.connectTo(
            destinationVertex
        );
    };
    api.activate = function(){
        EventBus.subscribe(
            '/event/ui/graph/reset',
            api._reset
        );

        EventBus.subscribe(
            '/event/ui/html/vertex/created/',
            function(event, vertex){
                api._addVertexToGraphTraversal(vertex);
            }
        );

        EventBus.subscribe(
            '/event/ui/graph/vertex_and_relation/added/',
            function(event, triple){
                api._addVertexToGraphTraversal(triple.destinationVertex());
                api._connectVerticesOfEdgeForTraversal(triple.edge());
                EventBus.publish(
                    "/event/graph_traversal/triple_added",
                    triple
                );
            }
        );

        EventBus.subscribe(
            '/event/ui/graph/relation/deleted',
            function(event, edge, edgeUri, sourceVertexUri, destinationVertexUri, sourceVertexId, destinationVertexId){
                removeEdgeInGraphForTraversal(
                    sourceVertexId,
                    destinationVertexId
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

        EventBus.subscribe(
            '/event/ui/graph/vertex/deleted/',
            function(event, uri, id){
                api._removeVertexInGraphForTraversal(id);
            }
        );

        EventBus.subscribe(
            '/event/ui/html/edge/created/',
            function(event, edge){
                api._connectVerticesOfEdgeForTraversal(edge);
                EventBus.publish(
                    "/event/graph_traversal/edge_added",
                    edge
                );
            }
        );
    };

    function removeEdgeInGraphForTraversal(sourceVertexId, destinationVertexId){
        var sourceVertex = graphForTraversal.getNode(
            sourceVertexId
        );
        var destinationVertex = graphForTraversal.getNode(
            destinationVertexId
        );
        removeVertexInConnections(destinationVertexId, sourceVertex.connections);
        removeVertexInConnections(sourceVertexId, destinationVertex.connections);
    }

    function removeVertexInConnections(vertexId, connections){
        for(var j = 0 ; j < connections; j++){
            var connection = connections[j];
            if(connection.id == vertexId){
                connections.splice(j,1);
            }
        }
    }

    function findVertexInGraphForTraversalNodesAfterItWasDeleted(vertexId){
        for(var i = 0 ; i< graphForTraversal.nodes.length; i++){
            var node = graphForTraversal.nodes[i];
            if(node.id == vertexId){
                return node;
            }
        }
    }

    function VertexAsCrowNode(vertex){
        this._initialize = function(){};
        crow.ConnectedNode.apply(this, [vertex.getId()]);
    }
    VertexAsCrowNode.prototype = new crow.ConnectedNode;
    return api;
});