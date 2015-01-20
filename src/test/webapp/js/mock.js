/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.user",
    "triple_brain.mind_map_info",
    "triple_brain.suggestion_service"
], function (UserService, MindMapInfo, SuggestionService) {
    "use strict";
    var api = {};
    api.setCenterVertexUriInUrl = function(centerVertexUri){
        MindMapInfo._getCenterVertexUriInUrl = function(){
            return centerVertexUri;
        }
    };
    UserService.authenticatedUserInCache = function(){
        return {
            user_name : "foo"
        }
    };
    SuggestionService.accept = function(suggestionUi, callback){
        callback();
    };
    return api;
});