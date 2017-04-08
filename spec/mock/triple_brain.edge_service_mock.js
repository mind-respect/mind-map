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
    api.applyDefaultMocks = function(){
        var spies = {};
        spies["remove"] = api.remove();
        spies["addToFarVertex"] = api.addToFarVertex();
        spies["inverse"] = api.inverse();
        spies["changeSourceVertex"] = api.changeSourceVertex();
        spies["changeDestinationVertex"] = api.changeDestinationVertex();
        return spies;
    };
    api.remove = function () {
        return spyOn(EdgeService, "remove").and.callFake(function (edge, callback) {
            EdgeService._removeCallback(
                edge,
                callback
            );
        });
    };
    api.addToFarVertex = function () {
        return spyOn(EdgeService, "_add").and.callFake(function (sourceVertexUri, destinationVertexUri) {
            return $.Deferred().resolve(
                EdgeService._buildAfterAddReturnObject(
                    TestUtils.generateEdgeUri(),
                    sourceVertexUri,
                    destinationVertexUri
                )
            );
        });
    };
    api.inverse = function () {
        return spyOn(
            EdgeService,
            "inverse"
        ).and.callFake(function () {
            return $.Deferred().resolve();
        });
    };
    api.changeSourceVertex = function(){
        return spyOn(
            EdgeService,
            "changeSourceVertex"
        ).and.callFake(function () {
            return $.Deferred().resolve();
        });
    };
    api.changeDestinationVertex = function(){
        return spyOn(
            EdgeService,
            "changeDestinationVertex"
        ).and.callFake(function () {
            return $.Deferred().resolve();
        });
    };
    return api;
});