/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    "test/test-utils",
    'test/mock',
    "triple_brain.selection_handler"
], function (Scenarios, TestUtils, Mock, SelectionHandler) {
    "use strict";
    describe("tree_edge", function () {
        var edge1,
            child1,
            centerBubble;
        beforeEach(function () {
            Mock.applyDefaultMocks();
            var scenario = new Scenarios.threeBubblesGraph();
            edge1 = scenario.getRelation1InTree();
            child1 = scenario.getBubble2();
            centerBubble = scenario.getCenterBubbleInTree();
        });
        it("can inverse", function () {
            expect(
                edge1.isInverse()
            ).toBeFalsy();
            expect(
                edge1.getSourceVertex().getUri()
            ).toBe(centerBubble.getUri());
            expect(
                edge1.getDestinationVertex().getUri()
            ).toBe(child1.getUri());
            edge1.inverse();
            expect(
                edge1.isInverse()
            ).toBeTruthy();
            expect(
                edge1.getSourceVertex().getUri()
            ).toBe(child1.getUri());
            expect(
                edge1.getDestinationVertex().getUri()
            ).toBe(centerBubble.getUri());
        });
        it("can get child vertex in display", function () {
            expect(
                edge1.childVertexInDisplay().getUri()
            ).toBe(child1.getUri());
        });

        it("can get child vertex in display even if inverse", function () {
            edge1.inverse();
            expect(
                edge1.childVertexInDisplay().getUri()
            ).toBe(child1.getUri());
        });

        it("can get child vertex in display even if inverse", function () {
            edge1.inverse();
            expect(
                edge1.childVertexInDisplay().getUri()
            ).toBe(child1.getUri());
        });
        it("selects the parent vertex when removed", function () {
            var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var r1 = TestUtils.getChildWithLabel(
                b1,
                "r1"
            );
            SelectionHandler.setToSingleVertex(r1);
            expect(
                b1.isSelected()
            ).toBeFalsy();
            r1.remove();
            expect(
                b1.isSelected()
            ).toBeTruthy();
        });
        it("reviews edit button display when moved away from group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var relationUnderGroupRelation = TestUtils.getChildWithLabel(
                groupRelation,
                "Possession of book 1"
            );
            relationUnderGroupRelation.getController().setLabel(
                groupRelation.text()
            );
            expect(
                relationUnderGroupRelation.isSetAsSameAsGroupRelation()
            ).toBeTruthy();
            var otherBubble = scenario.getOtherRelationInTree().getTopMostChildBubble();
            relationUnderGroupRelation.getTopMostChildBubble().getController().moveUnderParent(
                otherBubble
            );
            expect(
                relationUnderGroupRelation.isSetAsSameAsGroupRelation()
            ).toBeFalsy();
        });
    });
});