/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "triple_brain.sub_graph"
], function (Scenarios, TestUtils, SubGraph) {
    "use strict";
    describe("suggestion_relation_ui", function () {
        it("can handle label update]", function(){
            var relationSuggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree().getParentBubble();
            relationSuggestionInTree.getSuggestion()._setType(undefined);
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
    });
});