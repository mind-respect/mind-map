/**
 * Copyright Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.event_bus",
        "jquery.json.min"
    ],
    function ($, EventBus) {
        "use strict";
        var api = {};
        var usersResourceUrl = "/service/users/";
        var sessionResourceUrl = usersResourceUrl + "session/";
        var authenticatedUserInCache = undefined;
        api.authenticatedUserInCache = function () {
            return authenticatedUserInCache;
        };
        api.currentUserUri = function () {
            return usersResourceUrl + authenticatedUserInCache.user_name;
        };
        api.authenticate = function (loginInfo, callback, errorCallback) {
            $.ajax({
                type: 'POST',
                data: $.toJSON(loginInfo),
                url: sessionResourceUrl,
                contentType: 'application/json'
            }).success(callback)
                .error(errorCallback);
        };
        api.register = function (userObject, successCallback, errorCallback) {
            $.ajax({
                type: 'POST',
                url: usersResourceUrl,
                data: $.toJSON(userObject),
                contentType: 'application/json;charset=utf-8'
            }).success(successCallback)
                .error(function (xhr) {
                    errorCallback(
                        $.parseJSON(xhr.responseText)
                    );
                });
        };
        api.authenticatedUser = function (callback) {
            $.ajax({
                type: 'GET',
                url: sessionResourceUrl
            }).success(function (authenticatedUser) {
                authenticatedUser.preferred_locales = $.parseJSON(
                    authenticatedUser.preferred_locales
                );
                authenticatedUserInCache = authenticatedUser;
                if (callback != undefined) {
                    callback.call(this, authenticatedUser);
                }
                EventBus.publish(
                    '/event/ui/user/get_authenticated/success',
                    authenticatedUser
                );
            }).error(function () {
                EventBus.publish(
                    '/event/ui/users/get_authenticated/errors'
                );
            });
        };
        api.isAuthenticated = function (isAuthenticatedCallBack, isNotAuthenticatedCallBack) {
            $.ajax({
                type: 'GET',
                url: usersResourceUrl + "is_authenticated"
            }).success(function (isAuthenticated) {
                isAuthenticated.is_authenticated ?
                    isAuthenticatedCallBack() :
                    isNotAuthenticatedCallBack()
            }).error(isNotAuthenticatedCallBack);
        };
        api.logout = function (successCallBack) {
            $.ajax({
                type: 'DELETE',
                url: sessionResourceUrl
            }).success(successCallBack);
        };
        return api;
    }
);