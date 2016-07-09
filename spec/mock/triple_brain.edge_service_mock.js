/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-utils",
    "triple_brain.edge_service"
], function (TestUtils, EdgeService) {
    "use strict";
    var api = {};
    api.remove = function () {
        return spyOn(EdgeService, "remove").and.callFake(function (edge, callback) {
            EdgeService._removeCallback(
                edge,
                callback
            );
        });
    };
    api.addToFarVertex = function () {
        return spyOn(EdgeService, "_add").and.callFake(function (sourceVertexUri, destinationVertexUri, callback) {
            EdgeService._addCallback(
                TestUtils.generateEdgeUri(),
                sourceVertexUri,
                destinationVertexUri,
                callback
            );
        });
    };
    return api;
});