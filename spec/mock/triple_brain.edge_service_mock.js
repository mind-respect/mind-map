/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "test/test-utils",
    "triple_brain.edge_service"
], function ($, TestUtils, EdgeService) {
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
    api.inverse = function () {
        spyOn(
            EdgeService,
            "inverse"
        ).and.callFake(function () {
            return $.Deferred().resolve();
        });
    };
    api.changeSourceVertex = function(){
        spyOn(
            EdgeService,
            "changeSourceVertex"
        ).and.callFake(function () {
            return $.Deferred().resolve();
        });
    };
    return api;
});