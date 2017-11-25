/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    'test/mock',
    "test/mock/triple_brain.schema_service_mock",
    "test/mock/triple_brain.graph_service_mock",
    "triple_brain.graph_element",
    'triple_brain.vertex_controller',
    "triple_brain.vertex_service",
    "triple_brain.user_map_autocomplete_provider",
    "mr.vertex-ui-builder-common",
    "triple_brain.mind_map_info",
    'triple_brain.identification',
    'triple_brain.vertex_ui'
], function (Scenarios, TestUtils, Mock, SchemaServiceMock, GraphServiceMock, GraphElement, VertexController, VertexService, UserMapAutocompleteProvider, VertexUiBuilderCommon, MindMapInfo, Identification, VertexUi) {
    "use strict";
    describe("vertex-ui-builder-common", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });

        it("waits for suggestion to be integrated before handling autocomplete select", function () {
            MindMapInfo._setIsViewOnly(false);
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                projectSearchResult = searchProvider.formatResults(
                    new Scenarios.getSearchResultsForProject().get(),
                    "project"
                )[0];
            var buildAfterAutocompleteMenuSpy = spyOn(VertexUi.VertexUi.prototype, "buildAfterAutocompleteMenu");
            expect(
                buildAfterAutocompleteMenuSpy.calls.count()
            ).toBe(0);
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            VertexUiBuilderCommon._labelAutocompleteSelectHandler(
                bubble1,
                projectSearchResult
            );
            expect(
                buildAfterAutocompleteMenuSpy.calls.count()
            ).toBe(1);
            SchemaServiceMock.getMock(
                new Scenarios.getProjectSchema().getGraph()
            );
            var suggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
            VertexUiBuilderCommon._labelAutocompleteSelectHandler(
                suggestionInTree,
                projectSearchResult
            );
            expect(
                buildAfterAutocompleteMenuSpy.calls.count()
            ).toBe(1);
            suggestionInTree.integrate(
                TestUtils.generateVertexUri()
            );
            expect(
                buildAfterAutocompleteMenuSpy.calls.count()
            ).toBe(2);
        });

        it("in handling autocomplete select does not try to convert to distant bubble if schema", function () {
            MindMapInfo._setIsViewOnly(false);
            var convertToDistantSpy = spyOn(
                VertexController.VertexController.prototype,
                'convertToDistantBubbleWithUri'
            );
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                projectSearchResult = searchProvider.formatResults(
                    new Scenarios.getSearchResultsForProject().get(),
                    "project"
                )[0];
            var schema = new Scenarios.getProjectSchema().getSchemaInTree();
            VertexUiBuilderCommon._labelAutocompleteSelectHandler(
                schema,
                projectSearchResult
            );
            expect(
                convertToDistantSpy.calls.count()
            ).toBe(0);
        });

        it("updates label with the autocomplete text after select", function () {
            MindMapInfo._setIsViewOnly(false);
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
                projectSearchResult = searchProvider.formatResults(
                    new Scenarios.getSearchResultsForProject().get(),
                    "project"
                )[0];
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var setLabelSpy = Mock.getSpy(
                "FriendlyResourceService",
                'updateLabel'
            ).and.callFake(function (ui, newLabel) {
                expect(newLabel).toMatch(/project/);
            });
            VertexUiBuilderCommon._labelAutocompleteSelectHandler(
                bubble1,
                projectSearchResult
            );
            expect(
                setLabelSpy
            ).toHaveBeenCalled();
        });
        it("creates a relation for the parent to a distant vertex when selecting a reference to an owned bubble in autocomplete", function () {
            MindMapInfo._setIsViewOnly(false);
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas();
            var b1SearchResult = searchProvider.formatResults(
                new Scenarios.getSearchResultForB1().get()
            )[0];
            MindMapInfo._setIsViewOnly(false);
            var parentWithSingleChildScenario = new Scenarios.parentWithSingleChildScenario();
            var parent = parentWithSingleChildScenario.getParentInTree();
            var child = parent.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                child.hasChildren()
            ).toBeFalsy();
            GraphServiceMock.getForCentralBubbleUri(
                parentWithSingleChildScenario.getB1RelatedToParentGraph()
            );
            expect(
                child.text()
            ).not.toBe("b1");
            VertexUiBuilderCommon._labelAutocompleteSelectHandler(
                child,
                b1SearchResult
            );
            child = parent.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                child.text()
            ).toBe("b1");
        });
    });
});