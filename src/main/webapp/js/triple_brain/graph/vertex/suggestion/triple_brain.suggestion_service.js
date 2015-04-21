/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "jquery"
], function ($) {
    "use strict";
    var api = {};
    api.accept = function(suggestionUi, callback){
        var vertex = suggestionUi.getParentVertex(),
            serverFormat = suggestionUi.getServerFormat();
        $.ajax({
            type: 'POST',
            url: vertex.getUri()+ '/suggestions/accept',
            data: $.toJSON(serverFormat),
            contentType: 'application/json;charset=utf-8'
        }).success(function(xhr){
            api.acceptCallback(
                xhr.vertex_uri,
                xhr.edge_uri,
                suggestionUi,
                callback
            );
        });
    };
    api.acceptCallback = function(vertexUri, edgeUri, suggestionUi, callback){
        var vertexUi = suggestionUi.integrate(vertexUri);
        suggestionUi.getRelationWithUiParent().integrate(
            edgeUri,
            vertexUi
        );
        if(callback !== undefined){
            callback(
                vertexUi
            );
        }
    };
    api.remove = function(suggestionsUri, vertex, callback){
        $.ajax({
            type: 'POST',
            url: vertex.getUri()+ '/suggestions/delete',
            data: $.toJSON(suggestionsUri),
            contentType: 'application/json;charset=utf-8'
        }).success(function(){
            if(callback !== undefined){
                callback();
            }
        });
    };
    return api;
});