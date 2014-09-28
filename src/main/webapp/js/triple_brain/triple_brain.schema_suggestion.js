/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.id_uri",
    "triple_brain.suggestion",
    "triple_brain.vertex_service"
], function (IdUri, Suggestion, VertexService) {
    "use strict";
    var api = {};
    api.addSchemaSuggestionsIfApplicable = function(vertex, searchResult){
        if(IdUri.isSchemaUri(searchResult.uri)){
            var suggestions = [];
            $.each(searchResult.nonFormattedSearchResult.getProperties(), function(){
                suggestions.push(
                    Suggestion.fromSchemaPropertyAndOriginUri(
                        this,
                        searchResult.uri
                    )
                );
            });
            VertexService.addSuggestions(
                vertex,
                suggestions
            );
        }
    };
    return api;
});