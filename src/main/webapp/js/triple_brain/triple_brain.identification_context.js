/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.search",
    "triple_brain.graph_displayer"
], function (SearchService, GraphDisplayer) {
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
            return searchResult.source_vertex_uri === undefined ?
                makeBubbleContext(searchResult, callback) :
                makeRelationContext(searchResult, callback);
        }

        function makeBubbleContext() {
            var tPreString = "identification.context";
            var context = $("<div class='context'>").append(
                $.t(tPreString + ".bubble"),
                ": ",
                makeBubbleLinks ? vertexLinkFromSearchResult(searchResult) :
                    searchResult.label,
                " "
            );
            if (searchResult.relations_name.length > 0) {
                context.append(
                    $.t(tPreString + ".with_relations") + ": ",
                    api.formatRelationsName(
                        api.removedEmptyAndDuplicateRelationsName(
                            searchResult.relations_name
                        )
                    )
                );
            }
            callback(context);
        }

        function makeRelationContext() {
            $.when(
                SearchService.getSearchResultByUriAjaxCall(searchResult.source_vertex_uri),
                SearchService.getSearchResultByUriAjaxCall(searchResult.destination_vertex_uri)
            ).done(function (sourceVertexArray, destinationVertexArray) {
                    var sourceVertex = sourceVertexArray[0];
                    var destinationVertex = destinationVertexArray[0];
                    var context = $("<div class='context'>").append(
                        $.t("vertex.search.destination_bubble") + ": ",
                        makeBubbleLinks ? vertexLinkFromSearchResult(destinationVertex) : destinationVertex.label,
                        "<br>",
                        $.t("vertex.search.source_bubble") + ": ",
                        makeBubbleLinks ? vertexLinkFromSearchResult(sourceVertex) : sourceVertex.label
                    );
                    callback(context);
                }
            );
        }

        function vertexLinkFromSearchResult(searchResult) {
            return $("<button class='link-like-button'>").append(
                searchResult.label
            ).data(
                "identificationUri",
                searchResult.uri
            ).on(
                "click",
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    var identificationUri = $(this).data("identificationUri");
                    GraphDisplayer.displayUsingNewCentralVertexUri(
                        identificationUri
                    );
                }
            );
        }
    }
});