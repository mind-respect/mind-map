/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain/triple_brain.event_bus",
    "triple_brain/triple_brain.config",
    "jquery/jquery.json.min"
],
    function ($, eventBus, config) {
        var api = {};
        var authenticatedUserInCache = undefined;
        api.authenticatedUserInCache = function () {
            return authenticatedUserInCache;
        }
        api.register = function (userObject) {
            $.ajax({
                type:'POST',
                url:config.links.app + '/service/users/',
                data:$.toJSON(userObject),
                dataType:'json',
                contentType:'application/json;charset=utf-8'
            }).success(function (user) {
                    eventBus.publish(
                        '/event/ui/user/registration/success',
                        userObject
                    );
                }).error(function (xhr) {
                    eventBus.publish(
                        '/event/ui/users/registration/errors',
                        [$.parseJSON(xhr.responseText)]
                    );
                })
        };
        api.authenticatedUser = function (callback) {
            $.ajax({
                type:'GET',
                url:config.links.app + '/service/users/'
            }).success(function (authenticatedUser) {
                    authenticatedUserInCache = authenticatedUser;
                    if (callback != undefined) {
                        callback.call(this, authenticatedUser);
                    }
                    eventBus.publish(
                        '/event/ui/user/get_authenticated/success',
                        authenticatedUser
                    );
                }).error(function () {
                    eventBus.publish(
                        '/event/ui/users/get_authenticated/errors'
                    );
                })
        };
        api.isAuthenticated = function (isAuthenticatedCallBack, isNotAuthenticatedCallBack) {
            $.ajax({
                type:'GET',
                url:config.links.app + '/service/users/is_authenticated'
            }).success(function (isAuthenticated) {
                    isAuthenticated.is_authenticated ?
                        isAuthenticatedCallBack.call() :
                        isNotAuthenticatedCallBack.call()
                }).error(isNotAuthenticatedCallBack)
        };
        api.logout = function (successCallBack) {
            $.ajax({
                type:'GET',
                url:config.links.app + '/service/users/logout'
            }).success(successCallBack)
        }
        return api;
    });