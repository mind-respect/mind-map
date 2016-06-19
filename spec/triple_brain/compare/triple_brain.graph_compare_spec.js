/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "triple_brain.compare_flow",
    "triple_brain.identification",
    "triple_brain.sub_graph"
], function (Scenarios, TestUtils, CompareFlow, Identification, SubGraph) {
    "use strict";
    describe("graph_compare", function () {
        it("adds a bubble and it's child for a missing triple", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            var r2 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            );
            r2.remove();
            var numberOfChild = b1Fork.getNumberOfChild();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            expect(
                b1Fork.getNumberOfChild()
            ).toBe(numberOfChild + 1);
            r2 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            );
            var b3 = r2.getTopMostChildBubble();
            expect(
                b3.text()
            ).toBe("b3");
        });
        it("sets new triples as comparison suggestions", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            var r2 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            );
            expect(
                r2.getHtml()
            ).not.toHaveData(
                "comparison",
                "add"
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
                r2.getHtml()
            ).toHaveClass(
                "compare-add"
            );
            var b3 = r2.getTopMostChildBubble();
            expect(
                b3.getHtml()
            ).toHaveClass(
                "compare-add"
            );
        });
    });
});