/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    'triple_brain.user_map_autocomplete_provider',
    "triple_brain.graph_element_type",
    'test/webapp/js/test-scenarios'
], function (UserMapAutocompleteProvider, GraphElementType, Scenarios) {
    "use strict";
    describe("user_map_autocomplete_provider", function () {
        beforeEach(function () {
        });
        it("includes schema properties", function () {
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                formattedSearchResults = searchProvider.formatResults(
                    new Scenarios.getSearchResultsForImpact().get(),
                    "impact"
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
                "Property"
            );
        });
        it("sets vertex context", function () {
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                vertexSearchResult = searchProvider.formatResults(
                    new Scenarios.getSearchResultForB1().get(),
                    "b1"
                )[0];
            expect(
                vertexSearchResult.somethingToDistinguish
            ).toBe(
                "r1, r3, r2"
            );
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
                "b3 -> b1"
            );
            expect(
                edgeSearchResult.elementType
            ).toBe(
                "Relation"
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