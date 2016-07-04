/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "triple_brain.compare_flow",
    "triple_brain.identification",
    "triple_brain.sub_graph",
    "test/mock/triple_brain.vertex_service_mock",
    "triple_brain.mind_map_info"
], function (Scenarios, TestUtils, CompareFlow, Identification, SubGraph, VertexServiceMock, MindMapInfo) {
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
        it("sets as suggestions to remove new bubbles added while in comparison mode", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            VertexServiceMock.addRelationAndVertexToVertexMock();
            MindMapInfo._setIsViewOnly(false);
            b1Fork.getController().addChild();
            var newRelation = TestUtils.getChildWithLabel(
                b1Fork,
                ""
            );
            expect(
                newRelation.isAComparisonSuggestionToRemove()
            ).toBeTruthy();
            var newVertex = newRelation.getTopMostChildBubble();
            expect(
                newVertex.isAComparisonSuggestionToRemove()
            ).toBeTruthy();
        });
        it("removes suggestion of comparison origin only when quitting comparison mode", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            VertexServiceMock.addRelationAndVertexToVertexMock();
            MindMapInfo._setIsViewOnly(false);
            b1Fork.getController().addChild();
            var newRelation = TestUtils.getChildWithLabel(
                b1Fork,
                ""
            );
            expect(
                newRelation.isAComparisonSuggestionToRemove()
            ).toBeTruthy();
            CompareFlow._quit();
            expect(
                newRelation.isAComparisonSuggestionToRemove()
            ).toBeFalsy();
        });
    });
});