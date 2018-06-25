/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.user_service"
], function ($, UserService) {
    "use strict";
    var api = {};
    api.list = function () {
        return $.ajax({
            method: 'GET',
            url: UserService.currentUserUri() + "/friends",
            contentType: 'application/json'
        });
    };
    api.addFriend = function (username) {
        return $.ajax({
            method: 'POST',
            data: JSON.stringify({
                friendUsername: username
            }),
            url: UserService.currentUserUri() + "/friends",
            contentType: 'application/json'
        });
    };
    api.confirmFriendshipUsingUrlToken = function (url) {
        return $.ajax({
            method: 'POST',
            data: JSON.stringify({
                requestUsername: url.searchParams.get("requestUser"),
                destinationUsername: url.searchParams.get("destinationUser"),
                confirmToken: url.searchParams.get("confirm-token")
            }),
            url: UserService.getUsersResourceUrl() + "confirm-friendship-with-token",
            contentType: 'application/json'
        });
    };
    api.getStatusWithUser = function (username) {
        return $.ajax({
            method: 'GET',
            url: UserService.currentUserUri() + "/friends/" + username + "/status",
            contentType: 'application/json'
        });
    };
    return api;
});
