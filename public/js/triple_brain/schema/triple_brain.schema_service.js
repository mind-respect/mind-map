/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.user_service",
    "triple_brain.id_uri",
    "triple_brain.mind_map_info"
], function ($, UserService, IdUri, MindMapInfo) {
    "use strict";
    var api = {},
        baseUri;
    api.create = function (callback) {
        return $.ajax({
            type: 'POST',
            url: getBaseUri()
        }).then(function (data, textStatus, jqXHR) {
            callback(
                IdUri.resourceUriFromAjaxResponse(
                    jqXHR
                )
            );
        });
    };
    api.get = function(uri, callback){
        return $.ajax({
            type: 'GET',
            url: adaptSchemaUri(uri)
        }).then(callback);
    };
    api.list = function(callback){
        return $.ajax({
            type: 'GET',
            url: "/service/schemas"
        }).then(callback);
    };
    api.createProperty = function(schema, callback){
        return $.ajax({
            type: 'POST',
            url: schema.getUri() + "/property"
        }).then(function (data, textStatus, jqXHR) {
            callback(
                IdUri.resourceUriFromAjaxResponse(
                    jqXHR
                )
            );
        });
    };
    return api;
    function getBaseUri(){
        if(baseUri === undefined){
            baseUri = UserService.currentUserUri() + "/graph/schema";
        }
        return baseUri;
    }
    function adaptSchemaUri(uri){
        if (MindMapInfo.isAnonymous() || !IdUri.isGraphElementUriOwnedByCurrentUser(uri)) {
            return IdUri.convertGraphElementUriToNonOwnedUri(uri);
        }
        return uri;
    }
});