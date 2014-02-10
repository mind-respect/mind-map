/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.id_uri",
    "triple_brain.event_bus",
    "triple_brain.graph_displayer",
    "triple_brain.vertex_server_facade",
    "triple_brain.edge_server_facade"
],
    function (IdUriUtils, EventBus, GraphDisplayer, VertexServerFacade, EdgeServerFacade) {
        var api = {};
        api.createUsingServerTriple = function (sourceVertex, tripleJson) {
            var dummyPosition = {
                x: 0,
                y: 0
            };
            api.createUsingServerTripleAndNewVertexPosition(
                sourceVertex,
                tripleJson,
                dummyPosition
            );
        };
        api.createUsingServerTripleAndNewVertexPosition = function (sourceVertex, tripleJson, newVertexPosition) {
            tripleJson.end_vertex.position = {
                x : newVertexPosition.x,
                y : newVertexPosition.y
            };

            var destinationVertex = GraphDisplayer.addVertex(
                VertexServerFacade.fromServerFormat(tripleJson.end_vertex),
                sourceVertex
            );
            var edge = GraphDisplayer.addEdge(
                EdgeServerFacade.fromServerFormat(tripleJson.edge),
                sourceVertex,
                destinationVertex
            );
            var newTriple  = new Triple(
                sourceVertex,
                edge,
                destinationVertex
            );
            EventBus.publish(
                '/event/ui/graph/vertex_and_relation/added/',
                [newTriple]
            );
            return newTriple;
        };

        function Triple(sourceVertex, edge, destinationVertex) {
            this.sourceVertex = function(){
                return sourceVertex;
            };
            this.edge = function(){
                return edge;
            };
            this.destinationVertex = function(){
                return destinationVertex;
            };
            this.serverFormat = function(){
                return {

                };
            };
        }
        return api;
    }
);