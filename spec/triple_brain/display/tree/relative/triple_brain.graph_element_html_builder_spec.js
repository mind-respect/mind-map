/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/mock",
    "triple_brain.graph_displayer_as_relative_tree"
], function (Scenarios, Mock, GraphDisplayerAsRelativeTree) {
    "use strict";
    describe("graph_element_html_builder", function () {
        it("does not update label to service if label has not changed", function () {
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

        it("does not accept suggestion if label has not changed", function () {
            var oneBubbleHavingSuggestionsGraph = new Scenarios.oneBubbleHavingSuggestionsGraph();
            var eventBubble = oneBubbleHavingSuggestionsGraph.getVertexUi();
            GraphDisplayerAsRelativeTree.addSuggestionsToVertex(
                eventBubble.getModel().getSuggestions(),
                eventBubble
            );
            var vertexSuggestionInTree = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            Mock.mockAcceptSuggestion();
            expect(
                vertexSuggestionInTree.isVertexSuggestion()
            ).toBeTruthy();
            var vertexSuggestionLabel = vertexSuggestionInTree.getLabel();
            vertexSuggestionInTree.focus();
            vertexSuggestionLabel.append("");
            vertexSuggestionLabel.blur();
            vertexSuggestionInTree = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                vertexSuggestionInTree.isVertexSuggestion()
            ).toBeTruthy();
            vertexSuggestionInTree.focus();
            vertexSuggestionLabel.append("new text");
            vertexSuggestionLabel.blur();
            vertexSuggestionInTree = eventBubble.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                vertexSuggestionInTree.isVertexSuggestion()
            ).toBeFalsy();
        });
        it("accepts relation and vertex suggestion if relation label is changed", function () {
            var oneBubbleHavingSuggestionsGraph = new Scenarios.oneBubbleHavingSuggestionsGraph();
            var eventBubble = oneBubbleHavingSuggestionsGraph.getVertexUi();
            GraphDisplayerAsRelativeTree.addSuggestionsToVertex(
                eventBubble.getModel().getSuggestions(),
                eventBubble
            );
            var relationSuggestion = eventBubble.getTopMostChildBubble();
            var vertexSuggestionInTree = relationSuggestion.getTopMostChildBubble();
            Mock.mockAcceptSuggestion();
            expect(
                relationSuggestion.isRelationSuggestion()
            ).toBeTruthy();
            expect(
                vertexSuggestionInTree.isVertexSuggestion()
            ).toBeTruthy();
            var relationLabel = relationSuggestion.getLabel();
            relationSuggestion.focus();
            relationLabel.append("new text");
            relationLabel.blur();
            relationSuggestion = eventBubble.getTopMostChildBubble();
            vertexSuggestionInTree = relationSuggestion.getTopMostChildBubble();
            expect(
                relationSuggestion.isRelationSuggestion()
            ).toBeFalsy();
            expect(
                vertexSuggestionInTree.isVertexSuggestion()
            ).toBeFalsy();
        });
        
        it("shows note button only if element has a note", function () {
            loadFixtures('graph-element-menu.html');
            var threeBubblesGraph = new Scenarios.threeBubblesGraph();
            var bubble1InTree = threeBubblesGraph.getBubble1InTree();
            expect(
                bubble1InTree.hasNote()
            ).toBeFalsy();
            expect(
                bubble1InTree.getNoteButtonInBubbleContent().hasClass("hidden")
            ).toBeTruthy();
            var bubble3InTree = threeBubblesGraph.getBubble3InTree();
            expect(
                bubble3InTree.hasNote()
            ).toBeTruthy();
            expect(
                bubble3InTree.getNoteButtonInBubbleContent().hasClass("hidden")
            ).toBeFalsy();
        });
    });
});