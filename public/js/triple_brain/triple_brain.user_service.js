/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.event_bus"
    ],
    function ($, EventBus) {
        "use strict";
        var api = {},
            usersResourceUrl = "/service/users/",
            sessionResourceUrl = usersResourceUrl + "session/",
            authenticatedUserInCache;

        api.getUsersResourceUrl = function () {
            return usersResourceUrl;
        };

        api.authenticatedUserInCache = function () {
            return authenticatedUserInCache;
        };
        api.setAuthenticatedUserInCache = function (user) {
            authenticatedUserInCache = user;
        };
        api.getDefaultVertexUri = function (username, callback) {
            return $.ajax({
                type: 'GET',
                url: usersResourceUrl + username + "/graph/vertex/any"
            }).done(callback);
        };

        api.currentUserUri = function () {
            return usersResourceUrl + api.authenticatedUserInCache().user_name;
        };
        api.hasCurrentUser = function () {
            return authenticatedUserInCache !== undefined;
        };
        api.authenticate = function (loginInfo, callback, errorCallback) {
            return $.ajax({
                type: 'POST',
                data: JSON.stringify(loginInfo),
                url: sessionResourceUrl,
                contentType: 'application/json'
            }).done(callback)
                .fail(errorCallback);
        };
        api.register = function (userObject, successCallback, errorCallback) {
            return $.ajax({
                type: 'POST',
                url: usersResourceUrl,
                data: JSON.stringify(userObject),
                contentType: 'application/json;charset=utf-8'
            }).done(successCallback)
                .fail(function (xhr) {
                    errorCallback(
                        JSON.parse(xhr.responseText)
                    );
                });
        };
        api.authenticatedUser = function (callback) {
            return $.ajax({
                type: 'GET',
                url: sessionResourceUrl
            }).done(function (authenticatedUser) {
                authenticatedUser.preferred_locales = JSON.parse(
                    authenticatedUser.preferred_locales
                );
                authenticatedUserInCache = authenticatedUser;
                if (callback !== undefined) {
                    callback.call(this, authenticatedUser);
                }
                EventBus.publish(
                    '/event/ui/user/get_authenticated/success',
                    authenticatedUser
                );
            }).fail(function () {
                EventBus.publish(
                    '/event/ui/users/get_authenticated/errors'
                );
            });
        };
        api.isAuthenticated = function (isAuthenticatedCallBack, isNotAuthenticatedCallBack) {
            return $.ajax({
                type: 'GET',
                url: usersResourceUrl + "is_authenticated"
            }).done(function (isAuthenticated) {
                if (isAuthenticated.is_authenticated) {
                    isAuthenticatedCallBack();
                    return;
                }
                isNotAuthenticatedCallBack();
            }).fail(isNotAuthenticatedCallBack);
        };
        api.logout = function (successCallBack) {
            return $.ajax({
                type: 'DELETE',
                url: sessionResourceUrl
            }).done(successCallBack);
        };
        api.resetPassword = function (email, callback, errorCallback) {
            return $.ajax({
                type: 'POST',
                url: "/service/reset-password",
                contentType: 'application/json',
                data: JSON.stringify({email: email})
            }).done(callback).fail(errorCallback);
        };
        api.changePassword = function (password, email, token, callback, errorCallback) {
            return $.ajax({
                type: 'POST',
                url: "/service/users/password",
                contentType: 'application/json',
                data: JSON.stringify({
                    email: email,
                    password: password,
                    token: token
                })
            }).done(callback).fail(errorCallback);
        };
        api.search = function (searchText) {
            return $.ajax({
                type: 'POST',
                data: JSON.stringify({
                    "searchText": searchText
                }),
                contentType: 'application/json;charset=utf-8',
                url: api.currentUserUri() + "/search-users"
            });
        };
        return api;
    }
);
