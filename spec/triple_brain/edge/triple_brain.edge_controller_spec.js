/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    "test/mock/triple_brain.edge_service_mock",
    'triple_brain.edge_service',
    'triple_brain.edge_controller',
    'triple_brain.mind_map_info'
], function (Scenarios, TestUtils, Mock, EdgeServiceMock, EdgeService, EdgeController, MindMapInfo) {
    "use strict";
    describe("edge_controller", function () {
        it("can remove edge", function () {
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            var bubble1 = threeBubblesScenario.getBubble1InTree();
            var numberOfChild = bubble1.getNumberOfChild();
            var relation1 = bubble1.getTopMostChildBubble();
            Mock.mockRemoveEdge();
            MindMapInfo.setIsAnonymous(false);
            MindMapInfo._setIsViewOnly(false);
            new EdgeController.RelationController(
                relation1
            ).remove();
            expect(
                bubble1.getNumberOfChild()
            ).toBe(numberOfChild - 1);
        });
        it("changes to a group relation when adding a child", function () {
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            var bubble1 = threeBubblesScenario.getBubble1InTree();
            expect(
                TestUtils.getChildWithLabel(bubble1, "r1").isGroupRelation()
            ).toBeFalsy();
            MindMapInfo._setIsViewOnly(false);
            new EdgeController.RelationController(
                TestUtils.getChildWithLabel(bubble1, "r1")
            ).addChild();
            expect(
                TestUtils.getChildWithLabel(bubble1, "r1").isGroupRelation()
            ).toBeTruthy();
        });

        it("after adding a child, the new group relation has the original relation as an identifier", function () {
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            var bubble1 = threeBubblesScenario.getBubble1InTree();
            MindMapInfo._setIsViewOnly(false);
            var relation1 = TestUtils.getChildWithLabel(bubble1, "r1");
            var relation1Uri = relation1.getUri();
            new EdgeController.RelationController(
                relation1
            ).addChild();
            var newGroupRelation = TestUtils.getChildWithLabel(bubble1, "r1");
            var identifierExternalResourceUri = newGroupRelation.getGroupRelation().getIdentification().getExternalResourceUri();
            expect(
                identifierExternalResourceUri
            ).toBe(relation1Uri);
        });

        it("when a relation has an identifier adding a child changes to a group relation where the identifier is not the relation but the identifier", function () {
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            var bubble1 = threeBubblesScenario.getBubble1InTree();
            var relation1 = TestUtils.getChildWithLabel(bubble1, "r1");
            var karaokeIdentification = new Scenarios.getKaraokeSchemaGraph().getSchemaAsIdentification();
            relation1.getModel().addGenericIdentification(karaokeIdentification);
            MindMapInfo._setIsViewOnly(false);
            new EdgeController.RelationController(
                relation1
            ).addChild();
            var newGroupRelation = TestUtils.getChildWithLabel(bubble1, "karaoke");
            var identifierExternalResourceUri = newGroupRelation.getGroupRelation().getIdentification().getExternalResourceUri();
            expect(
                identifierExternalResourceUri
            ).toBe(karaokeIdentification.getExternalResourceUri());
        });
        it("adds new relation under the group relation when adding a child to a relation under a group relation", function(){
            MindMapInfo._setIsViewOnly(false);
            var centerVertex = new Scenarios.GraphWithSimilarRelationsScenario().getCenterVertexInTree();
            expect(
                centerVertex.getNumberOfChild()
            ).toBe(
                4
            );
            var groupRelation = TestUtils.getChildWithLabel(
                centerVertex,
                "Possession"
            );
            groupRelation.expand();
            expect(
                groupRelation.getNumberOfChild()
            ).toBe(3);
            var relationUnderGroupRelation = groupRelation.getTopMostChildBubble();
            relationUnderGroupRelation.getController().addChild();
            expect(
                centerVertex.getNumberOfChild()
            ).toBe(4);
        });
        it("adds all the identifiers of the relation to the the new child and group relation when adding a child", function(){
            var groupRelation = new Scenarios.GraphWithSimilarRelationsScenario().getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var relationUnderGroupRelation = TestUtils.getChildWithLabel(
                groupRelation,
                "Possessed by book 2"
            );
            var newGroupRelation = relationUnderGroupRelation.getController().addChild().getModel();
            expect(
                newGroupRelation.getIdentifiers().length
            ).toBe(2);
        });
        it("removes only one relation when removing a relation to a duplicated bubble", function () {
            var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
            var bubble1 = graphWithCircularityScenario.getBubble1InTree();
            var bubble3 = TestUtils.getChildWithLabel(
                bubble1,
                "r3"
            ).getTopMostChildBubble();
            graphWithCircularityScenario.expandBubble3(bubble3);
            var aRelationToSameBubble = bubble3.getTopMostChildBubble();
            expect(
                aRelationToSameBubble.text()
            ).toBe("r2");
            var anotherRelationToTheSameBubble = TestUtils.getChildWithLabel(
                bubble1,
                "r1"
            );
            expect(
                TestUtils.isGraphElementUiRemoved(
                    aRelationToSameBubble
                )
            ).toBeFalsy();
            expect(
                TestUtils.isGraphElementUiRemoved(
                    anotherRelationToTheSameBubble
                )
            ).toBeFalsy();
            MindMapInfo._setIsViewOnly(false);
            EdgeServiceMock.remove();
            new EdgeController.RelationController(
                aRelationToSameBubble
            ).remove();
            expect(
                TestUtils.isGraphElementUiRemoved(
                    aRelationToSameBubble
                )
            ).toBeTruthy();
            expect(
                TestUtils.isGraphElementUiRemoved(
                    anotherRelationToTheSameBubble
                )
            ).toBeFalsy();
        });
        it("removes other instances of duplicated relation when removing", function () {
            var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
            var bubble1 = graphWithCircularityScenario.getBubble1InTree();
            var aRelation = TestUtils.getChildWithLabel(
                bubble1,
                "r3"
            );
            var bubble2 = TestUtils.getChildWithLabel(
                bubble1,
                "r1"
            ).getTopMostChildBubble();
            graphWithCircularityScenario.expandBubble2(bubble2);
            var bubble3 = bubble2.getTopMostChildBubble().getTopMostChildBubble();
            graphWithCircularityScenario.expandBubble3(bubble3);
            var sameRelation = bubble3.getTopMostChildBubble();
            expect(
                aRelation.text()
            ).toBe("r3");
            expect(
                sameRelation.text()
            ).toBe("r3");
            expect(
                TestUtils.isGraphElementUiRemoved(
                    aRelation
                )
            ).toBeFalsy();
            expect(
                TestUtils.isGraphElementUiRemoved(
                    sameRelation
                )
            ).toBeFalsy();
            MindMapInfo._setIsViewOnly(false);
            EdgeServiceMock.remove();
            new EdgeController.RelationController(
                aRelation
            ).remove();
            expect(
                TestUtils.isGraphElementUiRemoved(
                    aRelation
                )
            ).toBeTruthy();
            expect(
                TestUtils.isGraphElementUiRemoved(
                    sameRelation
                )
            ).toBeTruthy();
        });
        it("changes destination vertex if relation is inverse when changing end vertex", function () {
            var changeSourceVertexSpy = spyOn(
                EdgeService,
                "changeSourceVertex"
            );
            var changeDestinationVertexSpy = spyOn(
                EdgeService,
                "changeDestinationVertex"
            );
            var scenario = new Scenarios.threeBubblesGraph();
            var b1 = scenario.getBubble1InTree();
            var r1 = TestUtils.getChildWithLabel(
                b1,
                "r1"
            );
            var b2 = r1.getTopMostChildBubble();
            var r2 = TestUtils.getChildWithLabel(
                b1,
                "r2"
            );
            scenario.expandBubble2(b2);
            r2.getController().changeEndVertex(
                b2
            );
            expect(
                changeSourceVertexSpy.calls.count()
            ).toBe(1);
            expect(
                changeDestinationVertexSpy.calls.count()
            ).toBe(0);
            EdgeServiceMock.inverse();
            r2.getController().reverse();
            r2.getController().changeEndVertex(
                b1
            );
            expect(
                changeSourceVertexSpy.calls.count()
            ).toBe(1);
            expect(
                changeDestinationVertexSpy.calls.count()
            ).toBe(1);
        });
    });
});


