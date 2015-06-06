/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_displayer",
    "triple_brain.vertex",
    "triple_brain.edge"
], function (GraphDisplayer, Vertex, Edge) {
    "use strict";
    var api = {};
    api.createUsingServerTriple = function (sourceVertex, tripleJson) {
        api.createIntoSourceBubble(
            sourceVertex,
            tripleJson
        );
    };
    api.createIntoSourceBubble = function (sourceBubble, tripleJson) {
        return GraphDisplayer.addEdgeAndVertex(
            sourceBubble,
            Edge.fromServerFormat(tripleJson.edge),
            Vertex.fromServerFormat(tripleJson.end_vertex)
        );
    };
    return api;
});