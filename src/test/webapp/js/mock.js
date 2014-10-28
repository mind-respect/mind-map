/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.user",
    "triple_brain.mind_map_info"
], function (UserService, MindMapInfo) {
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
    return api;
});