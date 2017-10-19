/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery"
], function ($) {
    "use strict";
    var api = {};
    api.accept = function(suggestionUi){
        var vertex = suggestionUi.getParentVertex(),
            serverFormat = suggestionUi.getSuggestion().getServerFormat();
        return $.ajax({
            type: 'POST',
            url: vertex.getUri()+ '/suggestions/accept',
            data: JSON.stringify(serverFormat),
            contentType: 'application/json;charset=utf-8'
        });
    };
    api.remove = function(suggestionsUri, vertex, callback){
        return $.ajax({
            type: 'DELETE',
            url: vertex.getUri()+ '/suggestions',
            data: JSON.stringify(suggestionsUri),
            contentType: 'application/json;charset=utf-8'
        }).then(function(){
            if(callback !== undefined){
                callback();
            }
        });
    };
    return api;
});