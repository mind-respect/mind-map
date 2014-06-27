/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "triple_brain.id_uri",
    "triple_brain.user"
],
    function(IdUriUtils, UserService){
        "use strict";
        var api={};
        api.defaultVertexUri = function(){
            return UserService.currentUserUri() + '/graph/vertex/default'
        };
        return api;
    }
);