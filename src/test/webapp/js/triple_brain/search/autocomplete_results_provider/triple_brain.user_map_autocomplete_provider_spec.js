/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    'triple_brain.user_map_autocomplete_provider',
    'test/webapp/js/test-scenarios'
], function (UserMapAutocompleteProvider, Scenarios) {
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
        it("sets property context", function () {
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                propertySearchResult = searchProvider.formatResults(
                    new Scenarios.getSearchResultsForImpact().get(),
                    "impact"
                )[0];
            expect(
                propertySearchResult.somethingToDistinguish
            ).toBe(
                "property of schema project"
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
                "bubble with relations r1, r3, r2"
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
                "relation with source bubble b3 and destination bubble b1"
            );
        });
    });
    function searchResultIsProperty(searchResult){
        return stringContains(
            searchResult.uri,
            "property"
        );
    }
    function stringContains(string, toVerify) {
        return string.indexOf(toVerify) !== -1;
    }
});