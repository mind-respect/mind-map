/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.user_service"
], function ($, UserService) {
    "use strict";
    var api = {};
    api.fork = function(subGraph, callback){
        $.ajax({
            type: 'POST',
            data: JSON.stringify(subGraph),
            url: UserService.getUsersResourceUrl() + "fork",
            contentType: 'application/json'
        }).success(callback);
    };
    return api;
});