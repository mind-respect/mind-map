/*
 * Copyright Mozilla Public License 1.1
 */

define([
        "triple_brain.id_uri",
        "triple_brain.user",
        "jquery.url"
    ],
    function (IdUriUtils, UserService) {
        "use strict";
        var api = {},
            isViewOnly;
        api.defaultVertexUri = function () {
            return UserService.currentUserUri() + '/graph/vertex/default'
        };
        api.isCenterVertexUriDefinedInUrl = function () {
            return getCenterVertexUriInUrl() !== undefined;
        };
        api.getCenterVertexUri = function () {
            var uriInUrl = getCenterVertexUriInUrl();
            return uriInUrl === undefined ?
                api.defaultVertexUri() :
                uriInUrl;
        };
        api.isViewOnly = function(){
            if(isViewOnly === undefined){
                isViewOnly = !IdUriUtils.isVertexUriOwnedByCurrentUser(
                    getCenterVertexUriInUrl()
                );
            }
            return isViewOnly;
        };
        return api;
        function getCenterVertexUriInUrl(){
            return $.url().param("bubble");
        }
    }
);