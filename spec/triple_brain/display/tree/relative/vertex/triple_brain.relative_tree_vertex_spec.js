/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'triple_brain.relative_tree_vertex',
    'triple_brain.mind_map_info'
], function (Scenarios, TestUtils, RelativeTreeVertex, MindMapInfo) {
    "use strict";
    describe("relative_tree_vertex", function () {
        var bubble1,
            bubble2,
            bubble3,
            relation1;
        beforeEach(function () {
            var scenario = new Scenarios.threeBubblesGraph();
            bubble1 = scenario.getCenterBubbleInTree();
            bubble2 = scenario.getBubble2InTree();
            bubble3 = scenario.getBubble3InTree();
            relation1 = scenario.getRelation1InTree();
        });
        it("can return relation with ui parent", function () {
            var relationWithParent = bubble2.getRelationWithUiParent();
            expect(
                relationWithParent.getUri()
            ).toBe(relation1.getUri());
        });
        it("can visit immediate vertices child", function () {
            var hasVisited = false;
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
            var numberOfVisitedVertices = 0;
            RelativeTreeVertex.visitAllVertices(function(){
                numberOfVisitedVertices++;
            });
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
    });
});