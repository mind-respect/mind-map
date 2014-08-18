/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.user"
    ],
    function ($, UserService) {"use strict";
        var api = {};
        api.getForCentralVertexUriAndDepth = function (centralVertexUri, depth, callback) {
            $.ajax({
                type: 'GET',
                url: api.graphUriForCentralVertexUriAndDepth(centralVertexUri, depth)
            }).success(callback);
        };
        api.graphUriForCentralVertexUriAndDepth = function (centerVertexUri, depth) {
            if (isVertexUriOwnedByCurrentUser(centerVertexUri)) {
                return centerVertexUri + '/surround_graph/' + depth;
            } else {
                return convertVertexUriToNonOwnedUri(centerVertexUri);
            }
        };
        return api;
        function isVertexUriOwnedByCurrentUser(uri) {
            return UserService.authenticatedUserInCache().user_name ===
                getOwnerFromUri(uri);
        }

        function getOwnerFromUri(uri) {
            return uri.substring(
                uri.indexOf("/users") + 7,
                uri.indexOf("/graph")
            );
        }

        function convertVertexUriToNonOwnedUri(uri) {
            return "/service/users/" + getOwnerFromUri(uri) +
                "/non_owned/vertex/" + getVertexShortId(uri) +
                "/surround_graph"
        }

        function getVertexShortId(uri){
            return uri.substring(
                uri.indexOf("vertex/") + 7
            );
        }
    }
);
