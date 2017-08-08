/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.user_service"
], function ($, UserService) {
    "use strict";
    var api = {};
    api.getPublicAndPrivate = function(){
        return $.ajax({
            method: 'GET',
            url: UserService.currentUserUri() + "/center-elements",
            dataType: 'json'
        });
    };
    api.getPublicOnlyForUsername = function(username, callback){
        return $.ajax({
            method: 'GET',
            url: UserService.getUsersResourceUrl() + username + "/center-elements/public",
            dataType: 'json'
        }).success(callback);
    };
    api.removeCentersWithUri = function(centersUri){
        return $.ajax({
            method: 'DELETE',
            url: UserService.currentUserUri() + "/center-elements",
            data:JSON.stringify(centersUri),
            dataType: 'json',
            contentType: 'application/json;charset=utf-8'
        });
    };
    return api;
});