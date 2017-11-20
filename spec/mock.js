/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    'test/test-utils',
    "test/mock/triple_brain.user_service_mock",
    "test/mock/triple_brain.edge_service_mock",
    "test/mock/triple_brain.vertex_service_mock",
    "test/mock/triple_brain.graph_element_service_mock",
    "test/mock/triple_brain.friendly_resource_service_mock",
    "test/mock/mr.wikidata_mock",
    "test/mock/mr.bubble_delete_menu_mock",
    "triple_brain.mind_map_info",
    "triple_brain.suggestion_service",
    "triple_brain.graph_service",
    "triple_brain.schema_service",
    "triple_brain.vertex_service",
    "triple_brain.friendly_resource_service",
    "triple_brain.edge_service",
    "triple_brain.search",
    "triple_brain.id_uri"
], function ($, TestUtils, UserServiceMock, EdgeServiceMock, VertexServiceMock, GraphElementServiceMock, FriendlyResourceServiceMock, WikidataMock, BubbleDeleteMenuMock, MindMapInfo, SuggestionService, GraphService, SchemaService, VertexService, FriendlyResourceService, EdgeService, SearchService, IdUri) {
    "use strict";
    var api = {};
    var spies = {};
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
    api.applyDefaultMocks = function () {
        spies["UserService"] = {
            mocker: UserServiceMock ,
            spies: UserServiceMock.applyDefaultMocks()
        };
        spies["EdgeService"] = {
            mocker: EdgeServiceMock,
            spies: EdgeServiceMock.applyDefaultMocks()
        };
        spies["VertexService"] = {
            mocker: VertexServiceMock,
            spies: VertexServiceMock.applyDefaultMocks()
        };
        spies["GraphElementService"] = {
            mocker: GraphElementServiceMock,
            spies: GraphElementServiceMock.applyDefaultMocks()
        };
        spies["FriendlyResourceService"] = {
            mocker: FriendlyResourceServiceMock,
            spies: FriendlyResourceServiceMock.applyDefaultMocks()
        };
        spies["Wikidata"] = {
            mocker: WikidataMock,
            spies: WikidataMock.applyDefaultMocks()
        };
        spies["BubbleDeleteMenu"] = {
            mocker: BubbleDeleteMenuMock,
            spies: BubbleDeleteMenuMock.applyDefaultMocks()
        };
    };
    api.getSpy = function (object, method) {
        return spies[object].spies[method];
    };
    api.resetSpy = function(object, method){
        api.getSpy(object, method).calls.reset();
    };
    api.newSpy = function (object, method, args) {
        api.resetSpy(object, method);
        return spies[object].mocker[method].apply(this, args);
    };
    VertexService.addSuggestions = function () {
        return $.Deferred().resolve();
    };
    return api;
});