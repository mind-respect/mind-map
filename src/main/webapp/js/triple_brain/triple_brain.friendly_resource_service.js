/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "jquery"
], function ($) {
    "use strict";
    var api = {};
    api.updateLabel = function(friendlyResource, label, callback){
        $.ajax({
            type: 'POST',
            url: friendlyResource.getUri() + '/label',
            data: $.toJSON({content: label}),
            contentType: 'application/json;charset=utf-8'
        }).success(function () {
            if (callback !== undefined) {
                callback(friendlyResource);
            }
        });
    };
    api.remove = function(friendlyResource, callback){
        $.ajax({
            type: 'DELETE',
            url: friendlyResource.getUri()
        }).success(callback);
    };
    return api;
});