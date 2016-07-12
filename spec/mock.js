/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    'test/test-utils',
    "triple_brain.user_service",
    "triple_brain.mind_map_info",
    "triple_brain.suggestion_service",
    "triple_brain.graph_service",
    "triple_brain.schema_service",
    "triple_brain.vertex_service",
    "triple_brain.friendly_resource_service",
    "triple_brain.edge_service",
    "triple_brain.search",
    "triple_brain.id_uri"
], function ($, TestUtils, UserService, MindMapInfo, SuggestionService, GraphService, SchemaService, VertexService, FriendlyResourceService, EdgeService, SearchService, IdUri) {
    "use strict";
    var api = {};
    api.setCenterBubbleUriInUrl = function (centerVertexUri) {
        window.usernameForBublGuru = IdUri.usernameFromUri(
            centerVertexUri
        );
        window.graphElementTypeForBublGuru = IdUri.getGraphElementTypeFromUri(
            centerVertexUri
        );
        window.graphElementShortIdForBublGuru = IdUri.getGraphElementShortIdFromUri(
            centerVertexUri
        );
        IdUri.getGraphElementUriInUrl = function () {
            return centerVertexUri;
        };
    };
    api.setGetGraphFromService = function (graph) {
        GraphService.getForCentralBubbleUri = function (centerVertexUri, callback) {
            callback(
                graph
            );
        };
    };
    api.setGetSchemaFromService = function (schema) {
        SchemaService.get = function (schemaUri, callback) {
            callback(
                schema
            );
        };
    };
    api.getSearchResultDetailsToReturn = function (toReturn) {
        SearchService.getSearchResultDetails = function (uri, callback) {
            callback(toReturn);
        };
    };

    api.mockRemoveEdge = function () {
        return spyOn(EdgeService, "remove").and.callFake(function (edge, callback) {
            callback(edge);
        });
    };
    UserService.authenticatedUserInCache = function () {
        return {
            user_name: "foo"
        };
    };
    VertexService.addSuggestions = function () {
        return $.Deferred().resolve();
    };
    return api;
});