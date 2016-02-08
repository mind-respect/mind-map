/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.id_uri",
        "triple_brain.user_service",
        "triple_brain.event_bus",
        "jquery.url"
    ],
    function ($, IdUriUtils, UserService, EventBus) {
        "use strict";
        var api = {},
            _isViewOnly,
            _isAnonymous,
            _isTagCloudFlow = false;
        api.defaultVertexUri = function () {
            return UserService.currentUserUri() + '/graph/vertex/any';
        };
        api.isCenterBubbleUriDefinedInUrl = function () {
            return IdUriUtils.getGraphElementUriInUrl() !== undefined;
        };
        api.getCenterBubbleUri = function () {
            return IdUriUtils.getGraphElementUriInUrl();
        };
        api.isViewOnly = function () {
            api.defineIsViewOnlyIfItsUndefined();
            return _isViewOnly;
        };
        api.defineIsViewOnlyIfItsUndefined = function () {
            if (_isViewOnly !== undefined) {
                return;
            }
            _isViewOnly = _isTagCloudFlow ?
                false : _isAnonymous || !IdUriUtils.isGraphElementUriOwnedByCurrentUser(
                IdUriUtils.getGraphElementUriInUrl()
            );
            EventBus.publish(
                '/event/ui/mind_map_info/is_view_only',
                [_isViewOnly]
            );
        };

        api.setIsTagCloudFlow = function (isTagCloudFlow) {
            _isTagCloudFlow = isTagCloudFlow;
        };

        api.isTagCloudFlow = function () {
            return _isTagCloudFlow;
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
                IdUriUtils.getGraphElementUriInUrl()
            );
        };
        return api;
    }
);