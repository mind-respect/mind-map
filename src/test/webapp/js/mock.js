/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.user_service",
    "triple_brain.mind_map_info",
    "triple_brain.suggestion_service",
    "triple_brain.graph_service",
    "triple_brain.schema_service",
    "triple_brain.vertex_service",
    "triple_brain.search"
], function (UserService, MindMapInfo, SuggestionService, GraphService, SchemaService, VertexService, SearchService) {
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
    api.mockRemoveVertex = function(){
        return spyOn(VertexService, "remove").andCallFake(function(vertex, callback){
            callback(vertex);
        });
    };
    UserService.authenticatedUserInCache = function(){
        return {
            user_name : "foo"
        }
    };
    SuggestionService.accept = function(suggestionUi, callback){
        callback();
    };
    VertexService.addSuggestions = function(){};

    return api;
});