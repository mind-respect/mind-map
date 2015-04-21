/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "test/webapp/js/test-scenarios",
    "test/webapp/js/mock",
    "triple_brain.graph_displayer_as_relative_tree"
], function (Scenarios, Mock, GraphDisplayerAsRelativeTree) {
    "use strict";
    describe("graph_element_html_builder", function () {
        beforeEach(function () {

        });
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
        it("accepts relation and vertex suggestion if relation label is changed", function () {
            var oneBubbleHavingSuggestionsGraph = new Scenarios.oneBubbleHavingSuggestionsGraph();
            var eventBubble = oneBubbleHavingSuggestionsGraph.getVertexUi();
            GraphDisplayerAsRelativeTree.showSuggestions(eventBubble);
            var relationSuggestion = eventBubble.getTopMostChildBubble();
            var vertexSuggestionInTree = relationSuggestion.getTopMostChildBubble();
            Mock.mockAcceptSuggestion();
            expect(
                relationSuggestion.getHtml().hasClass("suggestion")
            ).toBeTruthy();
            expect(
                vertexSuggestionInTree.getHtml().hasClass("suggestion")
            ).toBeTruthy();
            var relationLabel = relationSuggestion.getLabel();
            relationSuggestion.focus();
            relationLabel.append("new text");
            relationLabel.blur();
            expect(
                relationSuggestion.getHtml().hasClass("suggestion")
            ).toBeFalsy();
            expect(
                vertexSuggestionInTree.getHtml().hasClass("suggestion")
            ).toBeFalsy();
        });

        it("changes label of duplicate relations", function () {
            var duplicateRelationsScenario = new Scenarios.graphWithARelationInTwoSimilarRelationsGroup(),
                impact3InTheIndividualContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnTheIndividualContext(),
                impact3InSocietyContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnSocietyContext();

            impact3InTheIndividualContext.focus();
            impact3InTheIndividualContext.getLabel().append(" new text");
            impact3InTheIndividualContext.getLabel().blur();
            expect(
                impact3InTheIndividualContext.text()
            ).toBe(
                "impact 3 new text"
            );
            expect(
                impact3InSocietyContext.text()
            ).toBe(
                "impact 3 new text"
            );
        });
        it("changes label of duplicate vertices", function () {
            var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
            var bubble1 = graphWithCircularityScenario.getBubble1InTree();
            var bubble2 = graphWithCircularityScenario.getBubble2InTree();
            graphWithCircularityScenario.expandBubble2(bubble2);
            var bubble3 = bubble2.getTopMostChildBubble().getTopMostChildBubble();
            graphWithCircularityScenario.expandBubble3(bubble3);
            var bubble1Duplicate = bubble3.getTopMostChildBubble().getTopMostChildBubble();
            bubble1.focus();
            bubble1.getLabel().append(" new text");
            bubble1.getLabel().blur();
            expect(
                bubble1.text()
            ).toBe(
                "b1 new text"
            );
            expect(
                bubble1Duplicate.text()
            ).toBe(
                "b1 new text"
            );
        });
    });
});