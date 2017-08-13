/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_service"
], function (GraphService) {
    "use strict";
    var api = {};
    api.getForCentralBubbleUri = function(serverGraphToReturn, spy){
        spy = spy || spyOn(GraphService, "getForCentralBubbleUri");
        return spy.and.callFake(function(centerUri, callback){
            callback(serverGraphToReturn);
        });
    };
    api.getForCentralBubbleUriAndGraph = function(uri, serverGraphToReturn){
        var multipleGraphs = {};
        multipleGraphs[uri] = serverGraphToReturn;
        return api.getForCentralBubbleUriMultiple(
            multipleGraphs
        );
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