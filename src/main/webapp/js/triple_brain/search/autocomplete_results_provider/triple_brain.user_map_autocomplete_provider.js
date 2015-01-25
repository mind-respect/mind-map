/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.search",
    "triple_brain.identification_context",
    "triple_brain.search_result_facade_factory",
    "triple_brain.id_uri"
], function ($, SearchService, IdentificationContext, SearchResultFacadeFactory, IdUri) {
    var api = {};
    api.toFetchOnlyCurrentUserVertices = function () {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOnlyOwnVerticesAjaxCall,
            false,
            undefined
        );
    };
    api.toFetchOnlyCurrentUserVerticesAndSchemas = function () {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOnlyOwnVerticesAndSchemasAjaxCall,
            false,
            undefined
        );
    };
    api.toFetchOnlyCurrentUserVerticesExcept = function (vertexToIgnore) {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOnlyOwnVerticesAjaxCall,
            false,
            vertexToIgnore
        );
    };
    api.toFetchCurrentUserVerticesAndPublicOnesForIdentification = function (vertexToIdentify) {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOwnVerticesAndPublicOnesAjaxCall,
            true,
            vertexToIdentify
        );
    };
    api.toFetchRelationsForIdentification = function (edgeToIdentify) {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOwnRelationsAjaxCall,
            true,
            edgeToIdentify
        );
    };
    return api;
    function UserMapAutoCompleteProvider(fetchMethod, isForIdentification, graphElementToIgnore) {
        var self = this;
        this.getFetchMethod = function (searchTerm) {
            return fetchMethod(
                searchTerm
            );
        };
        this.formatResults = function (searchResults, searchTerm) {
            var formattedResults = [];
            $.each(searchResults, addFormattedResult);
            function addFormattedResult() {
                var searchResult = this,
                    searchResultFacade = SearchResultFacadeFactory.get(
                        searchResult
                    );
                if (undefined !== graphElementToIgnore && searchResultFacade.getUri() === graphElementToIgnore.getUri()) {
                    return;
                }
                var formatted = applyBasicFormat(searchResultFacade);

                if (searchResultFacade.isVertex()) {
                    searchResultFacade.hasProperties() ?
                        formatSchemaResult(formatted, searchResultFacade) :
                        formatVertexResult(formatted, searchResultFacade);
                    return;
                }
                formattedResults.push(
                    formatted
                );
            }

            function applyBasicFormat(searchResultFacade) {
                return {
                    nonFormattedSearchResult: searchResultFacade,
                    comment: searchResultFacade.getComment(),
                    label: searchResultFacade.getLabel(),
                    value: searchResultFacade.getLabel(),
                    source: $.t("vertex.search.user") + " " + IdUri.usernameFromUri(searchResultFacade.getUri()),
                    uri: searchResultFacade.getUri(),
                    provider: self
                };
            }

            function formatSchemaResult(formattedSchema, schema) {
                $.each(schema.getProperties(), function () {
                    var property = this;
                    if (searchTermMatchesLabel(property.getLabel())) {
                        var newSearchResult = applyBasicFormat(property);
                        formattedResults.push(newSearchResult);
                    }
                });
                if (searchTermMatchesLabel(schema.getLabel())) {
                    formattedResults.push(formattedSchema);
                }
            }

            function searchTermMatchesLabel(label) {
                return label.indexOf(searchTerm) !== -1;
            }

            function formatVertexResult(formatted, searchResultFacade) {
                formatted.somethingToDistinguish = IdentificationContext.formatRelationsName(
                    IdentificationContext.removedEmptyAndDuplicateRelationsName(
                        searchResultFacade.getPropertiesName()
                    )
                );
                formatted.distinctionType = "relations";
                formattedResults.push(formatted);
            }

            return formattedResults;
        };

        this.getMoreInfoForSearchResult = function (searchResult, callback) {
            var originalSearchResult = searchResult.nonFormattedSearchResult;
            IdentificationContext.buildWithoutBubbleLinks(
                originalSearchResult,
                function (context) {
                    var moreInfo = context.append(
                        originalSearchResult.context,
                        $("<div>").append(originalSearchResult.getComment())
                    );
                    callback({
                            conciseSearchResult: searchResult,
                            title: searchResult.label,
                            text: moreInfo,
                            imageUrl: ""
                        }
                    );
                }
            );
        };
    }
})
;