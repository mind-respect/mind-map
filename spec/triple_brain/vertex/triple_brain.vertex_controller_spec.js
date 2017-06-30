/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    "test/mock/triple_brain.graph_service_mock",
    "triple_brain.vertex_controller",
    "triple_brain.selection_handler",
    'triple_brain.vertex_service',
    'triple_brain.mind_map_info'
], function ($, Scenarios, TestUtils, Mock, GraphServiceMock, VertexController, SelectionHandler, VertexService, MindMapInfo) {
    "use strict";
    describe("vertex_controller", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("removes connected edges when removing a vertex", function () {
            var threeBubbles = new Scenarios.threeBubblesGraph();
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
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var numberOfChild = bubble1.getNumberOfChild();
            var someChild = bubble1.getTopMostChildBubble().getTopMostChildBubble();
            someChild.getController().addSibling();
            expect(
                bubble1.getNumberOfChild()
            ).toBe(numberOfChild + 1);
        });
        it("adding bubble and relation selects new bubble", function () {
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
        it("adding bubble and relation makes new bubble public if parent is public", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            GraphServiceMock.getForCentralBubbleUri(
                scenario.getSubGraphForB2()
            );
            b2.getModel().makePublic();
            var hasVisited = false;
            b2.getController().addChild().done(function (triple) {
                hasVisited = true;
                expect(
                    triple.destinationVertex().getModel
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
            new VertexController.VertexController(
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
            new VertexController.VertexController(
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
            var childBubble = TestUtils.getChildWithLabel(
                groupRelation,
                "Possession of book 1"
            ).getTopMostChildBubble();
            expect(
                childBubble.isVertex()
            ).toBeTruthy();
            var numberOfChild = groupRelation.getNumberOfChild();
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
            var childBubble = TestUtils.getChildWithLabel(
                groupRelation,
                "Possession of book 1"
            ).getTopMostChildBubble();
            expect(
                childBubble.isVertex()
            ).toBeTruthy();
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
            Mock.getSpy(
                "VertexService",
                "makeCollectionPublic"
            ).and.callFake(function (vertices) {
                hasCalledService = true;
                nbVerticesToMakePublic = vertices.length;
                return $.Deferred().resolve();
            });
            new VertexController.VertexController([
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
            Mock.getSpy(
                "VertexService",
                "makeCollectionPrivate"
            ).and.callFake(function (vertices) {
                hasCalledService = true;
                nbVerticesToMakePrivate = vertices.length;
                return $.Deferred().resolve();
            });
            new VertexController.VertexController([
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
            b1.getController().makePrivate();
            expect(
                b1.getModel().isPublic()
            ).toBeFalsy();
        });
        it("can convert vertex to a distant vertex connected to the current parent vertex", function () {
            MindMapInfo._setIsViewOnly(false);
            var parentWithSingleChildScenario = new Scenarios.parentWithSingleChildScenario();
            var parent = parentWithSingleChildScenario.getParentInTree();
            GraphServiceMock.getForCentralBubbleUri(
                parentWithSingleChildScenario.getB1RelatedToParentGraph()
            );
            var child = parent.getTopMostChildBubble().getTopMostChildBubble();
            child.getController().convertToDistantBubbleWithUri(
                parentWithSingleChildScenario.getB1Uri()
            );
            var b1 = parent.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                b1.text()
            ).toBe("b1");
        });
        it("cannot add a relation to existing child", function () {
            MindMapInfo._setIsViewOnly(false);
            var parentWithSingleChildScenario = new Scenarios.parentWithSingleChildScenario();
            var parent = parentWithSingleChildScenario.getParentInTree();
            GraphServiceMock.getForCentralBubbleUri(
                parentWithSingleChildScenario.getB1RelatedToParentGraph()
            );
            var child = parent.getTopMostChildBubble().getTopMostChildBubble();
            child.getController().convertToDistantBubbleWithUri(
                parentWithSingleChildScenario.getB1Uri()
            );
            var newChild;
            parent.getController().addChild().then(function(triple){
                newChild = triple.destinationVertex();
            });
            newChild.getController().convertToDistantBubbleWithUri(
                parentWithSingleChildScenario.getB1Uri()
            ).then(function(){
                fail("should not be able to add a relation to an already existing child");
            });
        });
        it("cannot add a relation to existing parent", function () {
            MindMapInfo._setIsViewOnly(false);
            var parentWithSingleChildScenario = new Scenarios.parentWithSingleChildScenario();
            var parent = parentWithSingleChildScenario.getParentInTree();
            var getForCentralBubbleUriSpy = GraphServiceMock.getForCentralBubbleUri(
                parentWithSingleChildScenario.getB1RelatedToParentGraph()
            );
            var child = parent.getTopMostChildBubble().getTopMostChildBubble();
            child.getController().convertToDistantBubbleWithUri(
                parentWithSingleChildScenario.getB1Uri()
            );
            var newChild;
            parent.getController().addChild().then(function(triple){
                newChild = triple.destinationVertex();
            });
            var newChildChild;
            newChild.getController().addChild().then(function(triple){
                newChildChild = triple.destinationVertex();
            });
            expect(newChildChild.getController().convertToDistantBubbleWithUriCanDo(
                parent.getUri()
            )).toBeFalsy();
        });
        it("cannot add a relation to self", function () {
            MindMapInfo._setIsViewOnly(false);
            var parentWithSingleChildScenario = new Scenarios.parentWithSingleChildScenario();
            var parent = parentWithSingleChildScenario.getParentInTree();
            var child = parent.getTopMostChildBubble().getTopMostChildBubble();
            child.getController().convertToDistantBubbleWithUri(
                parentWithSingleChildScenario.getB1Uri()
            );
            var newChild;
            parent.getController().addChild().then(function(triple){
                newChild = triple.destinationVertex();
            });
            expect(newChild.getController().convertToDistantBubbleWithUriCanDo(
                parent.getUri()
            )).toBeFalsy();
        });
        it("cannot add a relation to a non owned vertex", function () {
            MindMapInfo._setIsViewOnly(false);
            var parentWithSingleChildScenario = new Scenarios.parentWithSingleChildScenario();
            var parent = parentWithSingleChildScenario.getParentInTree();
            var child = parent.getTopMostChildBubble().getTopMostChildBubble();
            expect(child.getController().convertToDistantBubbleWithUriCanDo(
                TestUtils.generateVertexUri("not-current-user")
            )).toBeFalsy();
        });
        it("can only add a relation to a vertex", function () {
            MindMapInfo._setIsViewOnly(false);
            var parentWithSingleChildScenario = new Scenarios.parentWithSingleChildScenario();
            var parent = parentWithSingleChildScenario.getParentInTree();
            expect(parent.getController().convertToDistantBubbleWithUriCanDo(
                new Scenarios.getProjectSchema().getCenterBubbleUri()
            )).toBeFalsy();
            expect(parent.getController().convertToDistantBubbleWithUriCanDo(
                new Scenarios.getProjectSchema().getCenterBubbleUri()
            )).toBeFalsy();
            expect(parent.getController().convertToDistantBubbleWithUriCanDo(
                new Scenarios.getKaraokeSchemaGraph().getLocationProperty().getUri()
            )).toBeFalsy();
            expect(parent.getController().convertToDistantBubbleWithUriCanDo(
                TestUtils.generateEdgeUri()
            )).toBeFalsy();
        });
        it("cannot convert a bubble to a distant relation if it has children", function () {
            MindMapInfo._setIsViewOnly(false);
            var parentWithSingleChildScenario = new Scenarios.parentWithSingleChildScenario();
            var parent = parentWithSingleChildScenario.getParentInTree();
            expect(
                parent.getController().convertToDistantBubbleWithUriCanDo(
                    parentWithSingleChildScenario.getB1Uri()
                )
            ).toBeFalsy();
        });

        it("keeps label of the relation when converting a bubble to a distant bubble", function () {
            var parentWithSingleChildScenario = new Scenarios.parentWithSingleChildScenario();
            var parent = parentWithSingleChildScenario.getParentInTree();
            var relation = parent.getTopMostChildBubble();
            expect(
                relation.text()
            ).toBe("relation");
            var child = relation.getTopMostChildBubble();
            GraphServiceMock.getForCentralBubbleUri(
                parentWithSingleChildScenario.getB1RelatedToParentGraph()
            );
            child.getController().convertToDistantBubbleWithUri(
                parentWithSingleChildScenario.getB1Uri()
            );
            relation = parent.getTopMostChildBubble();
            expect(
                relation.text()
            ).toBe("relation");
        });
        it("keeps the identifiers of the relation when converting a bubble to a distant bubble", function () {
            var parentWithSingleChildScenario = new Scenarios.parentWithSingleChildScenario();
            var parent = parentWithSingleChildScenario.getParentInTree();
            var relation = parent.getTopMostChildBubble();
            relation.getModel().addIdentification(
                TestUtils.dummyIdentifier()
            );
            var child = relation.getTopMostChildBubble();
            GraphServiceMock.getForCentralBubbleUri(
                parentWithSingleChildScenario.getB1RelatedToParentGraph()
            );
            child.getController().convertToDistantBubbleWithUri(
                parentWithSingleChildScenario.getB1Uri()
            );
            relation = parent.getTopMostChildBubble();
            expect(
                relation.getModel().hasIdentifications()
            ).toBeTruthy();
        });
        it("automatically expands a child bubble having a single hidden relation when it's parent is expanded", function () {
            var scenario = new Scenarios.automaticExpand();
            var b3 = scenario.getB3InTree();
            var graphMocks = {};
            graphMocks[b3.getUri()] = scenario.getB3SubGraph();
            graphMocks[scenario.getB31Uri()] = scenario.getB31SubGraph();
            GraphServiceMock.getForCentralBubbleUriMultiple(graphMocks);
            b3.getController().expand();
            var b31 = TestUtils.getChildWithLabel(
                b3,
                'r31'
            ).getTopMostChildBubble();
            expect(
                b31.text()
            ).toBe("b31");
            expect(
                b31.isExpanded()
            ).toBeTruthy();
            var b32 = TestUtils.getChildWithLabel(
                b3,
                'r32'
            ).getTopMostChildBubble();
            expect(
                b32.text()
            ).toBe("b32");
            expect(
                b32.isExpanded()
            ).toBeFalsy();
        });
    });
});