/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.search",
    "triple_brain.identification_context",
    "triple_brain.id_uri",
    "triple_brain.search_result",
    "triple_brain.graph_element_type"
], function ($, SearchService, IdentificationContext, IdUri, SearchResult, GraphElementType) {
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
    api.toFetchCurrentUserVerticesAndPublicOnesForIdentification = function (vertexToIdentify) {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOwnVerticesAndPublicOnesAjaxCall,
            vertexToIdentify
        );
    };
    api.toFetchRelationsForIdentification = function (edgeToIdentify) {
        return new UserMapAutoCompleteProvider(
            SearchService.searchForOwnRelationsAjaxCall,
            edgeToIdentify
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
        this.formatResults = function (searchResults, searchTerm) {
            var formattedResults = [];
            $.each(searchResults, addFormattedResult);
            function addFormattedResult() {
                var serverFormat = this,
                    searchResult = SearchResult.fromServerFormat(serverFormat),
                    graphElement = searchResult.getGraphElement();
                if (undefined !== graphElementToIgnore && graphElement.getUri() === graphElementToIgnore.getUri()) {
                    return;
                }
                var formatted = applyBasicFormat(searchResult);
                if (searchResult.is(GraphElementType.Vertex)) {
                    formatVertexResult(
                        formatted,
                        graphElement
                    );
                    return;
                }
                if (searchResult.is(GraphElementType.Schema)) {
                    formatSchemaResult(
                        formatted,
                        graphElement
                    );
                    return;
                }
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

            function formatSchemaResult(formattedSchema, schema) {
                $.each(schema.getProperties(), function () {
                    var property = this,
                        searchResult = SearchResult.forGraphElementAndItsType(
                            property,
                            GraphElementType.Property
                        );
                    if (searchTermMatchesLabel(searchTerm, property.getLabel())) {
                        var formattedProperty = applyBasicFormat(searchResult);
                        formattedProperty.somethingToDistinguish = buildPropertySomethingToDistinguish(
                            schema
                        );
                        formattedResults.push(formattedProperty);
                    }
                });
                if (searchTermMatchesLabel(searchTerm, schema.getLabel())) {
                    formattedSchema.somethingToDistinguish = IdentificationContext.formatRelationsName(
                        IdentificationContext.removedEmptyAndDuplicateRelationsName(
                            schema.getPropertiesName()
                        )
                    );
                    formattedResults.push(formattedSchema);
                }
            }

            function formatVertexResult(formatted) {
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
                        $("<div>").append(originalSearchResult.getGraphElement().getComment())
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

        function buildPropertySomethingToDistinguish(schema){
            return $.t("search.context.property") + " " + schema.getLabel() + " -> " +
                schema.getPropertiesName().join(", ");
        }

        function searchTermMatchesLabel(searchTerm, label) {
            return label.indexOf(searchTerm) !== -1;
        }
    }
})
;