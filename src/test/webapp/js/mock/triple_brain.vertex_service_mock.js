/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.vertex_service",
    "triple_brain.edge",
    "triple_brain.vertex",
    "test/webapp/js/test-utils"
], function (VertexService, Edge, Vertex, TestUtils) {
    "use strict";
    var api = {};
    api.addRelationAndVertexToVertex = function () {
        return spyOn(VertexService, "addRelationAndVertexToVertex").andCallFake(function (vertex, sourceBubble, callback) {
            var tripleJson = {};
            tripleJson.source_vertex = vertex.getOriginalServerObject().vertexServerFormat
            var newVertexUri = TestUtils.generateVertexUri();
            tripleJson.end_vertex = Vertex.buildServerFormatFromUri(newVertexUri);
            tripleJson.edge = Edge.buildObjectWithUriOfSelfSourceAndDestinationVertex(
                TestUtils.generateEdgeUri(),
                vertex.getUri(),
                newVertexUri
            );
            VertexService._addRelationAndVertexToVertexCallback(
                tripleJson,
                sourceBubble,
                callback
            );
        });
    };
    api.removeVertex = function(){
        return spyOn(VertexService, "remove").andCallFake(function(vertex, callback){
            callback(vertex);
        });
    };
    return api;
})
;