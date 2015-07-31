/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'triple_brain.schema_suggestion',
    'triple_brain.user_map_autocomplete_provider',
    'triple_brain.wikidata_autocomplete_provider',
    "triple_brain.graph_element_type",
    "test/mock/triple_brain.schema_service_mock",
    'test/test-scenarios'
], function (SchemaSuggestion, UserMapAutocompleteProvider, WikidataAutocompleteProvider, GraphElementType, SchemaServiceMock, Scenarios) {
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
            SchemaServiceMock.getMock(
                new Scenarios.getProjectSchema().getGraph()
            );
            var hasExecuted = false;
            SchemaSuggestion.addSchemaSuggestionsIfApplicable(
                undefined,
                formattedSearchResults[0]
            ).then(function (suggestions) {
                    expect(
                        suggestions.length
                    ).toBe(4);
                    hasExecuted = true;
                });
            expect(hasExecuted).toBeTruthy();
        });
        it("it fetches the identification of a property to include it in the suggestion", function () {
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                formattedSearchResults = searchProvider.formatResults(
                    new Scenarios.karaokeSchemaSearchResults().get(),
                    "project"
                );
            SchemaServiceMock.getMock(
                new Scenarios.getKaraokeSchemaGraph().getGraph()
            );
            var hasExecuted = false;
            SchemaSuggestion.addSchemaSuggestionsIfApplicable(
                undefined,
                formattedSearchResults[0]
            ).then(function(suggestions){
                    expect(
                        suggestions.length
                    ).toBe(3);
                    hasExecuted = true;
                });
            expect(hasExecuted).toBeTruthy();
        });
        it("can handle wikidata search results", function () {
            var searchProvider = WikidataAutocompleteProvider.build(),
                formattedSearchResults = searchProvider.formatResults(
                    new Scenarios.getWikidataSearchResultForProject().get(),
                    "project"
                );
            var hasExecuted = false;
            SchemaSuggestion.addSchemaSuggestionsIfApplicable(
                undefined,
                formattedSearchResults[0]
            ).then(function (suggestions) {
                    expect(
                        suggestions.length
                    ).toBe(0);
                    hasExecuted = true;
                });
            expect(hasExecuted).toBeTruthy();
        });
    });
});