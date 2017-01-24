/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    'test/mock',
    "test/mock/triple_brain.schema_service_mock",
    "test/mock/triple_brain.graph_service_mock",
    'triple_brain.vertex_controller',
    "triple_brain.vertex_service",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.vertex_html_builder_common",
    "triple_brain.mind_map_info",
    'triple_brain.identification',
    'triple_brain.id_uri'
], function (Scenarios, TestUtils, Mock, SchemaServiceMock, GraphServiceMock, VertexController, VertexService, UserMapAutocompleteProvider, VertexHtmlBuilderCommon, MindMapInfo, Identification, IdUri) {
    "use strict";
    describe("vertex_html_builder_common", function () {
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
                suggestionInTree.getModel().getIdentifiers().length
            ).toBe(2);
            var newVertexUi = suggestionInTree.integrate(
                TestUtils.generateVertexUri()
            );
            expect(
                newVertexUi.getModel().getIdentifiers().length
            ).toBe(3);
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
            VertexHtmlBuilderCommon._labelAutocompleteSelectHandler(
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
            VertexHtmlBuilderCommon._labelAutocompleteSelectHandler(
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
            var parentWithSingleChildScenario = new Scenarios.parentWithSingleChildScenario();
            var parent = parentWithSingleChildScenario.getParentInTree();
            var child = parent.getTopMostChildBubble().getTopMostChildBubble();
            var otherUserVertexSearchResult = new Scenarios.threeBubblesGraphFork().getCenterAsSearchResult()[0];
            var otherUserVertexIdentifier = Identification.fromSearchResult(
                otherUserVertexSearchResult
            );
            expect(
                child.getModel().hasIdentification(
                    otherUserVertexIdentifier
                )
            ).toBeFalsy();
            Mock.getSpy(
                "UserService",
                "authenticatedUserInCache"
            ).and.returnValue({
                user_name: IdUri.getOwnerFromUri(
                    child.getUri()
                )
            });
            VertexHtmlBuilderCommon._labelAutocompleteSelectHandler(
                child,
                otherUserVertexSearchResult
            );
            expect(
                child.getModel().hasIdentification(
                    otherUserVertexIdentifier
                )
            ).toBeTruthy();
        });
    });
});