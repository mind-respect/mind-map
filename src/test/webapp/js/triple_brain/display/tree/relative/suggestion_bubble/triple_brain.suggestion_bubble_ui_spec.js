/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "test/webapp/js/test-scenarios",
    "test/webapp/js/test-utils",
    "triple_brain.suggestion_service",
    "triple_brain.graph_displayer_as_relative_tree"
], function (Scenarios, TestUtils, SuggestionService, GraphDisplayerAsRelativeTree) {
    "use strict";
    describe("suggestion_bubble_ui", function () {
        var oneSuggestionScenario;
        beforeEach(function () {
            oneSuggestionScenario = new Scenarios.oneBubbleHavingSuggestionsGraph();
        });
        it("does not update the label of other bubbles on the map that are the same suggestion", function () {
            SuggestionService.accept = function(){};
            var suggestion = oneSuggestionScenario.getAVertexSuggestionUi(),
                sameSuggestion = oneSuggestionScenario.getAVertexSuggestionUi();
            suggestion.getLabel().text("test").blur();
            expect(
                suggestion.text()
            ).toBe("test");
            expect(
                sameSuggestion.text()
            ).not.toBe("test");
        });
        it("can remove newly accepted suggestion", function () {
            var oneBubbleHavingSuggestionsGraph = new Scenarios.oneBubbleHavingSuggestionsGraph();
            var eventBubble = oneBubbleHavingSuggestionsGraph.getVertexUi();
            GraphDisplayerAsRelativeTree.showSuggestions(eventBubble);
            var vertexSuggestionInTree = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            vertexSuggestionInTree.integrateUsingNewVertexAndEdgeUri(
                TestUtils.generateVertexUri(),
                TestUtils.generateEdgeUri()
            );
            var newVertex = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                eventBubble.hasChildren()
            ).toBeTruthy();
            var numberOfChild = eventBubble.getNumberOfChild();
            newVertex.remove();
            expect(
                eventBubble.getNumberOfChild()
            ).toBe(numberOfChild - 1);
        });
    });
});