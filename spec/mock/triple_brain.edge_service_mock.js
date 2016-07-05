/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.edge_service"
], function (EdgeService) {
    "use strict";
    var api = {};
    api.remove = function(){
        return spyOn(EdgeService, "remove").and.callFake(function(edge, callback){
            EdgeService._removeCallback(
                edge,
                callback
            );
        });
    };
    return api;
});