/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/webapp/js/test-utils',
    "triple_brain.user_service",
    "triple_brain.graph_element_service",
    "triple_brain.mind_map_info",
    "triple_brain.suggestion_service",
    "triple_brain.graph_service",
    "triple_brain.schema_service",
    "triple_brain.vertex_service",
    "triple_brain.friendly_resource_service",
    "triple_brain.edge_service",
    "triple_brain.search"
], function (TestUtils, UserService, GraphElementService, MindMapInfo, SuggestionService, GraphService, SchemaService, VertexService, FriendlyResourceService, EdgeService, SearchService) {
    "use strict";
    var api = {};
    api.setCenterVertexUriInUrl = function(centerVertexUri){
        MindMapInfo._getCenterVertexUriInUrl = function(){
            return centerVertexUri;
        }
    };
    api.setGetGraphFromService = function(graph){
        GraphService.getForCentralVertexUri = function(centerVertexUri, callback){
            callback(
                graph
            );
        };
    };
    api.setGetSchemaFromService = function(schema){
        SchemaService.get = function(schemaUri, callback){
            callback(
                schema
            );
        };
    };
    api.getSearchResultDetailsToReturn = function(toReturn){
        SearchService.getSearchResultDetails = function(uri, callback){
            callback(toReturn);
        };
    };

    api.mockUpdateLabel = function(){
        return spyOn(FriendlyResourceService, "updateLabel").andCallFake(function(friendlyResource, label, callback){
            if (callback !== undefined) {
                callback(friendlyResource);
            }
        });
    };
    api.mockAcceptSuggestion = function(){
        return spyOn(SuggestionService, "accept").andCallFake(function(suggestionUi, callback){
            SuggestionService.acceptCallback(
                TestUtils.generateVertexUri(),
                TestUtils.generateEdgeUri(),
                suggestionUi,
                callback
            );
        });
    };
    api.mockRemoveEdge = function(){
        return spyOn(EdgeService, "remove").andCallFake(function(edge, callback){
            callback(edge);
        });
    };
    api.mockAddIdentification = function(){
        return spyOn(GraphElementService, "addIdentification").andCallFake(function(graphElement, identification, callback){
            GraphElementService._addIdentificationCallback(
                graphElement,
                identification,
                identification.getServerFormat(),
                callback
            );
        });
    };
    UserService.authenticatedUserInCache = function(){
        return {
            user_name : "foo"
        }
    };
    VertexService.addSuggestions = function(){};
    return api;
});