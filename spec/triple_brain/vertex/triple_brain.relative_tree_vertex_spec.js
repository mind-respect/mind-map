/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/mock',
    'test/test-utils',
    'triple_brain.relative_tree_vertex',
    'triple_brain.mind_map_info'
], function (Scenarios, Mock, TestUtils, RelativeTreeVertex, MindMapInfo) {
    "use strict";
    describe("relative_tree_vertex", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("can return relation with ui parent", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var bubble2 = scenario.getBubble2InTree();
            var relationWithParent = bubble2.getRelationWithUiParent();
            expect(
                relationWithParent.getUri()
            ).toBe(scenario.getRelation1InTree().getUri());
        });
        it("can visit immediate vertices child", function () {
            var hasVisited = false;
            var scenario = new Scenarios.threeBubblesGraph();
            var bubble1 = scenario.getCenterBubbleInTree();
            bubble1.visitVerticesChildren(function (vertex) {
                expect(
                        "b2" === vertex.text() ||
                        "b3" === vertex.text()
                ).toBeTruthy();
                hasVisited = true;
            });
            expect(hasVisited).toBeTruthy();
        });
        it("can visit all vertices when there are none", function () {
            var scenario = new Scenarios.threeBubblesGraph();

            var numberOfVisitedVertices = 0;
            RelativeTreeVertex.visitAllVertices(function(){
                numberOfVisitedVertices++;
            });
            var bubble1 = scenario.getCenterBubbleInTree();
            var bubble2 = scenario.getBubble2InTree();
            var bubble3 = scenario.getBubble3InTree();
            expect(numberOfVisitedVertices).toBe(3);
            bubble3.remove();
            bubble2.remove();
            bubble1.remove();
            numberOfVisitedVertices = 0;
            RelativeTreeVertex.visitAllVertices(function(){
                numberOfVisitedVertices++;
            });
            expect(numberOfVisitedVertices).toBe(0);
        });
        it("can remove a vertex even if it has duplicates", function () {
            MindMapInfo._setIsViewOnly(false);
            var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
            var bubble1 = graphWithCircularityScenario.getBubble1InTree();
            var bubble1Duplicate = graphWithCircularityScenario.getBubble1Duplicate();
            expect(
                TestUtils.isGraphElementUiRemoved(
                    bubble1
                )
            ).toBeFalsy();
            expect(
                TestUtils.isGraphElementUiRemoved(
                    bubble1Duplicate
                )
            ).toBeFalsy();
            bubble1.remove();
            expect(
                TestUtils.isGraphElementUiRemoved(
                    bubble1
                )
            ).toBeTruthy();
            expect(
                TestUtils.isGraphElementUiRemoved(
                    bubble1Duplicate
                )
            ).toBeTruthy();
        });
        it("does not have hidden relations if non owner and bubble does not have public neighbors", function () {
            MindMapInfo._setIsViewOnly(false);
            var scenario  = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            var b3 = scenario.getBubble3InTree();
            expect(
                b2.hasHiddenRelations()
            ).toBeTruthy();
            expect(
                b3.hasHiddenRelations()
            ).toBeTruthy();
            MindMapInfo._setIsViewOnly(true);
            expect(
                b2.hasHiddenRelations()
            ).toBeFalsy();
            expect(
                b3.hasHiddenRelations()
            ).toBeTruthy();
        });
        it("can export vertices to an html list", function(){
            var scenario  = new Scenarios.threeBubblesGraph();
            var listContainer = RelativeTreeVertex.VerticesToHtmlLists([
                scenario.getBubble1InTree(),
                scenario.getBubble2InTree(),
                scenario.getBubble3InTree()
            ]);
            expect(
                listContainer[0].childNodes[0].childNodes[0].nodeValue
            ).toBe("b1");
            var list = listContainer.find("ul");
            var b2 = list.find("> li:first");
            expect(
                b2.text()
            ).toBe("b2");
            var b3 = list.find("> li:last");
            expect(
                b3.text()
            ).toBe("b3");
        });
        it("can export vertices to an html list even if it has group relations", function(){
            var groupRelation = new Scenarios.GraphWithSimilarRelationsScenario().getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var firstChildVertex = groupRelation.getTopMostChildBubble().getTopMostChildBubble().getTopMostChildBubble();
            var secondChildVertex = firstChildVertex.getBubbleUnder();
            var thirdChildVertex = secondChildVertex.getBubbleUnder();
            var listContainer = RelativeTreeVertex.VerticesToHtmlLists([
                groupRelation.getParentVertex(),
                firstChildVertex,
                secondChildVertex,
                thirdChildVertex
            ]);
            expect(
                listContainer[0].childNodes[0].childNodes[0].nodeValue
            ).toBe("me");
            var list = listContainer.find("ul");
            var firstChildVertexInList = list.find("> li:first");
            expect(
                firstChildVertexInList.text()
            ).toBe(firstChildVertex.text());
            var lastChildVertexInList = list.find("> li:last");
            expect(
                lastChildVertexInList.text()
            ).toBe(thirdChildVertex.text());
        });
        it("can export vertices to an html list when center is a meta", function(){
            var eventBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
            var aChildVertex = TestUtils.getChildWithLabel(
                eventBubble,
                "a1"
            ).getTopMostChildBubble();
            var listContainer = RelativeTreeVertex.VerticesToHtmlLists([
                aChildVertex
            ]);
            expect(
                listContainer[0].childNodes[0].childNodes[0].nodeValue
            ).toBe(aChildVertex.text());
        });
        it("can return the number of hidden relations", function(){
            MindMapInfo._setIsViewOnly(false);
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            b2.getHiddenRelationsContainer().show();
            expect(
                b2.getNumberOfHiddenRelations()
            ).toBe(2);
            expect(
                b2.hasHiddenRelations()
            ).toBeTruthy();
        });

        it("returns zero hidden relations if vertex is expanded", function(){
            var scenario = new Scenarios.threeBubblesGraph();
            expect(
                scenario.getBubble1InTree().getNumberOfHiddenRelations()
            ).toBe(0);
            var b2 = scenario.getBubble2InTree();
            b2.getHiddenRelationsContainer().show();
            expect(
                b2.getNumberOfHiddenRelations()
            ).toBe(2);
            expect(
                b2.hasHiddenRelations()
            ).toBeTruthy();
            scenario.expandBubble2(b2);
            MindMapInfo._setIsViewOnly(false);
            expect(
                b2.getNumberOfHiddenRelations()
            ).toBe(0);
            expect(
                b2.hasHiddenRelations()
            ).toBeFalsy();
        });

        it("returns one more hidden relations if immediate child of a meta", function(){
            var scenario = new Scenarios.aroundEventIdentifier();
            var eventCenter = scenario.getEventBubbleInTree();
            var event2 = TestUtils.getChildWithLabel(
                eventCenter,
                "e2"
            ).getTopMostChildBubble();
            event2.getHiddenRelationsContainer().show();
            expect(
                event2.getNumberOfHiddenRelations()
            ).toBe(2);
            MindMapInfo._setIsViewOnly(false);
            expect(
                event2.hasHiddenRelations()
            ).toBeTruthy();
            var event1 = TestUtils.getChildWithLabel(
                eventCenter,
                "e1"
            ).getTopMostChildBubble();
            event1.getHiddenRelationsContainer().show();
            expect(
                event1.getNumberOfHiddenRelations()
            ).toBe(3);
            expect(
                event1.hasHiddenRelations()
            ).toBeTruthy();
        });
        it("adds to other instances", function(){
            var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
            var b1 = graphWithCircularityScenario.getBubble1InTree();
            var b2 = TestUtils.getChildWithLabel(
                b1,
                "r1"
            ).getTopMostChildBubble();
            expect(
                b2.getNumberOfChild()
            ).toBe(0);
            var bubble3 = TestUtils.getChildWithLabel(
                b1,
                "r3"
            ).getTopMostChildBubble();
            graphWithCircularityScenario.expandBubble3(bubble3);
            var otherB2 = bubble3.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                otherB2.text()
            ).toBe("b2");
            otherB2.getHiddenRelationsContainer().hide();
            otherB2.getController().addChild();
            expect(
                b2.getNumberOfChild()
            ).toBe(1);
        });
    });
});