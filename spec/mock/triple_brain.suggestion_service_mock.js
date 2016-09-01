/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    'test/test-utils',
    "triple_brain.suggestion_service"
], function ($, TestUtils, SuggestionService) {
    "use strict";
    var api = {};
    api.accept = function () {
        return spyOn(SuggestionService, "accept").and.callFake(function () {
            var deferred = $.Deferred();
            return deferred.resolve({
                vertex_uri: TestUtils.generateVertexUri(),
                edge_uri: TestUtils.generateEdgeUri()
            });
        });
    };
    return api;
});