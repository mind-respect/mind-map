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
    api.toFetchAllOwned = function (options) {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForAllOwnResources,
            undefined,
            options
        );
    };
    api.toFetchOnlyCurrentUserVertices = function () {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOnlyOwnVerticesAjaxCall,
            undefined
        );
    };
    api.toFetchOnlyCurrentUserVerticesAndSchemas = function (options) {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOnlyOwnVerticesAndSchemasAjaxCall,
            undefined,
            options
        );
    };
    api.toFetchOnlyCurrentUserVerticesExcept = function (vertexToIgnore) {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOnlyOwnVerticesAjaxCall,
            vertexToIgnore
        );
    };
    api.toFetchPublicAndUserVerticesExcept = function (vertexToIgnore, options) {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOwnVerticesAndPublicOnesAjaxCall,
            vertexToIgnore,
            options
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

    function UserMapAutoCompleteProvider(fetchMethod, graphElementToIgnore, options) {
        this.options = options || {};
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
                    searchResult.getDeepGraphElementType()
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

            if (this.shouldFilter()) {
                formattedResults = this.filterSearchResults(formattedResults);
            }
            this.sortFormattedResults(formattedResults);
            return formattedResults;
        };

        this.shouldFilter = function () {
            if (!this.options.noFilter) {
                return true;
            }
            if (typeof this.options.noFilter === "function") {
                return !this.options.noFilter();
            }
            return !this.options.noFilter;
        };

        this.sortFormattedResults = function (formattedResults) {
            formattedResults.sort(function (a, b) {
                if(isVertexHavingTagWithSameLabelInSearchResults(a, formattedResults)){
                    if(isVertexHavingTagWithSameLabelInSearchResults(b, formattedResults)){
                        return hasMoreReferencesOrVisits(a, b);
                    }
                    return -1;
                }
                if(isVertexHavingTagWithSameLabelInSearchResults(b, formattedResults)){
                    return 1;
                }
                if (isPrioritySearchResult(a)) {
                    if (isPrioritySearchResult(b)) {
                        return hasMoreReferencesOrVisits(a, b);
                    }
                    return -1;
                }
                if (isPrioritySearchResult(b)) {
                    return 1;
                }
                return hasMoreReferencesOrVisits(a, b);
            });
        };
        this.filterSearchResults = function (searchResults) {
            return searchResults.filter(function (formattedSearchResult) {
                var searchResult = formattedSearchResult.nonFormattedSearchResult;
                if (GraphElementType.Meta === searchResult.getGraphElementType()) {
                    return true;
                }
                var hasAnIdentifierWithinTheSearchResults = false;
                searchResults.forEach(function (otherFormattedSearchResult) {
                    var otherSearchResult = otherFormattedSearchResult.nonFormattedSearchResult;
                    if (GraphElementType.Meta === otherSearchResult.getGraphElementType()) {
                        if (searchResult.getGraphElement().getUri() === otherSearchResult.getGraphElement().getExternalResourceUri()) {
                            hasAnIdentifierWithinTheSearchResults = true;
                        }
                        searchResult.getGraphElement().getIdentifiers().forEach(function (identifier) {
                            if (identifier.getExternalResourceUri() === otherSearchResult.getGraphElement().getExternalResourceUri()) {
                                hasAnIdentifierWithinTheSearchResults = true;
                            }
                        });
                    }
                });
                return !hasAnIdentifierWithinTheSearchResults;
            });
        };
        this.isActive = function () {
            return true;
        };

        function hasMoreReferencesOrVisits(searchResultA, searchResultB) {
            var aNumberOfReferences = searchResultA.nonFormattedSearchResult.getNumberOfReferences();
            var bNumberOfReferences = searchResultB.nonFormattedSearchResult.getNumberOfReferences();
            if (aNumberOfReferences > bNumberOfReferences) {
                return -1;
            }
            if (bNumberOfReferences > aNumberOfReferences) {
                return 1;
            }
            var aNbVisits = searchResultA.nonFormattedSearchResult.getNbVisits();
            var bNbVisits = searchResultB.nonFormattedSearchResult.getNbVisits();
            if (aNbVisits > bNbVisits) {
                return -1;
            }
            if (bNbVisits > aNbVisits) {
                return 1;
            }
            return 0;
        }

        function isVertexHavingTagWithSameLabelInSearchResults(searchResult, allSearchResults){
            if(GraphElementType.Vertex !== searchResult.nonFormattedSearchResult.graphElementType) {
                return false;
            }
            var hasTagWithSameLabelInSearchResults = false;
            allSearchResults.forEach(function(otherSearchResult){
                if(GraphElementType.Meta !== otherSearchResult.nonFormattedSearchResult.graphElementType) {
                    return false;
                }
                var vertex = searchResult.nonFormattedSearchResult.graphElement;
                var tag = otherSearchResult.nonFormattedSearchResult.graphElement;
                if(vertex.hasIdentification(tag)){
                    hasTagWithSameLabelInSearchResults = true;
                }
            });
            return hasTagWithSameLabelInSearchResults;
        }

        function isSearchResultAVertexOrTag(searchResult) {
            return [
                GraphElementType.Vertex,
                GraphElementType.Meta
            ].indexOf(
                searchResult.nonFormattedSearchResult.graphElementType
            ) !== -1;
        }

        function isSearchResultTaggedAndSharesLabelWithOther(searchResultA, searchResultB) {
            var vertexSearchResult;
            var tagSearchResult;
            if(GraphElementType.Vertex === searchResultA.nonFormattedSearchResult.graphElementType){
                vertexSearchResult = searchResultA;
                tagSearchResult = searchResultB;
            } else{
                vertexSearchResult = searchResultB;
                tagSearchResult = searchResultA;
            }
            var vertex = vertexSearchResult.nonFormattedSearchResult.graphElement;
            var tag = tagSearchResult.nonFormattedSearchResult.graphElement;
            return vertex.hasIdentification(
                tag
            );
        }

        function isPrioritySearchResult(formattedResult) {
            return formattedResult.nonFormattedSearchResult.is(
                GraphElementType.Schema
            ) || formattedResult.nonFormattedSearchResult.is(
                GraphElementType.Property
            ) || formattedResult.nonFormattedSearchResult.is(
                GraphElementType.Meta
            );
        }

        this.getMoreInfoForSearchResult = function (searchResult) {
            var originalSearchResult = searchResult.nonFormattedSearchResult;
            var deferred = $.Deferred();
            IdentificationContext.buildWithoutBubbleLinks(
                originalSearchResult,
                function (context, image, comment) {
                    var moreInfo = context.append(
                        originalSearchResult.context,
                        $("<div>").append(
                            originalSearchResult.getGraphElement().getComment()
                        )
                    );
                    deferred.resolve({
                            conciseSearchResult: searchResult,
                            title: searchResult.label,
                            text: moreInfo,
                            image: image,
                            comment: comment
                        }
                    );
                }
            );
            return deferred.promise();
        };
    }
});