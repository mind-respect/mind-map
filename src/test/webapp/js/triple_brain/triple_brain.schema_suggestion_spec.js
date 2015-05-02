/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'triple_brain.schema_suggestion',
    'triple_brain.user_map_autocomplete_provider',
    'triple_brain.freebase_autocomplete_provider',
    "triple_brain.graph_element_type",
    'test/webapp/js/test-scenarios'
], function (SchemaSuggestion, UserMapAutocompleteProvider, FreebaseAutocompleteProvider, GraphElementType, Scenarios) {
    "use strict";
    describe("schema_suggestion", function () {
        beforeEach(function () {
        });
        it("makes a suggestion out of every property", function () {
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                formattedSearchResults = searchProvider.formatResults(
                    new Scenarios.getSearchResultsForProject().get(),
                    "project"
                );
            var suggestions = SchemaSuggestion.addSchemaSuggestionsIfApplicable(
                undefined,
                formattedSearchResults[0]
            );
            expect(
                suggestions.length
            ).toBe(4);
        });
        it("can handle freebase search results", function(){
            var searchProvider = FreebaseAutocompleteProvider.forFetchingAnything(),
                formattedSearchResults = searchProvider.formatResults(
                    new Scenarios.getFreebaseSearchResultForProject().get(),
                    "project"
                );
            var suggestions = SchemaSuggestion.addSchemaSuggestionsIfApplicable(
                undefined,
                formattedSearchResults[0]
            );
            expect(
                suggestions.length
            ).toBe(0);
        });
    });
});