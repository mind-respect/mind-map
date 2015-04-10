/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.id_uri",
    "triple_brain.graph_element_type",
    "triple_brain.suggestion",
    "triple_brain.vertex_service"
], function ($, IdUri, GraphElementType, Suggestion, VertexService) {
    "use strict";
    var api = {};
    api.addSchemaSuggestionsIfApplicable = function (vertex, searchResult) {
        var suggestions = [],
            originalSearchResult = searchResult.nonFormattedSearchResult;
        if (!originalSearchResult.is(GraphElementType.Schema)) {
            return suggestions;
        }
        $.each(originalSearchResult.getGraphElement().getProperties(), function () {
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
        return suggestions;
    };
    return api;
});