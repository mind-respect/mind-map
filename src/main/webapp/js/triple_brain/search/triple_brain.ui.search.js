/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.search",
    "triple_brain.graph_displayer",
    "triple_brain.user_map_autocomplete_provider",
    "jquery-ui"
],
    function ($, SearchService, GraphDisplayer, UserMapAutocompleteProvider) {
        "use strict";
        return {
            init:function() {
                $("#vertex-search-input").tripleBrainAutocomplete({
                    select:function (event, ui) {
                        var vertexUri = ui.item.uri;
                        GraphDisplayer.displayUsingNewCentralVertexUri(
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