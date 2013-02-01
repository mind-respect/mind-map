/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.search",
    "triple_brain.drawn_graph",
    "jquery-ui"
],
    function ($, SearchService, DrawnGraph) {
        return {
            init:function() {
                $("#vertex-search-input").autocomplete({
                    source:function (request, response) {
                        SearchService.search_for_auto_complete(
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
                        DrawnGraph.getFromNewCentralVertexUri(
                            vertexUri
                        );
                    }
                });
            }
        };
    }
);