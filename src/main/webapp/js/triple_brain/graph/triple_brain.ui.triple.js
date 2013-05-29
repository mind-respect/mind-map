/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.id_uri",
    "triple_brain.event_bus",
    "triple_brain.graph_displayer"
],
    function (IdUriUtils, EventBus, GraphDisplayer) {
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
                tripleJson.end_vertex,
                sourceVertex
            );
            var edge = GraphDisplayer.addEdge(
                tripleJson.edge,
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