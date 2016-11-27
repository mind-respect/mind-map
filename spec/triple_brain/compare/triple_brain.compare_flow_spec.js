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
    "test/mock/triple_brain.edge_service_mock",
    "triple_brain.mind_map_info"
], function (Scenarios, TestUtils, CompareFlow, Identification, SubGraph, VertexServiceMock, EdgeServiceMock, MindMapInfo) {
    "use strict";
    describe("compare_flow", function () {
        it("resets graph elements label when quitting compare mode", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var bubble1 = scenario.getBubble1InTree();
            bubble1.getModel().addGenericIdentification(
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
            VertexServiceMock.addRelationAndVertexToVertex();
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
        it("removes suggestion to remove having 'comparison' as origin when quitting comparison mode", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            VertexServiceMock.addRelationAndVertexToVertex();
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
        it("removes suggestion to add having 'comparison' as origin when quitting comparison mode", function () {
            MindMapInfo._setIsViewOnly(false);
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            EdgeServiceMock.remove();
            var r2 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            );
            r2.getController().remove();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            expect(
                TestUtils.hasChildWithLabel(
                    b1Fork,
                    "r2"
                )
            ).toBeTruthy();
            r2 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            );
            expect(
                r2.isRelationSuggestion()
            ).toBeTruthy();
            CompareFlow._quit();
            expect(
                TestUtils.hasChildWithLabel(
                    b1Fork,
                    "r2"
                )
            ).toBeFalsy();
        });
    });
});