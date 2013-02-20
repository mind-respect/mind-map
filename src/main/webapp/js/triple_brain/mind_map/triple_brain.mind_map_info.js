/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "triple_brain.id_uri",
    "triple_brain.user"
],
    function(IdUriUtils, UserService){
        var api={};
        api.uri = function(){
            var username = UserService.authenticatedUserInCache().user_name;
            return encodeURIComponent(
                IdUriUtils.baseUri +
                    username +
                    "/mind_map"
            );
        };
        api.defaultVertexId = function(){
            var username = UserService.authenticatedUserInCache().user_name;
            return IdUriUtils.graphElementIdFromUri(
                IdUriUtils.baseUri + username +
                    '/default'
            );
        };
        return api;
    }
);