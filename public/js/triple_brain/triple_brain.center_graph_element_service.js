/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.user_service"
], function ($, UserService) {
    "use strict";
    var api = {};
    api.get = function(callback){
        return $.ajax({
            type: 'GET',
            url: UserService.currentUserUri() + "/center-elements",
            dataType: 'json'
        }).success(callback);
    };
    return api;
});