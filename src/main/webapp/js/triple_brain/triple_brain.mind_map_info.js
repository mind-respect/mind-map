/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
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
        api.isCenterBubbleUriDefinedInUrl = function () {
            return api._getCenterVertexUriInUrl() !== undefined;
        };
        api.getCenterBubbleUri = function () {
            var uriInUrl = api._getCenterVertexUriInUrl();
            return uriInUrl === undefined ?
                api.defaultVertexUri() :
                uriInUrl;
        };
        api.isViewOnly = function(){
            if(isViewOnly === undefined){
                isViewOnly = _isAnonymous || !IdUriUtils.isGraphElementUriOwnedByCurrentUser(
                    api._getCenterVertexUriInUrl()
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
        api.isSchemaMode = function(){
            return IdUriUtils.isSchemaUri(
                api._getCenterVertexUriInUrl()
            );
        };
        api._getCenterVertexUriInUrl = function(){
            return $.url().param("bubble");
        };
        return api;
    }
);