/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.event_bus",
        "jquery.json.min"
    ],
    function ($, EventBus) {
        "use strict";
        var api = {},
            usersResourceUrl = "/service/users/",
            sessionResourceUrl = usersResourceUrl + "session/",
            authenticatedUserInCache = undefined;

        api.getUsersResourceUrl = function(){
            return usersResourceUrl;
        };

        api.authenticatedUserInCache = function () {
            return authenticatedUserInCache;
        };
        api.setAuthenticatedUserInCache = function(user){
            authenticatedUserInCache = user;
        };
        api.getDefaultVertexUri = function(username, callback){
            return $.ajax({
                type: 'GET',
                url: usersResourceUrl + username +  "/graph/vertex/any"
            }).success(callback);
        };

        api.currentUserUri = function () {
            return usersResourceUrl + api.authenticatedUserInCache().user_name;
        };
        api.hasCurrentUser = function(){
            return authenticatedUserInCache !== undefined;
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