/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "test/mock/triple_brain.graph_element_service_mock",
    "test/mock/triple_brain.schema_service_mock",
    "triple_brain.vertex_service",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.vertex_html_builder_common",
    "triple_brain.mind_map_info"
], function (Scenarios, TestUtils, GraphElementServiceMock, SchemaServiceMock, VertexService, UserMapAutocompleteProvider, VertexHtmlBuilderCommon, MindMapInfo) {
    "use strict";
    describe("vertex_html_builder_common", function () {
        it("waits for suggestion to be integrated before handling autocomplete select", function () {
            MindMapInfo._setIsViewOnly(false);
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                projectSearchResult = searchProvider.formatResults(
                    new Scenarios.getSearchResultsForProject().get(),
                    "project"
                )[0];
            GraphElementServiceMock.addIdentification();
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            expect(
                bubble1.getModel().hasIdentifications()
            ).toBeFalsy();
            VertexHtmlBuilderCommon._labelAutocompleteSelectHandler(
                bubble1,
                projectSearchResult
            );
            expect(
                bubble1.getModel().hasIdentifications()
            ).toBeTruthy();
            SchemaServiceMock.getMock(
                new Scenarios.getProjectSchema().getGraph()
            );
            var suggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
            VertexHtmlBuilderCommon._labelAutocompleteSelectHandler(
                suggestionInTree,
                projectSearchResult
            );
            expect(
                suggestionInTree.getModel().getIdentifications().length
            ).toBe(2);
            var newVertexUi = suggestionInTree.integrate(
                TestUtils.generateVertexUri()
            );
            expect(
                newVertexUi.getModel().getIdentifications().length
            ).toBe(3);
        });
    });
});