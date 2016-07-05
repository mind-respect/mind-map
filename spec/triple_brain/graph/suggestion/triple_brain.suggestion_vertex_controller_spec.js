/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    "test/mock/triple_brain.graph_service_mock",
    "triple_brain.suggestion_vertex_controller",
    "triple_brain.sub_graph",
    'triple_brain.mind_map_info'
], function (Scenarios, TestUtils, Mock, GraphServiceMock, SuggestionVertexController, SubGraph, MindMapInfo) {
    "use strict";
    describe("suggestion_vertex_controller", function () {
        it("also accepts all parent suggestions when a suggestion is accepted", function () {
            Mock.mockAcceptSuggestion();
            MindMapInfo._setIsViewOnly(false);
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            ).remove();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            var r2 = TestUtils.getChildWithLabel(
                b1Fork,
                "r2"
            );
            expect(
                r2.isRelation()
            ).toBeFalsy();
            var b3 = r2.getTopMostChildBubble();
            GraphServiceMock.getForCentralVertexUriMock(
                new Scenarios.threeBubblesGraph().getSurroundBubble3Graph()
            );
            b3.addChildTree();
            expect(
                b3.isVertex()
            ).toBeFalsy();
            var r4 = TestUtils.getChildWithLabel(
                b3,
                "r4"
            );
            expect(
                r4.isRelation()
            ).toBeFalsy();
            var b5 = r4.getTopMostChildBubble();
            expect(
                b5.isVertexSuggestion()
            ).toBeTruthy();
            b5.getController().accept();
            r4 = b5.getParentBubble();
            expect(
                r4.isRelation()
            ).toBeTruthy();
            b3 = r4.getParentBubble();
            expect(
                b3.isVertex()
            ).toBeTruthy();
            r2 = b3.getParentBubble();
            expect(
                r2.isRelation()
            ).toBeTruthy();
        });
    });
});