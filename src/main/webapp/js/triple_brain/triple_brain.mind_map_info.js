/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "triple_brain.id_uri",
        "triple_brain.user_service",
        "triple_brain.event_bus",
        "jquery.url"
    ],
    function (IdUriUtils, UserService, EventBus) {
        "use strict";
        var api = {},
            _isViewOnly,
            _isAnonymous;
        api.htmlUrlForBubbleUri = function (bubbleUri) {
            return window.location.origin + "?bubble=" + bubbleUri;
        };
        api.defaultVertexUri = function () {
            return UserService.currentUserUri() + '/graph/vertex/any'
        };
        api.isCenterBubbleUriDefinedInUrl = function () {
            return api._getCenterVertexUriInUrl() !== undefined;
        };
        api.getCenterBubbleUri = function () {
            return api._getCenterVertexUriInUrl();
        };
        api.isViewOnly = function () {
            api.defineIsViewOnlyIfUndefined();
            return _isViewOnly;
        };
        api.defineIsViewOnlyIfUndefined = function () {
            if (_isViewOnly !== undefined) {
                return;
            }
            _isViewOnly = _isAnonymous || !IdUriUtils.isGraphElementUriOwnedByCurrentUser(
                api._getCenterVertexUriInUrl()
            );
            EventBus.publish(
                '/event/ui/mind_map_info/is_view_only',
                [_isViewOnly]
            );
        };
        api.setIsAnonymous = function (isAnonymous) {
            _isAnonymous = isAnonymous;
        };
        api.isAnonymous = function () {
            return _isAnonymous;
        };
        api._setIsViewOnly = function (isViewOnly) {
            _isViewOnly = isViewOnly;
        };
        api.isSchemaMode = function () {
            return IdUriUtils.isSchemaUri(
                api._getCenterVertexUriInUrl()
            );
        };
        api._getCenterVertexUriInUrl = function () {
            return $.url().param("bubble");
        };
        return api;
    }
);