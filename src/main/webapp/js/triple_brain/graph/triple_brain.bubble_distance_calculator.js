/*
 * Copyright Mozilla Public License 1.1
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
    EventBus.subscribe(
        '/event/ui/graph/reset',
        function(){
            if(graphForTraversal !== undefined){
                graphForTraversal.invalidate();
            }
            graphForTraversal = new crow.Graph();
        }
    );

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

    EventBus.subscribe(
        '/event/ui/graph/vertex/deleted/',
        function(event, uri, id){
            removeVertexInGraphForTraversal(id);
        }
    );

    function removeVertexInGraphForTraversal(vertexId){
        graphForTraversal.removeNode(
            graphForTraversal.getNode(vertexId)
        );
        var node = findVertexInGraphForTraversalNodesAfterItWasDeleted(
            vertexId
        );
        $.each(node.connections, function(){
            var connection = this;
            var connectedNode = graphForTraversal.getNode(connection.id);
            removeVertexInConnections(vertexId, connectedNode.connections);
        });
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
        graphForTraversal.addNode(
            new VertexAsCrowNode(vertex)
        );
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
    function VertexAsCrowNode(vertex){
        this._initialize = function(){};
        crow.ConnectedNode.apply(this, [vertex.getId()]);
    }
    VertexAsCrowNode.prototype = new crow.ConnectedNode;
    return api;
});