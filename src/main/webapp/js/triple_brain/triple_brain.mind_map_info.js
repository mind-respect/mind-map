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
        var api = {};
        api.defaultVertexUri = function () {
            return UserService.currentUserUri() + '/graph/vertex/default'
        };
        api.isCenterVertexUriDefinedInUrl = function(){
            return $.url().param("bubble") !== undefined;
        };
        api.getCenterVertexUriFromUrl = function () {
            var uriInUrl = $.url().param("bubble");
            return uriInUrl === undefined ?
                api.defaultVertexUri() :
                uriInUrl;
        };
        return api;
    }
);