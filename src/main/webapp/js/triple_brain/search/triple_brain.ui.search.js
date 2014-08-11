/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.graph_displayer",
    "triple_brain.user_map_autocomplete_provider",
    "jquery-ui"
],
    function ($, GraphDisplayer, UserMapAutocompleteProvider) {
        "use strict";
        return {
            init:function() {
                $("#vertex-search-input").empty().tripleBrainAutocomplete({
                    select:function (event, ui) {
                        var vertexUri = ui.item.uri;
                        GraphDisplayer.displayUsingCentralVertexUri(
                            vertexUri
                        );
                    },
                    resultsProviders : [
                        UserMapAutocompleteProvider.toFetchOnlyCurrentUserVertices()
                    ]
                });
            }
        };
    }
);