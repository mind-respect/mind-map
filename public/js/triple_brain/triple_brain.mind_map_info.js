/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.id_uri",
        "triple_brain.user_service",
        "triple_brain.event_bus",
        "mr.friend-service",
        "jquery.url"
    ],
    function ($, IdUri, UserService, EventBus, FriendService) {
        "use strict";
        var api = {},
            _isViewOnly,
            _isAnonymous,
            _isTagCloudFlow = false,
            _isAuthenticatedLandingPageFlow = false,
            _isFriend = false;
        api.defaultVertexUri = function () {
            return UserService.currentUserUri() + '/graph/vertex/any';
        };
        api.isCenterBubbleUriDefinedInUrl = function () {
            return IdUri.getGraphElementUriInUrl() !== undefined;
        };
        api.isLandingPageFlow = function () {
            return "landing" === mrFlow;
        };
        api.isSchemaListFlow = function () {
            return "schemaList" === mrFlow;
        };
        api.getCenterBubbleUri = function () {
            return IdUri.getGraphElementUriInUrl();
        };
        api.isViewOnly = function () {
            api.defineIsViewOnly();
            return _isViewOnly;
        };
        api.defineIsViewOnly = function () {
            if (_isViewOnly !== undefined) {
                return;
            }
            _isViewOnly = _isTagCloudFlow || _isAuthenticatedLandingPageFlow ?
                false : _isAnonymous || !IdUri.isGraphElementUriOwnedByCurrentUser(
                IdUri.getGraphElementUriInUrl()
            );

            EventBus.publish(
                '/event/ui/mind_map_info/is_view_only',
                [_isViewOnly]
            );
        };

        api.defineIsFriend = function () {
            return FriendService.getStatusWithUser(
                IdUri.currentUsernameInUrl()
            ).then(function (status) {
                _isFriend = status.status === 'confirmed';
            });
        };

        api.isFriend = function () {
            return _isFriend;
        };

        api.setIsTagCloudFlow = function (isTagCloudFlow) {
            _isTagCloudFlow = isTagCloudFlow;
        };

        api.isTagCloudFlow = function () {
            return _isTagCloudFlow;
        };
        api.setIsAuthenticatedLandingPageFlow = function (isAuthenticatedLandingPageFlow) {
            _isAuthenticatedLandingPageFlow = isAuthenticatedLandingPageFlow;
        };
        api.isAuthenticatedLandingPageFlow = function () {
            return _isAuthenticatedLandingPageFlow;
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
            return IdUri.isSchemaUri(
                IdUri.getGraphElementUriInUrl()
            );
        };
        api.isInCompareMode = function () {
            var $compareFlowWarning = $(
                "#compare-flow-warning"
            );
            return $compareFlowWarning.length > 0 && !$compareFlowWarning.hasClass(
                "hidden"
            );
        };
        return api;
    }
);
