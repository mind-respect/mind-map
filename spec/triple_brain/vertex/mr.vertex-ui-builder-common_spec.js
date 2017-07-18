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
    'triple_brain.id_uri'
], function (Scenarios, TestUtils, Mock, SchemaServiceMock, GraphServiceMock, GraphElement, VertexController, VertexService, UserMapAutocompleteProvider, VertexUiBuilderCommon, MindMapInfo, Identification, IdUri) {
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
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            expect(
                bubble1.getModel().hasIdentifications()
            ).toBeFalsy();
            VertexUiBuilderCommon._labelAutocompleteSelectHandler(
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
            VertexUiBuilderCommon._labelAutocompleteSelectHandler(
                suggestionInTree,
                projectSearchResult
            );
            expect(
                suggestionInTree.getModel().getIdentifiers().length
            ).toBe(2);
            var newVertexUi = suggestionInTree.integrate(
                TestUtils.generateVertexUri()
            );
            expect(
                newVertexUi.getModel().getIdentifiers().length
            ).toBe(3);
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
        it("can identify to a vertex using autocomplete", function () {
            MindMapInfo._setIsViewOnly(false);
            var otherUserVertexSearchResult = new Scenarios.threeBubblesGraphFork().getCenterAsSearchResult()[0];
            var otherUserVertexIdentifier = Identification.fromFriendlyResource(
                otherUserVertexSearchResult.nonFormattedSearchResult.graphElement
            );
            var b3 = new Scenarios.threeBubblesGraph().getBubble3InTree();
            expect(
                b3.getModel().hasIdentification(
                    otherUserVertexIdentifier
                )
            ).toBeFalsy();
            VertexUiBuilderCommon._labelAutocompleteSelectHandler(
                b3,
                otherUserVertexSearchResult
            );
            expect(
                b3.getModel().hasIdentification(
                    otherUserVertexIdentifier
                )
            ).toBeTruthy();
        });
    });
});