/*
 * Copyright Mozilla Public License 1.1
 */
if (triple_brain.ui.triple == undefined) {
    (function ($) {
        var tripleStatic = triple_brain.ui.triple= {};
        tripleStatic.fromServerStatementAndNewVertexPosition = function (tripleJson, newVertexPosition) {
            var vertexCreatorStatic = triple_brain.ui.vertex_creator;
            tripleJson.end_vertex.position = {
                x : newVertexPosition.x,
                y : newVertexPosition.y
            };
            var destinationVertex = vertexCreatorStatic.withArrayOfJsonHavingAbsolutePosition(
                tripleJson.end_vertex
            ).create();

            var sourceVertex = triple_brain.ui.vertex.withId(
                triple_brain.id_uri.graphElementIdFromUri(
                    tripleJson.source_vertex.id
                )
            );
            var arrowLine = triple_brain.ui.arrow_line.ofSourceAndDestinationVertex(
                sourceVertex,
                destinationVertex
            );
            var arrowLineSegment = arrowLine.segment();
            tripleJson.edge.arrowLineStartPoint = arrowLineSegment.startPoint;
            tripleJson.edge.arrowLineEndPoint = arrowLineSegment.endPoint;
            var edge = triple_brain.ui.edge_creator.withArrayOfJsonHavingAbsolutePosition(
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
    })(jQuery);
}