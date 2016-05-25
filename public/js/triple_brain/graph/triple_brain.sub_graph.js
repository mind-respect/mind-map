/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.edge_ui",
    "triple_brain.vertex_ui",
    "triple_brain.edge",
    "triple_brain.vertex"
], function (EdgeUi, VertexUi, Edge, Vertex) {
    "use strict";
    var api = {};
    api.buildServerFormat = function(){
        var edges = {},
            vertices = {};
        EdgeUi.visitAllEdges(function (edgeUi) {
            edges[edgeUi.getUri()] = Edge.buildServerFormatFromUi(
                edgeUi
            );
        });
        VertexUi.visitAllVertices(function (vertexUi) {
            vertices[vertexUi.getUri()] = Vertex.buildServerFormatFromUi(
                vertexUi
            );
        });
        return {
            edges: edges,
            vertices: vertices
        };
    };
    return api;
});