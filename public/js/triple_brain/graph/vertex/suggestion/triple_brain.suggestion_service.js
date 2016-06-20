/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery"
], function ($) {
    "use strict";
    var api = {};
    api.accept = function(suggestionUi, callback){
        var vertex = suggestionUi.getParentVertex(),
            serverFormat = suggestionUi.getSuggestion().getServerFormat();
        $.ajax({
            type: 'POST',
            url: vertex.getUri()+ '/suggestions/accept',
            data: JSON.stringify(serverFormat),
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
        var newVertexUi = suggestionUi.integrateUsingNewVertexAndEdgeUri(
            vertexUri,
            edgeUri
        );
        if(callback !== undefined){
            callback(
                newVertexUi
            );
        }
    };
    api.remove = function(suggestionsUri, vertex, callback){
        $.ajax({
            type: 'DELETE',
            url: vertex.getUri()+ '/suggestions',
            data: JSON.stringify(suggestionsUri),
            contentType: 'application/json;charset=utf-8'
        }).success(function(){
            if(callback !== undefined){
                callback();
            }
        });
    };
    return api;
});