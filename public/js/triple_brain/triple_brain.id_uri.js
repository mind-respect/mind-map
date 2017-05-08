/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.user_service",
        "triple_brain.graph_element_type",
        "jquery.url"
    ],
    function ($, UserService, GraphElementType) {
        "use strict";
        var api = {};
        api.encodeUri = function (uri) {
            return encodeURIComponent(
                uri
            );
        };
        api.decodeUri = function (uri) {
            return decodeURIComponent(
                uri
            );
        };
        api.usernameFromUri = function (uri) {
            var segments = $.url(uri).segment();
            return segments[2];
        };
        api.allCentralUrlForUsername = function (username) {
            return "/user/" + username;
        };
        api.encodedUriFromGraphElementId = function (id) {
            return encodeURIComponent(
                api.uriFromGraphElementId(id)
            );
        };
        api.isSchemaUri = function (uri) {
            return uri.indexOf("/schema/") !== -1 &&
                uri.indexOf("/property") === -1;
        };
        api.isPropertyUri = function (uri) {
            return uri.indexOf("/property") !== -1;
        };
        api.isEdgeUri = function (uri) {
            return GraphElementType.Relation === api.getGraphElementTypeFromUri(
                    uri
                );
        };
        api.isPropertyUri = function (uri) {
            return GraphElementType.Property === api.getGraphElementTypeFromUri(
                    uri
                );
        };
        api.isVertexUri = function (uri) {
            return GraphElementType.Vertex === api.getGraphElementTypeFromUri(
                    uri
                );
        };
        api.isMetaUri = function (uri) {
            return GraphElementType.Meta === api.getGraphElementTypeFromUri(
                    uri
                );
        };
        api.schemaUriOfProperty = function (propertyUri) {
            return propertyUri.substr(
                0,
                propertyUri.indexOf("/property")
            );
        };
        api.uriFromGraphElementId = function (id) {
            var username = UserService.authenticatedUserInCache().user_name;
            return "/users" + username + "/" + id;
        };
        api.resourceUriFromAjaxResponse = function (response) {
            return api.removeDomainNameFromGraphElementUri(
                response.getResponseHeader("Location")
            );
        };
        api.removeDomainNameFromGraphElementUri = function (uri) {
            return uri.substr(
                uri.indexOf("/service")
            );
        };
        api.elementIdFromUri = function (uri) {
            return uri.substr(
                uri.lastIndexOf("/") + 1
            );
        };
        api.generateUuid = function () {
            // http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
            var buf = new Uint16Array(8);
            crypto.getRandomValues(buf);
            var S4 = function (num) {
                var ret = num.toString(16);
                while (ret.length < 4) {
                    ret = "0" + ret;
                }
                return ret;
            };
            return (S4(buf[0]) + S4(buf[1]) + "-" + S4(buf[2]) + "-" + S4(buf[3]) + "-" + S4(buf[4]) + "-" + S4(buf[5]) + S4(buf[6]) + S4(buf[7]));
        };
        api.isGraphElementUriOwnedByCurrentUser = function (uri) {
            return UserService.authenticatedUserInCache().user_name ===
                api.getOwnerFromUri(uri);
        };
        api.getOwnerFromUri = function (uri) {
            return uri.substring(
                uri.indexOf("/users") + 7,
                uri.indexOf("/graph")
            );
        };
        api.convertGraphElementUriToNonOwnedUri = function (uri) {
            var end = "schema" === api.getGraphElementTypeFromUri(uri) ?
                "" : "/surround_graph";
            return "/service/users/" +
                api.getOwnerFromUri(uri) +
                "/non_owned/" +
                api.getGraphElementTypeFromUri(uri) + "/" +
                api.getGraphElementShortIdFromUri(uri) +
                end;
        };
        api.getGraphElementTypeFromUri = function (uri) {
            uri = uri.substr(
                0, uri.lastIndexOf("/")
            );
            return GraphElementType.fromString(
                uri.substr(
                    uri.lastIndexOf("/") + 1
                )
            );
        };
        api.getGraphElementShortIdFromUri = function (uri) {
            return uri.substring(
                uri.lastIndexOf("/") + 1
            );
        };

        api.hostNameOfUri = function (uri) {
            return $.url(
                uri
            ).attr("host");
        };
        api.isUriOfAGraphElement = function (uri) {
            return uri.indexOf("/service/users") === 0;
        };
        api._getUsernameInUrl = function () {
            return api._getUrlParamAtIndex(1);
        };
        api._getGraphElementShortIdFromUrl = function () {
            return api._getUrlParamAtIndex(4);
        };
        api._hasUsernameInUrl = function () {
            return api._hasParamAtIndex(1);
        };
        api._hasGraphElementShortIdInUrl = function () {
            return api._hasParamAtIndex(4);
        };
        api.getGraphElementUriInUrl = function () {
            if (!api._hasUsernameInUrl() || !api._hasGraphElementShortIdInUrl()) {
                return undefined;
            }
            return "/service/users/" + api._getUsernameInUrl() +
                "/graph/" + window.graphElementTypeForBublGuru + "/" + api._getGraphElementShortIdFromUrl();
        };
        api.htmlUrlForBubbleUri = function (graphElementUri) {
            if (api.isPropertyUri(graphElementUri)) {
                graphElementUri = api.schemaUriOfProperty(graphElementUri);
            }
            return graphElementUri.replace(
                "/service/users",
                "/user"
            );
        };
        api._hasParamAtIndex = function (index) {
            return decodeURIComponent(
                    window.location.pathname
                ).split("/").length >= index + 1;
        };
        api._getUrlParamAtIndex = function (index) {
            return decodeURIComponent(
                window.location.pathname
            ).split("/")[index + 1];
        };
        return api;

    }
);