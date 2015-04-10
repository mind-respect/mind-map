/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    'triple_brain.identification_context',
    'triple_brain.user_map_autocomplete_provider',
    'triple_brain.search',
    "triple_brain.graph_element_type",
    'test/webapp/js/test-scenarios',
    'test/webapp/js/mock'
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
                        html.html().indexOf("something cool") !== -1
                    ).toBeTruthy();
                }
            );
            expect(
                hasBeenIntoCallback
            ).toBeTruthy();
        });
    });
});