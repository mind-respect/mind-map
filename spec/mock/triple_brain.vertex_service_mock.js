/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.vertex_service",
    "triple_brain.edge",
    "triple_brain.vertex",
    "test/test-utils"
], function (VertexService, Edge, Vertex, TestUtils) {
    "use strict";
    var api = {};
    api.addRelationAndVertexToVertexMock = function () {
        return spyOn(VertexService, "addRelationAndVertexToVertex").and.callFake(function (vertex, sourceBubble, callback) {
            var tripleJson = {};
            tripleJson.source_vertex = vertex.getOriginalServerObject().vertexServerFormat;
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
        return spyOn(VertexService, "remove").and.callFake(function(vertex, callback){
            VertexService._removeVertexCallback(
                vertex,
                callback
            );
        });
    };
    api.makeCollectionPrivate = function(){
        return spyOn(VertexService, "makeCollectionPrivate").and.callFake(function(vertices, callback){
            VertexService._makeCollectionPrivateCallback(
                vertices,
                callback
            );
        });
    };
    api.makeCollectionPublic = function(){
        return spyOn(VertexService, "makeCollectionPublic").and.callFake(function(vertices, callback){
            VertexService._makeCollectionPublicCallback(
                vertices,
                callback
            );
        });
    };
    return api;
})
;