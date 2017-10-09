/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    'test/mock',
    "test/mock/triple_brain.suggestion_service_mock",
    "triple_brain.sub_graph",
    "triple_brain.graph_element_ui",
    "triple_brain.selection_handler"
], function (Scenarios, TestUtils, Mock, SuggestionServiceMock, SubGraph, GraphElementUi, SelectionHandler) {
    "use strict";
    describe("suggestion_relation_ui", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("can handle label update", function(){
            var relationSuggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree().getParentBubble();
            relationSuggestionInTree.getSuggestion()._setType(undefined);
            SuggestionServiceMock.accept();
            relationSuggestionInTree.setText("bingo");
            relationSuggestionInTree.getLabel().blur();
            expect(
                relationSuggestionInTree.getModel().getLabel()
            ).toBe(
                "bingo"
            );
        });
        it("is not set as comparison suggestion to add after integration", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            var r2 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            );
            r2.remove();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            r2 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            );
            expect(
                r2.isAComparisonSuggestionToAdd()
            ).toBeTruthy();
            r2.integrate(
                "dummyUri",
                r2.getTopMostChildBubble()
            );
            r2 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            );
            expect(
                r2.isAComparisonSuggestionToAdd()
            ).toBeFalsy();
        });
        it("can be accessible by visiting all graph elements", function () {
            var oneBubbleHavingSuggestionsGraph = new Scenarios.oneBubbleHavingSuggestionsGraph();
            var eventBubble = oneBubbleHavingSuggestionsGraph.getVertexUi();
            var relationSuggestionInTree = eventBubble.getTopMostChildBubble();
            var isIncluded = false;
            GraphElementUi.visitAll(function(element){
                if(element.getId() === relationSuggestionInTree.getId()){
                    isIncluded = true;
                }
            });
            expect(
                isIncluded
            ).toBeTruthy();
        });
    });
});