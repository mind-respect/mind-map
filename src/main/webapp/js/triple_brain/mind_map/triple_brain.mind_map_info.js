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
        return api;
    }
);