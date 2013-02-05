/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.search",
    "triple_brain.positions_calculator",
    "jquery-ui"
],
    function ($, SearchService, PositionsCalculator) {
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
                        PositionsCalculator.calculateUsingNewCentralVertexUri(
                            vertexUri
                        );
                    }
                });
            }
        };
    }
);