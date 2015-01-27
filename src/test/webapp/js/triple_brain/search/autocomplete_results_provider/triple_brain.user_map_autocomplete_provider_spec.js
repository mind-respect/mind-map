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
                property = searchProvider.formatResults(
                    new Scenarios.getSearchResultsForImpact().get(),
                    "impact"
                )[0];
            expect(
                property.somethingToDistinguish
            ).toBe(
                "of schema project -> has objective, impact on the individual, has component, impact on society"
            )
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