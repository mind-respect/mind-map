/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_service"
], function (GraphService) {
    "use strict";
    var api = {};
    api.getForCentralBubbleUri = function(serverGraphToReturn){
        return spyOn(GraphService, "getForCentralBubbleUri").and.callFake(function(centerUri, callback){
            callback(serverGraphToReturn);
        });
    };
    api.getForCentralBubbleUriMultiple = function(multiple){
        return spyOn(GraphService, "getForCentralBubbleUri").and.callFake(function(centerUri, callback){
            callback(
                multiple[centerUri]
            );
        });
    };
    return api;
})
;