/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'triple_brain.user_map_autocomplete_provider',
    "triple_brain.graph_element_type",
    'test/test-scenarios'
], function (UserMapAutocompleteProvider, GraphElementType, Scenarios) {
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
                "project"
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
            expect(
                vertexSearchResult.somethingToDistinguish === "r1, r2" ||
                vertexSearchResult.somethingToDistinguish === "r2, r1"
            ).toBeTruthy();
            expect(
                vertexSearchResult.elementType
            ).toBe(
                "Bubble"
            );
        });
        it("vertex context is empty if it has no relations", function () {
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas();
            var searchResults = new Scenarios.getSearchResultForB1().get();
            searchResults[0].properties = undefined;
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
            expect(
                edgeSearchResult.somethingToDistinguish
            ).toBe(
                "b1 -> b3"
            );
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
    });
    function searchResultIsProperty(searchResult) {
        return stringContains(
            searchResult.uri,
            "property"
        );
    }

    function stringContains(string, toVerify) {
        return string.indexOf(toVerify) !== -1;
    }
});