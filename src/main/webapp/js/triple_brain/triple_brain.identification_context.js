/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.search",
    "triple_brain.graph_displayer",
    "triple_brain.search_result",
    "triple_brain.graph_element_type"
], function (SearchService, GraphDisplayer, SearchResult, GraphElementType) {
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
    return api;
    function IdentificationContext(searchResult, callback, makeBubbleLinks) {
        this.build = function () {
            SearchService.getSearchResultDetails(
                searchResult.getGraphElement().getUri(),
                function (detailedSearchResult) {
                    searchResult = SearchResult.fromServerFormat(
                        detailedSearchResult
                    );
                    switch (searchResult.getGraphElementType()) {
                        case GraphElementType.Vertex :
                            return makeBubbleContext();
                        case GraphElementType.Relation :
                            return makeRelationContext();
                        default:
                            callback($("<div>"));
                    }
                }
            );
        };
        function makeBubbleContext() {
            var vertex = searchResult.getGraphElement();
            var tPreString = "identification.context";
            var context = $("<div class='context'>").append(
                $.t(tPreString + ".bubble"),
                ": ",
                makeBubbleLinks ? vertexLinkFromSearchResult(searchResult) :
                    vertex.getLabel(),
                " "
            );
            context.append(
                $("<div>").append(
                    vertex.getComment()
                )
            );
            callback(context);
        }

        function makeSchemaContext() {
            var schema = searchResult.getGraphElement(),
                tPreString = "identification.context",
                context = $("<div class='context'>");
            if (schema.hasProperties()) {
                context.append(
                        $.t(tPreString + ".with_properties") + ": ");
                api.formatRelationsName(
                    api.removedEmptyAndDuplicateRelationsName(
                        searchResult.getPropertiesName()
                    )
                );
            }
        }

        function makeRelationContext() {
            var relation = searchResult.getGraphElement();
            $.when(
                SearchService.getSearchResultDetailsAjaxCall(
                    relation.getSourceVertex().getUri()
                ),
                SearchService.getSearchResultDetailsAjaxCall(
                    relation.getDestinationVertex().getUri()
                )
            ).done(function (sourceVertexArray, destinationVertexArray) {
                    var sourceVertex = SearchResult.fromServerFormat(
                            sourceVertexArray[0]
                        ).getGraphElement(),
                        destinationVertex = SearchResult.fromServerFormat(
                            destinationVertexArray[0]
                        ).getGraphElement(),
                        context = $("<div class='context'>").append(
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
                    GraphDisplayer.displayForBubbleWithUri(
                        identificationUri
                    );
                }
            );
        }
    }
});