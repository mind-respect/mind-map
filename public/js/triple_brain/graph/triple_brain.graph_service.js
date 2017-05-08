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
        api.getForCentralBubbleUri = function (centralBubbleUri, callback, errorCallback) {
            $.ajax({
                type: 'GET',
                url: api.graphUriForCentralBubbleUri(centralBubbleUri)
            }).done(callback).fail(errorCallback);
        };
        api.getForCentralVertexUriAtDepth = function (centralVertexUri, depth) {
            return $.ajax({
                type: 'GET',
                url: api.graphUriForCentralBubbleUri(centralVertexUri) + "?depth=" + depth
            });
        };
        api.graphUriForCentralBubbleUri = function (centralBubbleUri) {
            if (!MindMapInfo.isAnonymous() && IdUriUtils.isGraphElementUriOwnedByCurrentUser(centralBubbleUri)) {
                var uri = centralBubbleUri + "/surround_graph";
                if (MindMapInfo.getCenterBubbleUri() === centralBubbleUri) {
                    uri += "?center=true";
                }
                return uri;
            } else {
                return IdUriUtils.convertGraphElementUriToNonOwnedUri(centralBubbleUri);
            }
        };
        return api;
    }
);
