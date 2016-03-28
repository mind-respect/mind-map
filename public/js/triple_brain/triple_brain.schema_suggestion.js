/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.id_uri",
    "triple_brain.graph_element_type",
    "triple_brain.suggestion",
    "triple_brain.vertex_service",
    "triple_brain.schema_service",
    "triple_brain.schema"
], function ($, IdUri, GraphElementType, Suggestion, VertexService, SchemaService, Schema) {
    "use strict";
    var api = {};
    api.addSchemaSuggestionsIfApplicable = function (vertex, resourceUri) {
        var deferred = $.Deferred();
        var suggestions = [];
        if (!IdUri.isSchemaUri(resourceUri)){
            deferred.resolve(suggestions);
            return deferred.promise();
        }
        SchemaService.get(resourceUri, function(serverFormat){
            var schema = Schema.fromServerFormat(serverFormat);
            $.each(schema.getProperties(), function () {
                suggestions.push(
                    Suggestion.fromSchemaPropertyAndOriginUri(
                        this,
                        resourceUri
                    )
                );
            });
            VertexService.addSuggestions(
                vertex,
                suggestions
            ).then(function(){
                deferred.resolve(
                    suggestions
                );
            });
        });
        return deferred;
    };
    return api;
});