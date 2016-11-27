/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    'test/test-scenarios',
    'test/test-utils',
    "test/mock/triple_brain.friendly_resource_service_mock",
    "test/mock/triple_brain.graph_element_service_mock",
    "test/mock/triple_brain.vertex_service_mock",
    "test/mock/triple_brain.graph_service_mock",
    "triple_brain.vertex_controller",
    "triple_brain.selection_handler",
    'triple_brain.vertex_service',
    'triple_brain.mind_map_info'
], function ($, Scenarios, TestUtils, FriendlyResourceServiceMock, GraphElementServiceMock, VertexServiceMock, GraphServiceMock, VertexController, SelectionHandler, VertexService, MindMapInfo) {
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
            VertexServiceMock.addRelationAndVertexToVertex();
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var numberOfChild = bubble1.getNumberOfChild();
            var someChild = bubble1.getTopMostChildBubble().getTopMostChildBubble();
            someChild.getController().addSibling();
            expect(
                bubble1.getNumberOfChild()
            ).toBe(numberOfChild + 1);
        });
        it("adding bubble and relation selects new bubble", function () {
            VertexServiceMock.addRelationAndVertexToVertex();
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            GraphServiceMock.getForCentralBubbleUri(
                scenario.getSubGraphForB2()
            );
            var hasVisited = false;
            b2.getController().addChild().done(function (triple) {
                hasVisited = true;
                expect(
                    triple.destinationVertex().isSelected()
                ).toBeTruthy();
            });
            expect(
                hasVisited
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
        it("expands the bubble when adding child", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b3 = scenario.getBubble3InTree();
            expect(
                b3.getNumberOfChild()
            ).toBe(0);
            VertexServiceMock.addRelationAndVertexToVertex();
            GraphServiceMock.getForCentralBubbleUri(
                scenario.getSubGraphForB3()
            );
            b3.getController().addChild();
            expect(
                b3.getNumberOfChild()
            ).toBe(3);
        });
        it("puts the new bubble under the group relation when adding a sibling to the child of group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            expect(
                groupRelation.isGroupRelation()
            ).toBeTruthy();
            groupRelation.expand();
            var childBubble = groupRelation.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                childBubble.isVertex()
            ).toBeTruthy();
            var numberOfChild = groupRelation.getNumberOfChild();
            VertexServiceMock.addRelationAndVertexToVertex();
            childBubble.getController().addSibling();
            expect(
                groupRelation.getNumberOfChild()
            ).toBe(numberOfChild + 1);
        });
        it("sets identification to the new relation when adding a sibling to the child of group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            expect(
                groupRelation.isGroupRelation()
            ).toBeTruthy();
            groupRelation.expand();
            var childBubble = groupRelation.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                childBubble.isVertex()
            ).toBeTruthy();
            VertexServiceMock.addRelationAndVertexToVertex();
            GraphElementServiceMock.addIdentification();
            FriendlyResourceServiceMock.updateLabel();
            var hasVisited = false;
            childBubble.getController().addSibling().then(function (triple) {
                hasVisited = true;
                var relation = triple.destinationVertex().getParentBubble();
                expect(
                    relation.getModel().hasIdentifications()
                ).toBeTruthy();
            });
            expect(
                hasVisited
            ).toBeTruthy();
        });
        it("does not load the surround graph when expanding a collapsed vertex", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            scenario.expandBubble2(b2);
            b2.collapse();
            var getGraphMock = GraphServiceMock.getForCentralBubbleUri(
                scenario.getSubGraphForB2()
            );
            b2.getController().expand();
            expect(
                getGraphMock.calls.count()
            ).toBe(0);
        });
        it("does not add child tree again when twice expanding a bubble", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            GraphServiceMock.getForCentralBubbleUri(
                scenario.getSubGraphForB2()
            );
            b2.getController().expand();
            expect(
                b2.getNumberOfChild()
            ).toBe(2);
            b2.getController().expand();
            expect(
                b2.getNumberOfChild()
            ).toBe(2);
        });
        it("expands expandable descendants when expanding already expanded bubble", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var multipleGraphReturn = {};
            multipleGraphReturn[
                scenario.getBubble2InTree().getUri()
                ] = scenario.getSubGraphForB2();
            multipleGraphReturn[
                scenario.getBubble3InTree().getUri()
                ] = scenario.getSubGraphForB3();
            GraphServiceMock.getForCentralBubbleUriMultiple(
                multipleGraphReturn
            );
            var b1 = scenario.getCenterBubbleInTree();
            var b2 = TestUtils.getChildWithLabel(
                b1,
                "r1"
            ).getTopMostChildBubble();
            expect(
                b2.isExpanded()
            ).toBeFalsy();
            var b3 = TestUtils.getChildWithLabel(
                b1,
                "r1"
            ).getTopMostChildBubble();
            expect(
                b3.isExpanded()
            ).toBeFalsy();
            b1.getController().expand();
            expect(
                b2.isExpanded()
            ).toBeTruthy();
            expect(
                b3.isExpanded()
            ).toBeTruthy();
        });
        it("does not make public already public vertices when making a collection public", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            b2.getModel().makePublic();
            var hasCalledService = false;
            var nbVerticesToMakePublic = 0;
            spyOn(VertexService, "makeCollectionPublic").and.callFake(function (vertices) {
                hasCalledService = true;
                nbVerticesToMakePublic = vertices.length;
                return $.Deferred().resolve();
            });
            new VertexController.Self([
                scenario.getBubble1InTree(),
                b2,
                scenario.getBubble3InTree()
            ]).makePublic();
            expect(
                hasCalledService
            ).toBeTruthy();
            expect(
                nbVerticesToMakePublic
            ).toBe(2);
        });
        it("does not make private already private vertices when making a collection private", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b1 = scenario.getBubble1InTree();
            b1.getModel().makePublic();
            var b3 = scenario.getBubble3InTree();
            b3.getModel().makePublic();
            var hasCalledService = false;
            var nbVerticesToMakePrivate = 0;
            spyOn(VertexService, "makeCollectionPrivate").and.callFake(function (vertices) {
                hasCalledService = true;
                nbVerticesToMakePrivate = vertices.length;
                return $.Deferred().resolve();
            });
            new VertexController.Self([
                b1,
                scenario.getBubble2InTree(),
                b3
            ]).makePrivate();
            expect(
                hasCalledService
            ).toBeTruthy();
            expect(
                nbVerticesToMakePrivate
            ).toBe(2);
        });
        it("makes model be private when making private", function () {
            var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            b1.getModel().makePublic();
            expect(
                b1.getModel().isPublic()
            ).toBeTruthy();
            VertexServiceMock.makePrivate();
            b1.getController().makePrivate();
            expect(
                b1.getModel().isPublic()
            ).toBeFalsy();
        });

    });
});