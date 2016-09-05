/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "test/test-scenarios",
    "test/test-utils",
    "test/mock/triple_brain.friendly_resource_service_mock",
    "test/mock/triple_brain.graph_element_service_mock",
    "triple_brain.graph_element_controller",
    "triple_brain.sub_graph"
], function ($, Scenarios, TestUtils, FriendlyResourceServiceMock, GraphElementServiceMock, GraphElementController, SubGraph) {
    "use strict";
    describe("graph_element_controller", function () {
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
            FriendlyResourceServiceMock.updateLabel();
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
        it("does does not show the expand bubbles button when there are no descendants to expand", function () {
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
        it("adds the group relation identifier to a vertex moving around another vertex that is under a group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var otherBubbleEdge = scenario.getOtherRelationInTree();
            var otherBubble = otherBubbleEdge.getTopMostChildBubble();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var groupRelationChild = groupRelation.getTopMostChildBubble();
            expect(
                otherBubbleEdge.hasIdentifications()
            ).toBeFalsy();
            GraphElementServiceMock.addIdentification();
            otherBubble.getController().moveAbove(
                groupRelationChild
            );
            expect(
                otherBubbleEdge.hasIdentifications()
            ).toBeTruthy();
        });
    });
});