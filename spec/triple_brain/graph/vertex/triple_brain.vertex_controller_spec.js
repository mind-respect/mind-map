/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    "test/mock/triple_brain.vertex_service_mock",
    "triple_brain.vertex_controller",
    "triple_brain.selection_handler",
    'triple_brain.vertex_service',
    'triple_brain.mind_map_info'
], function (Scenarios, VertexServiceMock, VertexController, SelectionHandler, VertexService, MindMapInfo) {
    "use strict";
    describe("vertex_controller", function () {
        it("removes connected edges when removing a vertex", function () {
            var threeBubbles = new Scenarios.threeBubblesGraph();
            VertexServiceMock.removeVertex();
            MindMapInfo._setIsViewOnly(false);
            var bubble1 = threeBubbles.getBubble1InTree(),
                r1 = threeBubbles.getRelation1InTree();
            expect(
                bubble1.getNumberOfChild()
            ).toBe(2);
            var bubble2 = r1.getTopMostChildBubble();
            bubble2.getController().remove(true);
            expect(
                bubble1.getNumberOfChild()
            ).toBe(1);
        });
        it("cannot add sibling if center bubble", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var someChild = bubble1.getTopMostChildBubble().getTopMostChildBubble();
            MindMapInfo._setIsViewOnly(false);
            expect(
                someChild.getController().addSiblingCanDo()
            ).toBeTruthy();
            expect(
                bubble1.getController().addSiblingCanDo()
            ).toBeFalsy();
        });
        it("can add sibling", function () {
            VertexServiceMock.addRelationAndVertexToVertexMock();
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var numberOfChild = bubble1.getNumberOfChild();
            var someChild = bubble1.getTopMostChildBubble().getTopMostChildBubble();
            someChild.getController().addSibling();
            expect(
                bubble1.getNumberOfChild()
            ).toBe(numberOfChild + 1);
        });
        it("adding bubble and relation selects new bubble", function () {
            VertexServiceMock.addRelationAndVertexToVertexMock();
            var bubble = new Scenarios.threeBubblesGraph().getBubble2InTree();
            bubble.getController().addChild();
            var newBubble = bubble.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                newBubble.isSelected()
            ).toBeTruthy();
        });
        it("hides suggestions when calling the suggestions action when they are already visible", function () {
            var eventBubble = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
            MindMapInfo._setIsViewOnly(false);
            expect(
                eventBubble.getTopMostChildBubble().isVisible()
            ).toBeTruthy();
            eventBubble.getController().suggestions();
            expect(
                eventBubble.getTopMostChildBubble().isVisible()
            ).toBeFalsy();
        });
        it("changes in label privacy button when changing privacy of a collection of vertices", function () {
            loadFixtures('graph-element-menu.html');
            MindMapInfo._setIsViewOnly(false);
            var scenario = new Scenarios.threeBubblesGraph();
            var bubble1 = scenario.getBubble1InTree();
            bubble1.reviewInLabelButtonsVisibility();
            expect(
                bubble1.getMakePrivateButtonInBubbleContent()
            ).toHaveClass("hidden");
            expect(
                bubble1.getMakePublicButtonInBubbleContent()
            ).not.toHaveClass("hidden");
            VertexServiceMock.makeCollectionPublic();
            new VertexController.Self(
                [
                    bubble1,
                    scenario.getBubble2InTree()
                ]
            ).makePublic();
            expect(
                bubble1.getMakePrivateButtonInBubbleContent()
            ).not.toHaveClass("hidden");
            expect(
                bubble1.getMakePublicButtonInBubbleContent()
            ).toHaveClass("hidden");
            VertexServiceMock.makeCollectionPrivate();
            new VertexController.Self(
                [
                    bubble1,
                    scenario.getBubble2InTree()
                ]
            ).makePrivate();
            expect(
                bubble1.getMakePrivateButtonInBubbleContent()
            ).toHaveClass("hidden");
            expect(
                bubble1.getMakePublicButtonInBubbleContent()
            ).not.toHaveClass("hidden");
        });
    });
});