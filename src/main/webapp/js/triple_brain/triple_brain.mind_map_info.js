/*
 * Copyright Mozilla Public License 1.1
 */

define([
        "triple_brain.id_uri",
        "triple_brain.user",
        "triple_brain.event_bus",
        "jquery.url"
    ],
    function (IdUriUtils, UserService, EventBus) {
        "use strict";
        var api = {},
            isViewOnly,
            _isAnonymous;
        api.defaultVertexUri = function () {
            return UserService.currentUserUri() + '/graph/vertex/default'
        };
        api.isCenterVertexUriDefinedInUrl = function () {
            return getCenterVertexUriInUrl() !== undefined;
        };
        api.getCenterVertexUri = function () {
            var uriInUrl = getCenterVertexUriInUrl();
            return uriInUrl === undefined ?
                api.defaultVertexUri() :
                uriInUrl;
        };
        api.isViewOnly = function(){
            if(isViewOnly === undefined){
                isViewOnly = _isAnonymous || !IdUriUtils.isVertexUriOwnedByCurrentUser(
                    getCenterVertexUriInUrl()
                );
                EventBus.publish(
                    '/event/ui/mind_map_info/is_view_only',
                    [isViewOnly]
                );
            }
            return isViewOnly;
        };
        api.setIsAnonymous = function(isAnonymous){
            _isAnonymous = isAnonymous;
        };
        api.isAnonymous = function(){
            return _isAnonymous;
        };
        return api;
        function getCenterVertexUriInUrl(){
            return $.url().param("bubble");
        }
    }
);