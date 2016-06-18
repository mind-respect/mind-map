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
    describe("compare_flow", function () {
        it("resets graph elements label when quitting compare mode", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var bubble1 = scenario.getBubble1InTree();
            bubble1.addGenericIdentification(
                Identification.fromFriendlyResource(
                    bubble1.getModel()
                )
            );
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    scenario.getGraph()
                )
            );
            bubble1.setText("banana");
            bubble1.getLabel().blur();
            expect(
                bubble1.text()
            ).toBe(
                "banana1"
            );
            CompareFlow._quit();
            expect(
                bubble1.text()
            ).toBe(
                "banana"
            );
        });
    });
});