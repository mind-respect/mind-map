/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.search",
    "triple_brain.graph_element_type",
    "triple_brain.identification_context",
    "triple_brain.id_uri",
    "triple_brain.search_result"
], function ($, SearchService, GraphElementType, IdentificationContext, IdUri, SearchResult) {
    "use strict";
    var api = {};
    api.toFetchOnlyCurrentUserVertices = function () {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOnlyOwnVerticesAjaxCall,
            undefined
        );
    };
    api.toFetchOnlyCurrentUserVerticesAndSchemas = function () {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOnlyOwnVerticesAndSchemasAjaxCall,
            undefined
        );
    };
    api.toFetchOnlyCurrentUserVerticesExcept = function (vertexToIgnore) {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOnlyOwnVerticesAjaxCall,
            vertexToIgnore
        );
    };
    api.toFetchPublicAndUserVerticesExcept = function (vertexToIgnore) {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOwnVerticesAndPublicOnesAjaxCall,
            vertexToIgnore
        );
    };
    api.toFetchRelationsForIdentification = function (edgeToIdentify) {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOwnRelationsAjaxCall,
            edgeToIdentify
        );
    };
    api.toFetchPublicResources = function () {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForPublicVerticesAndSchemasAjaxCall,
            undefined
        );
    };
    return api;
    function UserMapAutoCompleteProvider(fetchMethod, graphElementToIgnore) {
        var self = this;
        this.getFetchMethod = function (searchTerm) {
            return fetchMethod(
                searchTerm
            );
        };
        this.formatResults = function (searchResults) {
            var formattedResults = [];
            $.each(searchResults, addFormattedResult);
            function addFormattedResult() {
                var serverFormat = this;
                var searchResult = SearchResult.fromServerFormat(serverFormat);
                var graphElement = searchResult.getGraphElement();
                if (undefined !== graphElementToIgnore && graphElement.getUri() === graphElementToIgnore.getUri()) {
                    return;
                }
                var formatted = applyBasicFormat(searchResult);
                formatted.elementType = $.t(
                    "search.context." +
                    searchResult.getGraphElementType()
                );
                formatted.somethingToDistinguish = searchResult.getSomethingToDistinguish();
                formatted.nbReferences = searchResult.getNumberOfReferences();
                formattedResults.push(
                    formatted
                );
            }

            function applyBasicFormat(searchResult) {
                var graphElement = searchResult.getGraphElement();
                return {
                    nonFormattedSearchResult: searchResult,
                    comment: graphElement.getComment(),
                    label: graphElement.getLabel(),
                    value: graphElement.getLabel(),
                    source: $.t("vertex.search.user") + " " + IdUri.usernameFromUri(graphElement.getUri()),
                    uri: graphElement.getUri(),
                    provider: self
                };
            }

            this.sortFormattedResults(formattedResults);
            return formattedResults;
        };

        this.sortFormattedResults = function (formattedResults) {
            formattedResults.sort(function (a, b) {
                if (isPrioritySearchResult(a)) {
                    if (isPrioritySearchResult(b)) {
                        return hasMoreReferences(a, b);
                    }
                    return -1;
                }
                if (isPrioritySearchResult(b)) {
                    return 1;
                }
                return hasMoreReferences(a, b);
            });
        };
        this.isActive = function(){
            return true;
        };

        function hasMoreReferences(searchResultA, searchResultB) {
            var aNumberOfReferences = searchResultA.nonFormattedSearchResult.getNumberOfReferences();
            var bNumberOfReferences = searchResultB.nonFormattedSearchResult.getNumberOfReferences();
            if (aNumberOfReferences > bNumberOfReferences) {
                return -1;
            }
            if (bNumberOfReferences > aNumberOfReferences) {
                return 1;
            }
            return 0;
        }

        function isPrioritySearchResult(formattedResult) {
            return formattedResult.nonFormattedSearchResult.is(
                    GraphElementType.Schema
                ) || formattedResult.nonFormattedSearchResult.is(
                    GraphElementType.Property
                ) || formattedResult.nonFormattedSearchResult.is(
                    SearchResult.additionalTypes.Identification
                );
        }

        this.getMoreInfoForSearchResult = function (searchResult, callback) {
            var originalSearchResult = searchResult.nonFormattedSearchResult;
            IdentificationContext.buildWithoutBubbleLinks(
                originalSearchResult,
                function (context, image, comment) {
                    var moreInfo = context.append(
                        originalSearchResult.context,
                        $("<div>").append(
                            originalSearchResult.getGraphElement().getComment()
                        )
                    );
                    callback({
                            conciseSearchResult: searchResult,
                            title: searchResult.label,
                            text: moreInfo,
                            image: image,
                            comment: comment
                        }
                    );
                }
            );
        };
    }
});