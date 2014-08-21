/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.id_uri",
        "triple_brain.mind_map_info"
    ],
    function ($, IdUriUtils, MindMapInfo) {
        "use strict";
        var api = {};
        api.getForCentralVertexUriAndDepth = function (centralVertexUri, depth, callback, errorCallback) {
            $.ajax({
                type: 'GET',
                url: api.graphUriForCentralVertexUriAndDepth(centralVertexUri, depth)
            }).success(callback).error(errorCallback);
        };
        api.graphUriForCentralVertexUriAndDepth = function (centerVertexUri, depth) {
            if (!MindMapInfo.isAnonymous() && IdUriUtils.isVertexUriOwnedByCurrentUser(centerVertexUri)) {
                return centerVertexUri + '/surround_graph/' + depth;
            } else {
                return IdUriUtils.convertVertexUriToNonOwnedUri(centerVertexUri);
            }
        };
        return api;
    }
);
