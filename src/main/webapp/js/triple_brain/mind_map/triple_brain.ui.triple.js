/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "triple_brain.id_uri",
    "triple_brain.event_bus",
    "triple_brain.graph_displayer"
],
    function (require, IdUriUtils, EventBus, GraphDisplayer) {
        var api = {};
        api.createUsingServerTripleAndNewVertexPosition = function (tripleJson, newVertexPosition) {
            var Vertex = require("triple_brain.ui.vertex");

            tripleJson.end_vertex.position = {
                x : newVertexPosition.x,
                y : newVertexPosition.y
            };

            var sourceVertex = Vertex.withId(
                IdUriUtils.graphElementIdFromUri(
                    tripleJson.source_vertex.id
                )
            );
            var destinationVertex = GraphDisplayer.addVertex(
                tripleJson.end_vertex,
                sourceVertex
            );
            var edge = GraphDisplayer.addEdge(tripleJson.edge);

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
        }

        function Triple(sourceVertex, edge, destinationVertex) {
            this.sourceVertex = function(){
                return sourceVertex;
            }
            this.edge = function(){
                return edge;
            }
            this.destinationVertex = function(){
                return destinationVertex;
            }
        }
        return api;
    }
);