/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_element"
], function (GraphElement) {
    "use strict";
    var api = {};
    api.buildWithUri = function (uri) {
        return {
            vertex: {
                graphElement: GraphElement.buildObjectWithUri(uri)
            }
        };
    };
    api.getFriendlyResourceServerObject = function (serverFormat) {
        return serverFormat.vertex.graphElement.friendlyResource
    };
    return api;
});