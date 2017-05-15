/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.identification"
], function ($, Identification) {
    "use strict";
    var api = {};
    api.getForUri = function(uri){
        return $.ajax({
            type: 'GET',
            url: uri,
            contentType: 'application/json;charset=utf-8'
        }).then(function (serverFormat) {
            return Identification.fromServerFormat(
                serverFormat
            );
        });
    };
    return api;
});