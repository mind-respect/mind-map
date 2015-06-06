/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'triple_brain.identification_context',
    'triple_brain.user_map_autocomplete_provider',
    'triple_brain.search',
    "triple_brain.graph_element_type",
    'test/test-scenarios',
    'test/mock'
], function (IdentificationContext, UserMapAutocompleteProvider, SearchService, GraphElementType, Scenarios, Mock) {
    "use strict";
    describe("identification_context", function () {
        beforeEach(function () {
        });
        it("includes schema comment", function(){
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                formattedSearchResults = searchProvider.formatResults(
                    new Scenarios.getSearchResultsForProject().get(),
                    "project"
                ),
                hasBeenIntoCallback = false;
            Mock.getSearchResultDetailsToReturn(
                new Scenarios.getSchemaProjectDetailsSearchResult().get()
            );
            IdentificationContext.build(
                formattedSearchResults[0].nonFormattedSearchResult,
                function(html){
                    hasBeenIntoCallback = true;
                    expect(
                        html.html().indexOf("A project is defined as a collaborative enterprise ...") !== -1
                    ).toBeTruthy();
                }
            );
            expect(
                hasBeenIntoCallback
            ).toBeTruthy();
        });
        it("includes schema property comment", function(){
            var searchProvider = UserMapAutocompleteProvider.toFetchRelationsForIdentification(),
                formattedSearchResults = searchProvider.formatResults(
                    new Scenarios.getSearchResultsForImpact().get(),
                    "impact on society"
                ),
                hasBeenIntoCallback = false;
            Mock.getSearchResultDetailsToReturn(
                new Scenarios.impactOnSocietyPropertySearchDetails().get()
            );
            IdentificationContext.build(
                formattedSearchResults[0].nonFormattedSearchResult,
                function(html){
                    hasBeenIntoCallback = true;
                    expect(
                        html.html().indexOf("impact on society comment") !== -1
                    ).toBeTruthy();
                }
            );
            expect(
                hasBeenIntoCallback
            ).toBeTruthy();
        });
    });
});