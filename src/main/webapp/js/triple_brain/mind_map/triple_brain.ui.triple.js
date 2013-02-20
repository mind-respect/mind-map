/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "triple_brain.ui.edge_creator",
    "triple_brain.id_uri",
    "triple_brain.ui.arrow_line",
    "triple_brain.event_bus",
    "triple_brain.graph_displayer"
],
    function (require, EdgeCreator, IdUriUtils, ArrowLine, EventBus, GraphDisplayer) {
        var api = {};
        api.fromServerStatementAndNewVertexPosition = function (tripleJson, newVertexPosition) {
            var VertexHtmlBuilder = require("triple_brain.ui.vertex_html_builder");
            var Vertex = require("triple_brain.ui.vertex");
            var VertexService = require("triple_brain.vertex");
            var Edge = require("triple_brain.ui.edge");
            var EdgeService = require("triple_brain.edge");

            tripleJson.end_vertex.position = {
                x : newVertexPosition.x,
                y : newVertexPosition.y
            };

            var sourceVertex = Vertex.withId(
                IdUriUtils.graphElementIdFromUri(
                    tripleJson.source_vertex.id
                )
            );

            var destinationVertex = VertexHtmlBuilder.withJsonHavingAbsolutePosition(
                tripleJson.end_vertex
            ).create();

            GraphDisplayer.addVertex(
                destinationVertex,
                sourceVertex
            );

            var edge = EdgeCreator.fromServerFormat(
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