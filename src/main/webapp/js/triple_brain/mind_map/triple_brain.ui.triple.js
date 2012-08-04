/*
 * Copyright Mozilla Public License 1.1
 */
if (triple_brain.ui.triple == undefined) {
    (function ($) {
        var tripleStatic = triple_brain.ui.triple= {};
        tripleStatic.fromServerStatementAndNewVertexPosition = function (tripleJson, newVertexPosition) {
            var sourceVertex = triple_brain.ui.vertex.withId(
                triple_brain.id_uri.idFromUri(
                    tripleJson.source_vertex.id
                )
            );
            var vertexCreatorStatic = triple_brain.ui.vertex_creator;
            var destinationVertexId = tripleJson.end_vertex.id;
            var edgeId = tripleJson.edge.id;

            var vertexJSON = {};
            vertexJSON.id = destinationVertexId;
            vertexJSON.label = vertexStatic.EMPTY_LABEL;
            vertexJSON.suggestions = [];
            vertexJSON.position = {};
            vertexJSON.position.x = newVertexPosition.x;
            vertexJSON.position.y = newVertexPosition.y;

            var destinationVertex = vertexCreatorStatic.withArrayOfJsonHavingAbsolutePosition(
                vertexJSON
            ).create();

            var type = tripleJson.end_vertex.type;
            if (type != undefined) {
                triple_brain.vertex.updateType(destinationVertex, type);
            }

            var edgeJSON = {};
            edgeJSON.id = edgeId;
            var arrowLine = triple_brain.ui.arrow_line.ofSourceAndDestinationVertex(
                sourceVertex,
                destinationVertex
            );
            edgeJSON.arrowLineStartPoint = arrowLine.segment().startPoint;
            edgeJSON.arrowLineEndPoint = arrowLine.segment().endPoint;
            edgeJSON.source_vertex_id = tripleJson.source_vertex.id;
            edgeJSON.destination_vertex_id = tripleJson.end_vertex.id;
            edgeJSON.label = triple_brain.ui.edge.EMPTY_LABEL;
            var edge = triple_brain.ui.edge_creator.withArrayOfJsonHavingAbsolutePosition(edgeJSON).create();
            if (tripleJson.edge.label != undefined) {
                edge.setText(tripleJson.edge.label);
                triple_brain.edge.updateLabel(edge, edge.text());
            }
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