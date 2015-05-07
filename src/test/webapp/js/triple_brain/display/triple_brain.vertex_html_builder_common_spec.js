/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/webapp/js/test-scenarios",
    "test/webapp/js/test-utils",
    "test/webapp/js/mock",
    "triple_brain.vertex_service",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.vertex_html_builder_common",
    "triple_brain.graph_displayer_as_relative_tree"
], function (Scenarios, TestUtils, Mock, VertexService, UserMapAutocompleteProvider, VertexHtmlBuilderCommon, GraphDisplayerAsRelativeTree) {
    "use strict";
    describe("vertex_html_builder_common", function () {
        beforeEach(function () {

        });
        it("waits for suggestion to be integrated before handling autocomplete select", function () {
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                projectSearchResult = searchProvider.formatResults(
                    new Scenarios.getSearchResultsForProject().get(),
                    "project"
                )[0];
            var addGenericIdentification = spyOn(
                VertexService,
                "addGenericIdentification"
            );
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            VertexHtmlBuilderCommon._labelAutocompleteSelectHandler(
                bubble1,
                projectSearchResult
            );
            expect(
                VertexService.addGenericIdentification.callCount
            ).toBe(1);
            var oneBubble = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
            GraphDisplayerAsRelativeTree.showSuggestions(oneBubble);
            var vertexSuggestion = oneBubble.getTopMostChildBubble().getTopMostChildBubble();
            VertexHtmlBuilderCommon._labelAutocompleteSelectHandler(
                vertexSuggestion,
                projectSearchResult
            );
            expect(
                VertexService.addGenericIdentification.callCount
            ).toBe(1);
            vertexSuggestion.integrate(
                TestUtils.generateVertexUri()
            );
            expect(
                VertexService.addGenericIdentification.callCount
            ).toBe(2);
        });
    });
});