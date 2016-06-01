/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.id_uri",
        "triple_brain.mind_map_info"
    ],
    function ($, IdUriUtils, MindMapInfo) {
        "use strict";
        var api = {};
        api.getForCentralVertexUri = function (centralVertexUri, callback, errorCallback) {
            $.ajax({
                type: 'GET',
                url: api.graphUriForCentralVertexUri(centralVertexUri)
            }).success(callback).error(errorCallback);
        };
        api.getForCentralVertexUriAtDepth = function (centralVertexUri, depth) {
            return $.ajax({
                type: 'GET',
                url: api.graphUriForCentralVertexUri(centralVertexUri) + "?depth=" + depth
            });
        };
        api.graphUriForCentralVertexUri = function (centerVertexUri) {
            if (!MindMapInfo.isAnonymous() && IdUriUtils.isGraphElementUriOwnedByCurrentUser(centerVertexUri)) {
                var uri = centerVertexUri + "/surround_graph";
                if (MindMapInfo.getCenterBubbleUri() === centerVertexUri) {
                    uri += "?center=true";
                }
                return uri;
            } else {
                return IdUriUtils.convertVertexUriToNonOwnedUri(centerVertexUri);
            }
        };
        return api;
    }
);
