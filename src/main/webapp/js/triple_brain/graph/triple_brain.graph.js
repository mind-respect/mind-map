/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.id_uri"
    ],
    function ($, IdUriUtils) {
        "use strict";
        var api = {};
        api.getForCentralVertexUriAndDepth = function (centralVertexUri, depth, callback) {
            $.ajax({
                type: 'GET',
                url: api.graphUriForCentralVertexUriAndDepth(centralVertexUri, depth)
            }).success(callback);
        };
        api.graphUriForCentralVertexUriAndDepth = function (centerVertexUri, depth) {
            if (IdUriUtils.isVertexUriOwnedByCurrentUser(centerVertexUri)) {
                return centerVertexUri + '/surround_graph/' + depth;
            } else {
                return IdUriUtils.convertVertexUriToNonOwnedUri(centerVertexUri);
            }
        };
        return api;
    }
);
