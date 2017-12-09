/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    'triple_brain.edge_controller',
    'triple_brain.mind_map_info',
    'triple_brain.graph_element_type'
], function (Scenarios, TestUtils, Mock, EdgeController, MindMapInfo, GraphElementType) {
    "use strict";
    describe("edge_controller", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        describe("remove", function(){
            it("can", function () {
                var threeBubblesScenario = new Scenarios.threeBubblesGraph();
                var bubble1 = threeBubblesScenario.getBubble1InTree();
                var numberOfChild = bubble1.getNumberOfChild();
                var relation1 = bubble1.getTopMostChildBubble();
                MindMapInfo.setIsAnonymous(false);
                MindMapInfo._setIsViewOnly(false);
                new EdgeController.RelationController(
                    relation1
                ).remove(true);
                expect(
                    bubble1.getNumberOfChild()
                ).toBe(numberOfChild - 1);
            });
            it("decrements number of connected relations to the parent", function () {
                var threeBubblesScenario = new Scenarios.threeBubblesGraph();
                var bubble1 = threeBubblesScenario.getBubble1InTree();
                expect(
                    bubble1.getModel().getNumberOfConnectedEdges()
                ).toBe(
                    2
                );
                var relation1 = bubble1.getTopMostChildBubble();
                relation1.getController().remove(true);
                expect(
                    bubble1.getModel().getNumberOfConnectedEdges()
                ).toBe(
                    1
                );
            });
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
            relation1.getModel().addIdentification(karaokeIdentification);
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
        it("adds all the identifiers of the relation to the the new child relation when adding a child", function(){
            var groupRelation = new Scenarios.GraphWithSimilarRelationsScenario().getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var relationUnderGroupRelation = TestUtils.getChildWithLabel(
                groupRelation,
                "Possessed by book 2"
            );
            var tested = false;
            relationUnderGroupRelation.getController().addChild().then(function(triple){
                expect(
                    triple.edge().getModel().getIdentifiers().length
                ).toBe(2);
                tested = true;
            });
            expect(
                tested
            ).toBeTruthy();
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
            new EdgeController.RelationController(
                aRelationToSameBubble
            ).remove(true);
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
            new EdgeController.RelationController(
                aRelation
            ).remove(true);
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
            var changeSourceVertexSpy = Mock.getSpy(
                "EdgeService",
                "changeSourceVertex"
            );
            var changeDestinationVertexSpy = Mock.getSpy(
                "EdgeService",
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
        it("can add a child to a relation under a group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var centerBubble = scenario.getCenterVertexInTree();
            var centerBubbleNumberOfChild = centerBubble.getNumberOfChild();
            var relationUnderGroupRelation = TestUtils.getChildWithLabel(
                groupRelation,
                "Possession of book 1"
            );
            expect(
                relationUnderGroupRelation.isGroupRelation()
            ).toBeFalsy();
            relationUnderGroupRelation.getController().addChild();
            var newGroupRelation = TestUtils.getChildWithLabel(
                groupRelation,
                "Possession of book 1"
            );
            expect(
                newGroupRelation.text()
            ).toBe("Possession of book 1");
            expect(
                newGroupRelation.isGroupRelation()
            ).toBeTruthy();
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(centerBubbleNumberOfChild);
        });
        it("does not hide the new group relation when adding a child to a relation under a group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var relationUnderGroupRelation = TestUtils.getChildWithLabel(
                groupRelation,
                "Possession of book 1"
            );
            expect(
                relationUnderGroupRelation.isGroupRelation()
            ).toBeFalsy();
            relationUnderGroupRelation.getController().addChild();
            var newGroupRelation = TestUtils.getChildWithLabel(
                groupRelation,
                "Possession of book 1"
            );
            expect(
                newGroupRelation.isGroupRelation()
            ).toBeTruthy();
            expect(
                newGroupRelation.isSetAsSameAsGroupRelation()
            ).toBeFalsy();
        });
        describe("addChild", function(){
            it("excludes self identifier when adding a child and already having identifiers", function(){
                var threeBubblesScenario = new Scenarios.threeBubblesGraph();
                var centerBubble = threeBubblesScenario.getBubble1InTree();
                var r1 = TestUtils.getChildWithLabel(
                    centerBubble,
                    "r1"
                );
                var identifier = TestUtils.dummyIdentifier();
                identifier.setLabel("some identifier");
                r1.getModel().addIdentification(
                    identifier
                );
                r1.getController().addChild();
                var newGroupRelation = TestUtils.getChildWithLabel(
                    centerBubble,
                    "some identifier"
                );
                expect(
                    newGroupRelation.isGroupRelation()
                ).toBeTruthy();
                var newRelation = TestUtils.getChildWithLabel(
                    centerBubble,
                    "some identifier"
                );
                expect(
                    newGroupRelation.getModel().getIdentifiers().length
                ).toBe(1);
            });
            it("includes previous vertex in group relation model vertices", function () {
                var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
                var center = scenario.getCenterVertexInTree();
                scenario.getOtherRelationInTree().getController().addChild();
                var newGroupRelation = TestUtils.getChildWithLabel(
                    center,
                    "other relation 2"
                );
                expect(
                    Object.keys(
                        newGroupRelation.getModel().getVertices()
                    ).length
                ).toBe(2);
            });
            it("can add child to a relation under a group relation where the external uri is this relation's uri", function () {
                var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
                var center = scenario.getCenterVertexInTree();
                center.getController().addChild().then(function(tripleUi){
                    var newEdge = tripleUi.edge();
                    tripleUi.destinationVertex().getController().setLabel("top vertex");
                    newEdge.getController().setLabel("parent group relation");
                    newEdge.getController().addChild();
                });
                var parentGroupRelation = TestUtils.getChildWithLabel(
                    center,
                    "parent group relation"
                );
                var topMostEdge = parentGroupRelation.getTopMostChildBubble();
                topMostEdge.getController().setLabel("top most edge");
                expect(
                    topMostEdge.getUri()
                ).toBe(parentGroupRelation.getModel().getIdentification().getExternalResourceUri());
                expect(
                    parentGroupRelation.getNumberOfChild()
                ).toBe(3);
                topMostEdge.getController().addChild();
                expect(
                    parentGroupRelation.getNumberOfChild()
                ).toBe(3);
                topMostEdge = TestUtils.getChildWithLabel(
                    parentGroupRelation,
                    "top most edge"
                );
                expect(
                    topMostEdge.isGroupRelation()
                ).toBeTruthy();
                expect(
                    topMostEdge.getNumberOfChild()
                ).toBe(3);
            });
        });
        describe("becomeParent", function(){
            it("adds it's identifiers to the moved edge when becoming a parent", function () {
                var threeBubblesScenario = new Scenarios.threeBubblesGraph();
                var centerBubble = threeBubblesScenario.getBubble1InTree();
                var r2 = TestUtils.getChildWithLabel(
                    centerBubble,
                    "r2"
                );
                var b3 = r2.getTopMostChildBubble();
                var r1 = TestUtils.getChildWithLabel(
                    centerBubble,
                    "r1"
                );
                r1.getModel().addIdentification(
                    TestUtils.dummyIdentifier()
                );
                expect(
                    r2.getModel().getIdentifiers().length
                ).toBe(0);
                b3.getController().moveUnderParent(r1);
                expect(
                    r2.getModel().getIdentifiers().length
                ).toBe(1);
            });
            it("adds the relation's identifier to the child relation", function(){
                var threeBubblesScenario = new Scenarios.threeBubblesGraph();
                var centerBubble = threeBubblesScenario.getBubble1InTree();
                var r2 = TestUtils.getChildWithLabel(
                    centerBubble,
                    "r2"
                );
                var b3 = r2.getTopMostChildBubble();
                var r1 = TestUtils.getChildWithLabel(
                    centerBubble,
                    "r1"
                );
                expect(
                    r2.getModel().getIdentifiersIncludingSelf().length
                ).toBe(1);
                b3.getController().moveUnderParent(r1);
                expect(
                    r2.getModel().getIdentifiersIncludingSelf().length
                ).toBe(2);
            });
            it("can become parent of a relation", function(){
                var threeBubblesScenario = new Scenarios.threeBubblesGraph();
                var centerBubble = threeBubblesScenario.getBubble1InTree();
                var r2 = TestUtils.getChildWithLabel(
                    centerBubble,
                    "r2"
                );
                var r1 = TestUtils.getChildWithLabel(
                    centerBubble,
                    "r1"
                );
                expect(
                    r1.getParentBubble().text()
                ).not.toBe("r2");
                r1.getController().moveUnderParent(r2);
                expect(
                    r1.getParentBubble().text()
                ).toBe("r2");
            });
            it("can become parent of a group relation", function(){
                var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
                var center = scenario.getCenterVertexInTree();
                var groupRelation = scenario.getPossessionAsGroupRelationInTree();
                var otherRelation = TestUtils.getChildWithLabel(
                    center,
                    "other relation"
                );
                groupRelation.expand();
                expect(
                    TestUtils.hasChildWithLabel(
                        otherRelation,
                        "Possession"
                    )
                ).toBeFalsy();
                groupRelation.getController().moveUnderParent(otherRelation);
                otherRelation = TestUtils.getChildWithLabel(
                    center,
                    "other relation"
                );
                expect(
                    TestUtils.hasChildWithLabel(
                        otherRelation,
                        "Possession"
                    )
                ).toBeTruthy();
            });
        });
    });
});


