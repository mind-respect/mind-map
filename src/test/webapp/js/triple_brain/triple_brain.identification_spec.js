/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/webapp/js/test-scenarios',
    'test/webapp/js/test-utils',
    'triple_brain.user_map_autocomplete_provider',
    "triple_brain.identification",
    "triple_brain.image",
    "jquery.triple_brain.search"
], function (Scenarios, TestUtils, UserMapAutocompleteProvider, Identification, Image, $Search) {
    "use strict";
    describe("identification", function () {
        it("sets image if search result has one", function(){
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas();
            var searchResult = searchProvider.formatResults(
                new Scenarios.getSearchResultsForImpact().get()
            )[0];
            searchResult.uri = TestUtils.generateEdgeUri();
            var identification = Identification.fromSearchResult(
                searchResult
            );
            expect(
                identification.hasImages()
            ).toBeFalsy();
            spyOn(searchResult.provider,
                "getMoreInfoForSearchResult"
            ).andCallFake(function (searchResult, callback) {
                    callback({
                        conciseSearchResult: searchResult,
                        image: Image.withBase64ForSmallAndUrlForBigger(
                            "dummy_base_64",
                            "http://example.org/some_image.png"
                        )
                    });
                });
            $Search._onFocusAction(
                searchResult,
                $("<div>")
            );
            identification = Identification.fromSearchResult(
                searchResult
            );
            expect(
                identification.hasImages()
            ).toBeTruthy();
        });
    });
});