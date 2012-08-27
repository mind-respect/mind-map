/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "triple_brain.ui.edge_creator",
    "triple_brain.id_uri",
    "triple_brain.ui.arrow_line",
    "triple_brain.event_bus"
],
    function (require, EdgeCreator, IdUriUtils, ArrowLine, EventBus) {
        var api = {};
        api.fromServerStatementAndNewVertexPosition = function (tripleJson, newVertexPosition) {
            var VertexCreator = require("triple_brain.ui.vertex_creator");
            var Vertex = require("triple_brain.ui.vertex");
            var VertexService = require("triple_brain.vertex");
            var Edge = require("triple_brain.ui.edge");
            var EdgeService = require("triple_brain.edge");

            tripleJson.end_vertex.position = {
                x : newVertexPosition.x,
                y : newVertexPosition.y
            };

            var destinationVertex = VertexCreator.withArrayOfJsonHavingAbsolutePosition(
                tripleJson.end_vertex
            ).create();

            var sourceVertex = Vertex.withId(
                IdUriUtils.graphElementIdFromUri(
                    tripleJson.source_vertex.id
                )
            );
            var arrowLine = ArrowLine.ofSourceAndDestinationVertex(
                sourceVertex,
                destinationVertex
            );
            var arrowLineSegment = arrowLine.segment();
            tripleJson.edge.arrowLineStartPoint = arrowLineSegment.startPoint;
            tripleJson.edge.arrowLineEndPoint = arrowLineSegment.endPoint;
            var edge = EdgeCreator.withArrayOfJsonHavingAbsolutePosition(
                tripleJson.edge
            ).create();

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