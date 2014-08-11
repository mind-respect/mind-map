/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.search",
    "triple_brain.graph_displayer",
    "triple_brain.search_result_facade_factory"
], function (SearchService, GraphDisplayer, SearchResultFacadeFactory) {
    var api = {};
    api.build = function (searchResult, callback) {
        return new IdentificationContext(
            searchResult, callback, true
        ).build();
    };
    api.buildWithoutBubbleLinks = function (searchResult, callback) {
        return new IdentificationContext(
            searchResult, callback, false
        ).build();
    };
    api.formatRelationsName = function (relationsName) {
        return relationsName.join(", ");
    };
    api.removedEmptyAndDuplicateRelationsName = function (relationsName) {
        return relationsName.filter(
            function (relationName, position) {
                return relationName !== "" &&
                    relationsName.indexOf(relationName) == position;
            }
        );
    };
    return api;
    function IdentificationContext(searchResult, callback, makeBubbleLinks) {
        this.build = function() {
            return searchResult.isVertex() ?
                makeBubbleContext() :
                makeRelationContext();
        };
        function makeBubbleContext() {
            var tPreString = "identification.context";
            var context = $("<div class='context'>").append(
                $.t(tPreString + ".bubble"),
                ": ",
                makeBubbleLinks ? vertexLinkFromSearchResult(searchResult) :
                    searchResult.getLabel(),
                " "
            );
            if (searchResult.getRelationsName().length > 0) {
                context.append(
                    $.t(tPreString + ".with_relations") + ": ",
                    api.formatRelationsName(
                        api.removedEmptyAndDuplicateRelationsName(
                            searchResult.getRelationsName()
                        )
                    )
                );
            }
            callback(context);
        }

        function makeRelationContext() {
            $.when(
                SearchService.getSearchResultByUriAjaxCall(
                    searchResult.getSourceVertex().getUri()
                ),
                SearchService.getSearchResultByUriAjaxCall(
                    searchResult.getDestinationVertex().getUri()
                )
            ).done(function (sourceVertexArray, destinationVertexArray) {
                    var sourceVertex = SearchResultFacadeFactory.get(
                        sourceVertexArray[0]
                    );
                    var destinationVertex = SearchResultFacadeFactory.get(
                        destinationVertexArray[0]
                    );
                    var context = $("<div class='context'>").append(
                        $.t("vertex.search.destination_bubble") + ": ",
                        makeBubbleLinks ?
                            vertexLinkFromSearchResult(destinationVertex) :
                            destinationVertex.getLabel(),
                        "<br>",
                        $.t("vertex.search.source_bubble") + ": ",
                        makeBubbleLinks ?
                            vertexLinkFromSearchResult(sourceVertex) :
                            sourceVertex.getLabel()
                    );
                    callback(context);
                }
            );
        }

        function vertexLinkFromSearchResult(searchResult) {
            return $("<button class='link-like-button'>").append(
                searchResult.getLabel()
            ).data(
                "identificationUri",
                searchResult.getUri()
            ).on(
                "click",
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    var identificationUri = $(this).data("identificationUri");
                    GraphDisplayer.displayUsingCentralVertexUri(
                        identificationUri
                    );
                }
            );
        }
    }
});