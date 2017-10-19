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
        return $.ajax({
            type: 'POST',
            data: JSON.stringify(subGraph),
            url: UserService.currentUserUri() + "/fork",
            contentType: 'application/json'
        }).then(callback);
    };
    return api;
});