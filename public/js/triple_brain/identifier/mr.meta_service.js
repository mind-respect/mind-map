/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.identification",
    "triple_brain.id_uri"
], function ($, Identification, IdUri) {
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

    api.mergeTo = function (identifier, distantTagUri) {
        return $.ajax({
            type: 'POST',
            url: identifier.getUri() + '/mergeTo/' + IdUri.getGraphElementShortIdFromUri(
                distantTagUri
            ),
            dataType: 'json'
        });
    };
    return api;
});