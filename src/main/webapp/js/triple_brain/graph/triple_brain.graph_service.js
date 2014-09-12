/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
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
        api.graphUriForCentralVertexUri = function (centerVertexUri) {
            if (!MindMapInfo.isAnonymous() && IdUriUtils.isGraphElementUriOwnedByCurrentUser(centerVertexUri)) {
                return centerVertexUri + "/surround_graph";
            } else {
                return IdUriUtils.convertVertexUriToNonOwnedUri(centerVertexUri);
            }
        };
        return api;
    }
);
