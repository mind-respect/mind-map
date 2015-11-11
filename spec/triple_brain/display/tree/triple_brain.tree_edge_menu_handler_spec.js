/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    'triple_brain.tree_edge_menu_handler',
    'triple_brain.mind_map_info'
], function (Scenarios, TestUtils, Mock, TreeEdgeMenuHandler, MindMapInfo) {
    "use strict";
    describe("graph_displayer_as_tree_common", function () {
        beforeEach(function () {});
        it("can remove edge", function () {
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            var bubble1 = threeBubblesScenario.getBubble1InTree();
            var numberOfChild = bubble1.getNumberOfChild();
            var relation1 = bubble1.getTopMostChildBubble();
            Mock.mockRemoveEdge();
            MindMapInfo.setIsAnonymous(false);
            TreeEdgeMenuHandler.forSingle().removeAction(
                relation1
            );
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
            TreeEdgeMenuHandler.forSingle().addChildAction(
                TestUtils.getChildWithLabel(bubble1, "r1")
            );
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
            TreeEdgeMenuHandler.forSingle().addChildAction(
                relation1
            );
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
            relation1.addGenericIdentification(karaokeIdentification);
            MindMapInfo._setIsViewOnly(false);
            TreeEdgeMenuHandler.forSingle().addChildAction(
                relation1
            );
            var newGroupRelation = TestUtils.getChildWithLabel(bubble1, "karaoke");
            var identifierExternalResourceUri = newGroupRelation.getGroupRelation().getIdentification().getExternalResourceUri();
            expect(
                identifierExternalResourceUri
            ).toBe(karaokeIdentification.getExternalResourceUri());
        });

    });
});


