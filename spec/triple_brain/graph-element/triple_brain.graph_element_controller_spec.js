/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "test/test-scenarios",
    "test/test-utils",
    'test/mock',
    "test/mock/triple_brain.graph_service_mock",
    "triple_brain.graph_element_controller",
    "triple_brain.sub_graph",
    "mr.app_controller"
], function ($, Scenarios, TestUtils, Mock, GraphServiceMock, GraphElementController, SubGraph, AppController) {
    "use strict";
    describe("graph_element_controller", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("displays the graph element note", function () {
            loadFixtures('graph-element-note-menu.html');
            var threeBubbles = new Scenarios.threeBubblesGraph();
            threeBubbles.getBubble1InTree().getController().note();
            expect(
                GraphElementController._getContentEditor().html()
            ).toBe("");
            threeBubbles.getBubble3InTree().getController().note();
            expect(
                GraphElementController._getContentEditor().html()
            ).toBe("b3 comment");
        });
        it("prevents iframe injection", function () {
            loadFixtures('graph-element-note-menu.html');
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble1.setNote("<iframe></iframe>");
            bubble1.getController().note();
            expect(
                GraphElementController._getContentEditor().html()
            ).toBe("");
        });
        it("prevents script injection", function () {
            loadFixtures('graph-element-note-menu.html');
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble1.setNote("<script>alert('yo')</script>");
            bubble1.getController().note();
            expect(
                GraphElementController._getContentEditor().html()
            ).toBe("");
        });
        it("can have script tag as text", function () {
            loadFixtures('graph-element-note-menu.html');
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble1.setNote(
                $("<div>").text("<script>alert('yo')</script>")
            );
            bubble1.getController().note();
            expect(
                GraphElementController._getContentEditor().html()
            ).toBe("<div>&lt;script&gt;alert('yo')&lt;/script&gt;</div>");
        });
        it("can have script tag as text", function () {

        });
        it("updates model label when accepting comparison", function () {
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            b1Fork.setText("potatoe");
            b1Fork.getLabel().blur();
            expect(
                b1Fork.getModel().getLabel()
            ).toBe("potatoe");
            b1Fork.getController().accept();
            expect(
                b1Fork.getModel().getLabel()
            ).toBe("b1");
        });
        it("does not show collapse button to leaves", function () {
            var scenario = new Scenarios.creationDateScenario();
            var b1 = scenario.getBubble1InTree();
            var b7 = TestUtils.getChildWithLabel(
                b1,
                "r6"
            ).getTopMostChildBubble();
            expect(
                b7.getController().collapseCanDo()
            ).toBeFalsy();
            scenario.expandBubble7(b7);
            expect(
                b7.getController().collapseCanDo()
            ).toBeTruthy();
        });
        it("shows the expand button to bubbles having hidden relations", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            expect(
                b2.getController().expandCanDo()
            ).toBeTruthy();
        });
        it("does not show the expand bubbles button when there are no descendants to expand", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            scenario.expandBubble2(
                b2
            );
            expect(
                b2.getController().expandCanDo()
            ).toBeFalsy();
        });
        it("does not show the collapse button to bubbles having the hidden relations container", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            expect(
                b2.hasVisibleHiddenRelationsContainer()
            ).toBeTruthy();
            expect(
                b2.getController().collapseCanDo()
            ).toBeFalsy();
            scenario.expandBubble2(
                b2
            );
            expect(
                b2.hasVisibleHiddenRelationsContainer()
            ).toBeFalsy();
            expect(
                b2.getController().collapseCanDo()
            ).toBeTruthy();
        });
        it("can move a vertex above a group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var otherBubble = scenario.getOtherRelationInTree().getTopMostChildBubble();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            otherBubble.moveAbove(
                groupRelation
            );
            var grandParent = otherBubble.getParentBubble().getParentBubble();
            expect(
                grandParent.isSameUri(
                    scenario.getCenterVertexInTree()
                )
            ).toBeTruthy();
        });
        it("can undo and redo a move under parent", function(){
            var scenario = new Scenarios.threeBubblesGraph();
            var b1 = scenario.getBubble1InTree();
            var b2 = scenario.getBubble2InTree();
            var b3 = scenario.getBubble3InTree();
            expect(
                b2.getParentVertex().isSameBubble(
                    b1
                )
            ).toBeTruthy();
            GraphServiceMock.getForCentralBubbleUri(
                scenario.getSubGraphForB3()
            );
            b2.getController().moveUnderParent(b3);
            expect(
                b2.getParentVertex().isSameBubble(
                    b1
                )
            ).toBeFalsy();
            AppController.undo();
            expect(
                b2.getParentVertex().isSameBubble(
                    b1
                )
            ).toBeTruthy();
            AppController.redo();
            expect(
                b2.getParentVertex().isSameBubble(
                    b1
                )
            ).toBeFalsy();
        });
        it("can undo and redo a move under a bubble", function(){
            var scenario = new Scenarios.creationDateScenario();
            var b7 = scenario.getBubble7InTree();
            scenario.expandBubble7(b7);
            var b72 = TestUtils.getChildWithLabel(
                b7,
                "r72"
            ).getTopMostChildBubble();
            var b73 = TestUtils.getChildWithLabel(
                b7,
                "r73"
            ).getTopMostChildBubble();
            expect(b73.getBubbleAbove().isSameBubble(
                b72
            )).toBeTruthy();
            b72.getController().moveUnder(
                b73.getParentBubble()
            );
            expect(b72.getBubbleAbove().isSameBubble(
                b73
            )).toBeTruthy();
            AppController.undo();
            expect(b73.getBubbleAbove().isSameBubble(
                b72
            )).toBeTruthy();
            AppController.redo();
            expect(b72.getBubbleAbove().isSameBubble(
                b73
            )).toBeTruthy();
        });
        it("adds the group relation identifier to a vertex when moving around another vertex that is under a group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var otherBubbleEdge = scenario.getOtherRelationInTree();
            var otherBubble = otherBubbleEdge.getTopMostChildBubble();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var groupRelationChild = groupRelation.getTopMostChildBubble();
            expect(
                otherBubbleEdge.getModel().hasIdentifications()
            ).toBeFalsy();
            otherBubble.getController().moveAbove(
                groupRelationChild
            );
            expect(
                otherBubbleEdge.getModel().hasIdentifications()
            ).toBeTruthy();
        });
    });
});