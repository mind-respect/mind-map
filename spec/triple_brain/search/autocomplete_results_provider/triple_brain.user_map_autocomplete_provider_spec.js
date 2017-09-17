/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    "jquery",
    'triple_brain.user_map_autocomplete_provider',
    "triple_brain.graph_element_type"
], function (Scenarios, $, UserMapAutocompleteProvider, GraphElementType) {
    "use strict";
    describe("user_map_autocomplete_provider", function () {
        beforeEach(function () {
        });
        it("includes schema properties", function () {
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas();
            var formattedSearchResults = searchProvider.formatResults(
                new Scenarios.getSearchResultsForImpact().get()
            );
            expect(
                searchResultIsProperty(
                    formattedSearchResults[0]
                )
            ).toBeTruthy();
        });
        it("includes schemas", function () {
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                formattedSearchResults = searchProvider.formatResults(
                    new Scenarios.getSearchResultsForProject().get(),
                    "project"
                );
            expect(
                formattedSearchResults[0].nonFormattedSearchResult.getGraphElementType()
            ).toBe(GraphElementType.Schema);
        });
        it("sets property context", function () {
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                propertySearchResult = searchProvider.formatResults(
                    new Scenarios.getSearchResultsForImpact().get(),
                    "impact"
                )[0];
            expect(
                propertySearchResult.somethingToDistinguish
            ).toBe(
                "<- project"
            );
            expect(
                propertySearchResult.elementType
            ).toBe(
                "Component"
            );
        });
        it("sets vertex context", function () {
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                vertexSearchResult = searchProvider.formatResults(
                    new Scenarios.getSearchResultForB1().get(),
                    "b1"
                )[0];
            var somethingToDistinguish = $(
                vertexSearchResult.somethingToDistinguish
            );
            expect(
                somethingToDistinguish.find(".distinguish-vertex-item:contains(b2)").length > 0
            ).toBeTruthy();
            expect(
                somethingToDistinguish.find(".distinguish-vertex-item:contains(b3)").length > 0
            ).toBeTruthy();
            expect(
                vertexSearchResult.elementType
            ).toBe(
                "Bubble"
            );
        });
        it("vertex context is empty if it has no neighbors", function () {
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas();
            var searchResults = new Scenarios.getSearchResultForB1().get();
            searchResults[0].context = undefined;
            var vertexSearchResult = searchProvider.formatResults(
                searchResults,
                "b1"
            )[0];
            expect(
                vertexSearchResult.somethingToDistinguish
            ).toBe(
                ""
            );
        });
        it("sets edge context", function () {
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                edgeSearchResult = searchProvider.formatResults(
                    new Scenarios.getSearchResultForR2().get(),
                    "r2"
                )[0];
            var verticesLabel = edgeSearchResult.somethingToDistinguish.split(", ");
            expect(
                verticesLabel.indexOf("b1") !== -1
            ).toBeTruthy();
            expect(
                verticesLabel.indexOf("b3") !== -1
            ).toBeTruthy();
            expect(
                edgeSearchResult.elementType
            ).toBe(
                "Relation"
            );
        });
        it("puts schemas above bubbles in the list of formatted search results", function () {
            var serverResults = [];
            serverResults = serverResults.concat(
                new Scenarios.getSearchResultForB1().get()
            );
            serverResults = serverResults.concat(
                new Scenarios.getSearchResultsForProject().get()
            );
            expect(
                serverResults[0].type
            ).toBe("vertex");
            expect(
                serverResults[1].type
            ).toBe("schema");
            var topSearchResult = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas().formatResults(
                serverResults,
                ""
            )[0];
            expect(
                topSearchResult.elementType
            ).toBe(
                "Model"
            );
        });
        it("filters out results that are the same", function () {
            var serverResults = [];
            serverResults = serverResults.concat(
                new Scenarios.withRelationsAsIdentifierSearchSome().get()
            );
            expect(
                serverResults.length
            ).toBe(5);
            var searchResultsThroughProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas().formatResults(
                serverResults,
                ""
            );
            expect(
                searchResultsThroughProvider.length
            ).toBe(2);
        });
        it("puts metas above", function () {
            var serverResults = [];
            serverResults = serverResults.concat(
                new Scenarios.withRelationsAsIdentifierSearchSome().get()
            );
            var topSearchResult = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas().formatResults(
                serverResults,
                ""
            )[0];
            expect(
                topSearchResult.nonFormattedSearchResult.getGraphElementType()
            ).toBe(
                GraphElementType.Meta
            );
        });
        it("prioritizes vertices tagged to a search result tag and where they have the same label", function () {
            var serverResults = [];
            serverResults = serverResults.concat(
                new Scenarios.getBookSearchResults()
            );
            var topSearchResult = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas({
                noFilter: true
            }).formatResults(
                serverResults,
                ""
            )[0];
            expect(
                    topSearchResult.nonFormattedSearchResult.getGraphElementType()
            ).toBe(
                GraphElementType.Vertex
            );
        });
        it("puts proprieties above relations in the list of formatted search results", function () {
            var serverResults = [];
            serverResults = serverResults.concat(
                new Scenarios.getSearchResultForR2().get()
            );
            serverResults = serverResults.concat(
                new Scenarios.getSearchResultsForImpact().get()
            );
            expect(
                serverResults[0].type
            ).toBe("edge");
            expect(
                serverResults[1].type
            ).toBe("property");
            var topSearchResult = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas().formatResults(
                serverResults,
                ""
            )[0];
            expect(
                topSearchResult.elementType
            ).toBe(
                "Component"
            );
        });
        it("prioritize bubbles with highest number of visits", function () {
            var serverResults = [];
            serverResults = serverResults.concat(
                new Scenarios.getSearchResultsForImpactVertices().get()
            );
            moveServerSearchResultWithLabelToLastIndex(
                serverResults,
                "impact 2 bubble"
            );
            expect(
                serverResults[5].graphElement.friendlyResource.label
            ).toBe(
                "impact 2 bubble"
            );
            var topSearchResultAfterIdentifiers = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas().formatResults(
                serverResults,
                ""
            )[2];
            expect(
                topSearchResultAfterIdentifiers.nonFormattedSearchResult.getGraphElement().getLabel()
            ).toBe(
                "impact 2 bubble"
            );
        });
        it("prioritize metas with highest number of references", function () {
            var serverResults = [];
            serverResults = serverResults.concat(
                new Scenarios.sameLabelMetasSearchResult().get()
            );
            moveServerSearchResultWithLabelToLastIndex(
                serverResults,
                "meta3"
            );
            expect(
                serverResults[3].graphElement.friendlyResource.label
            ).toBe(
                "meta3"
            );
            var searchResults = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas().formatResults(
                serverResults,
                ""
            );
            expect(
                searchResults[0].nonFormattedSearchResult.getGraphElement().getLabel()
            ).toBe(
                "meta3"
            );
            expect(
                searchResults[1].nonFormattedSearchResult.getGraphElement().getLabel()
            ).toBe(
                "meta2"
            );
            expect(
                searchResults[2].nonFormattedSearchResult.getGraphElement().getLabel()
            ).toBe(
                "meta1"
            );
            expect(
                searchResults[3].nonFormattedSearchResult.getGraphElement().getLabel()
            ).toBe(
                "meta0"
            );
        });
    });

    function moveServerSearchResultWithLabelToLastIndex(searchResults, searchResultLabel) {
        var i = searchResults.length;
        while (i--) {
            var searchResult = searchResults[i];
            var friendlyResource = searchResult.graphElement ?
                searchResult.graphElement.friendlyResource :
                searchResult.identifierPojo.friendlyResource;
            if (searchResultLabel === friendlyResource.label){
                var temp = searchResults[searchResults.length -1];
                searchResults[searchResults.length -1] = searchResult;
                searchResults[i] = temp;
            }
        }
    }

    function searchResultIsProperty(searchResult) {
        return stringContains(
            searchResult.uri,
            "property"
        );
    }

    function stringContains(string, toVerify) {
        return string.indexOf(toVerify) !== -1;
    }

    function oneOfSearchResultIfOfType(searchResults, type) {
        var isTrue = false;
        $.each(searchResults, function () {
            if (type === this.nonFormattedSearchResult.getGraphElementType()) {
                isTrue = true;
            }
        });
        return isTrue;
    }
});