/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "test/webapp/js/test-scenarios",
    "test/webapp/js/mock",
    "triple_brain.graph_displayer_as_relative_tree"
], function (Scenarios, Mock, GraphDisplayerAsRelativeTree) {
    "use strict";
    describe("vertex_html_builder_common", function () {
        beforeEach(function () {

        });
        it("does not update label to service if label has not change", function () {
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            var bubble1 = threeBubblesScenario.getBubble1InTree();
            var bubble1Label = bubble1.getLabel();
            var updateLabelInServiceSpy = Mock.mockUpdateLabel();
            expect(
                updateLabelInServiceSpy
            ).not.toHaveBeenCalled();

            bubble1.focus();
            bubble1Label.append("");
            bubble1Label.blur();
            expect(
                updateLabelInServiceSpy
            ).not.toHaveBeenCalled();
            bubble1Label.focus();
            bubble1Label.append("new text");
            bubble1Label.blur();
            expect(
                updateLabelInServiceSpy
            ).toHaveBeenCalled();
        });

        it("does not accept suggestion if label has not change", function () {
            var oneBubbleHavingSuggestionsGraph = new Scenarios.oneBubbleHavingSuggestionsGraph();
            var eventBubble = oneBubbleHavingSuggestionsGraph.getVertexUi();
            GraphDisplayerAsRelativeTree.showSuggestions(eventBubble);
            var vertexSuggestionInTree = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            Mock.mockAcceptSuggestion();
            expect(
                vertexSuggestionInTree.getHtml().hasClass("suggestion")
            ).toBeTruthy();
            var vertexSuggestionLabel = vertexSuggestionInTree.getLabel();
            vertexSuggestionInTree.focus();
            vertexSuggestionLabel.append("");
            vertexSuggestionLabel.blur();
            expect(
                vertexSuggestionInTree.getHtml().hasClass("suggestion")
            ).toBeTruthy();
            vertexSuggestionInTree.focus();
            vertexSuggestionLabel.append("new text");
            vertexSuggestionLabel.blur();
            expect(
                vertexSuggestionInTree.getHtml().hasClass("suggestion")
            ).toBeFalsy();
        });
    });
});