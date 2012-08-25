/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "triple_brain/mind_map/desktop/edge/triple_brain.ui.edge_creator",
    "triple_brain/triple_brain.id_uri",
    "triple_brain/mind_map/desktop/edge/triple_brain.ui.arrow_line"
],
    function (require, EdgeCreator, IdUriUtils, ArrowLine) {
        var api = {};
        api.fromServerStatementAndNewVertexPosition = function (tripleJson, newVertexPosition) {
            var VertexCreator = require("triple_brain/mind_map/desktop/vertex/triple_brain.ui.vertex_creator");
            var Vertex = require("triple_brain/mind_map/desktop/vertex/triple_brain.ui.vertex");
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
            return new Triple(
                sourceVertex,
                edge,
                destinationVertex
            );
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