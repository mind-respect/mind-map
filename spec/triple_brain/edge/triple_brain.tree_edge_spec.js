/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    "test/test-utils",
    'test/mock',
    "triple_brain.selection_handler",
    "triple_brain.graph_element_type"
], function (Scenarios, TestUtils, Mock, SelectionHandler, GraphElementType) {
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
        it("reviews edit button display when moved away from group relation to another group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var centerBubble = scenario.getCenterVertexInTree();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var relationUnderGroupRelation = groupRelation.getTopMostChildBubble().getBubbleUnder();
            expect(
                relationUnderGroupRelation.isRelation()
            ).toBeTruthy();
            relationUnderGroupRelation.setText("Possession");
            expect(
                relationUnderGroupRelation.isSetAsSameAsGroupRelation()
            ).toBeTruthy();
            var otherGroupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "original relation"
            );
            expect(
                otherGroupRelation.isGroupRelation()
            ).toBeTruthy();
            relationUnderGroupRelation.getTopMostChildBubble().getController().moveUnderParent(
                otherGroupRelation
            );
            expect(
                relationUnderGroupRelation.isSetAsSameAsGroupRelation()
            ).toBeFalsy();
        });
        it("sets the new group relation at the same index of the relation when adding a child", function () {
            var centerBubble = new Scenarios.threeBubblesGraph().getCenterBubbleInTree();
            centerBubble.getController().addChild();
            centerBubble.getController().addChild();
            var relation = centerBubble.getTopMostChildBubble();
            var indexInTypes = [GraphElementType.Relation, GraphElementType.GroupRelation];
            expect(
                relation._getIndexInTreeInTypes(indexInTypes)
            ).toBe(0);
            relation.getController().addChild();
            var newGroupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                relation.text()
            );
            expect(
                newGroupRelation.isGroupRelation()
            ).toBeTruthy();
            expect(
                newGroupRelation._getIndexInTreeInTypes(indexInTypes)
            ).toBe(0);
        });
        it("removes the parent group relation when removing the last relation under a group relation", function () {
            var centerBubble = new Scenarios.withRelationsAsIdentifierGraph().getCenterInTree();
            expect(
                TestUtils.hasChildWithLabel(
                    centerBubble,
                    "original some relation"
                )
            ).toBeTruthy();
            var groupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "original some relation"
            );
            groupRelation.visitClosestChildVertices(function (vertex) {
                vertex.remove();
            });
            expect(
                TestUtils.hasChildWithLabel(
                    centerBubble,
                    "original some relation"
                )
            ).toBeFalsy();
        });
        it("removes the parent group relation when moving away the last relation under a group relation", function () {
            var centerBubble = new Scenarios.withRelationsAsIdentifierGraph().getCenterInTree();
            var bubbleNotUnderAGroupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "some different relation"
            ).getTopMostChildBubble();
            expect(
                TestUtils.hasChildWithLabel(
                    centerBubble,
                    "original some relation"
                )
            ).toBeTruthy();
            var groupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "original some relation"
            );
            groupRelation.visitClosestChildVertices(function (vertex) {
                vertex.moveToParent(
                    bubbleNotUnderAGroupRelation
                );
            });
            expect(
                TestUtils.hasChildWithLabel(
                    centerBubble,
                    "original some relation"
                )
            ).toBeFalsy();
        });
    });
});