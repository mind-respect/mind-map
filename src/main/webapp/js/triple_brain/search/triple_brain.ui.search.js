/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.search",
    "triple_brain.graph_displayer",
    "jquery-ui"
],
    function ($, SearchService, GraphDisplayer) {
        return {
            init:function() {
                $("#vertex-search-input").autocomplete({
                    source:function (request, response) {
                        SearchService.searchAutoComplete(
                            request.term,
                            function (searchResults) {
                                response($.map(searchResults, function (searchResult) {
                                    return {
                                        label:searchResult.label,
                                        value:searchResult.label,
                                        id:searchResult.id
                                    }
                                }));
                            }
                        );
                    },
                    select:function (event, ui) {
                        var vertexUri = ui.item.id;
                        GraphDisplayer.displayUsingNewCentralVertexUri(
                            vertexUri
                        );
                    }
                });
            }
        };
    }
);