/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/webapp/js/test-scenarios",
    "test/webapp/js/test-utils",
    "test/webapp/js/mock/triple_brain.vertex_service_mock",
    "test/webapp/js/mock/triple_brain.graph_element_service_mock",
    "triple_brain.mind_map_info",
    "triple_brain.group_relation_html_builder",
    "triple_brain.group_relation_menu_handler",
    "triple_brain.identification",
    "triple_brain.event_bus"
], function (Scenarios, TestUtils, VertexServiceMock, GraphElementServiceMock, MindMapInfo, GroupRelationHtmlBuilder, GroupRelationMenuHandler, Identification, EventBus) {
    "use strict";
    describe("group_relation_html_builder", function () {
        var groupRelation;
        it("has the label of the identification", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            groupRelation = scenario.getPossessionAsGroupRelationUi();
            expect(
                groupRelation.text()
            ).toBe(
                "Possession"
            );
        });
        it("adds the image of it's identification", function () {
            var scenario = new Scenarios.groupRelationWithImage();
            var component = scenario.getComponentGroupRelationInTree();
            expect(
                component.hasImages()
            ).toBeFalsy();
            var idea = scenario.getIdeaGroupRelationInTree();
            expect(
                idea.hasImages()
            ).toBeTruthy();
        });
        it('moves a relation under a "group relation" if newly added identification is related to a group relation', function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var centerBubble = scenario.getCenterVertexInTree();
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(3);
            var possessionGroupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "Possession"
            );
            possessionGroupRelation.addChildTree();
            expect(
                possessionGroupRelation.getNumberOfChild()
            ).toBe(3);
            var otherRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "other relation"
            );
            var dummyIdentification = Identification.withUriAndLabel(
                TestUtils.generateVertexUri(),
                "dummy identification"
            );
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [otherRelation, dummyIdentification]
            );

            expect(
                centerBubble.getNumberOfChild()
            ).toBe(3);
            expect(
                possessionGroupRelation.getNumberOfChild()
            ).toBe(3);

            EventBus.publish(
                "/event/ui/graph/identification/added",
                [otherRelation, possessionGroupRelation.getGroupRelation().getIdentification()]
            );
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(2);
            expect(
                possessionGroupRelation.getNumberOfChild()
            ).toBe(4);
        });

        it("moves a relation to the group-relation's parent if the identification related to the group-relation is removed from the relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var centerBubble = scenario.getCenterVertexInTree();
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(3);
            var possessionGroupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "Possession"
            );
            possessionGroupRelation.addChildTree();
            expect(
                possessionGroupRelation.getNumberOfChild()
            ).toBe(3);
            var otherRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "other relation"
            );
            var dummyIdentification = Identification.withUriAndLabel(
                TestUtils.generateVertexUri(),
                "dummy identification"
            );
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [otherRelation, dummyIdentification]
            );
            EventBus.publish(
                "/event/ui/graph/identification/removed",
                [otherRelation, dummyIdentification]
            );
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(3);
            expect(
                possessionGroupRelation.getNumberOfChild()
            ).toBe(3);
            var possessionRelation = possessionGroupRelation.getTopMostChildBubble();
            EventBus.publish(
                "/event/ui/graph/identification/removed",
                [possessionRelation, possessionGroupRelation.getGroupRelation().getIdentification()]
            );
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(4);
            expect(
                possessionGroupRelation.getNumberOfChild()
            ).toBe(2);
        });
        it("creates a group-relation when adding an identification to a relation shared with another relation at the same level", function () {
            var centerBubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            expect(TestUtils.hasChildWithLabel(
                centerBubble,
                "r1"
            )).toBeTruthy();
            expect(TestUtils.hasChildWithLabel(
                centerBubble,
                "r2"
            )).toBeTruthy();
            expect(TestUtils.hasChildWithLabel(
                centerBubble,
                "some identification"
            )).toBeFalsy();

            var someIdentification = Identification.withUriAndLabel(
                TestUtils.generateVertexUri(),
                "some identification"
            );
            var relation1 = TestUtils.getChildWithLabel(centerBubble, "r1");
            relation1.addGenericIdentification(
                someIdentification
            );
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [relation1, someIdentification]
            );
            var relation2 = TestUtils.getChildWithLabel(centerBubble, "r2");
            relation2.addGenericIdentification(
                someIdentification
            );
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [relation2, someIdentification]
            );
            expect(TestUtils.hasChildWithLabel(
                centerBubble,
                "some identification"
            )).toBeTruthy();
            var newGroupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "some identification"
            );
            expect(
                newGroupRelation.getNumberOfChild()
            ).toBe(2);
            expect(TestUtils.hasChildWithLabel(
                centerBubble,
                "r1"
            )).toBeFalsy();
            expect(TestUtils.hasChildWithLabel(
                centerBubble,
                "r2"
            )).toBeFalsy();
        });
        it("creates a group-relation when identifying a relation to a relation that exists at the same level", function () {
            var centerBubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            expect(TestUtils.hasChildWithLabel(
                centerBubble,
                "r1"
            )).toBeTruthy();
            var r2ChildOfCenterBubble = TestUtils.getChildWithLabel(
                centerBubble,
                "r2"
            );
            expect(
                r2ChildOfCenterBubble.isGroupRelation()
            ).toBeFalsy();
            var identificationToRelation2 = Identification.fromFriendlyResource(
                r2ChildOfCenterBubble.getOriginalServerObject()
            );
            var relation1 = TestUtils.getChildWithLabel(centerBubble, "r1");
            relation1.addSameAs(
                identificationToRelation2
            );
            EventBus.publish(
                "/event/ui/graph/identification/added",
                [relation1, identificationToRelation2]
            );
            r2ChildOfCenterBubble = TestUtils.getChildWithLabel(centerBubble, "r2");
            expect(
                r2ChildOfCenterBubble.isGroupRelation()
            ).toBeTruthy();
            expect(TestUtils.hasChildWithLabel(
                centerBubble,
                "r1"
            )).toBeFalsy();
            r2ChildOfCenterBubble.addChildTree();
            expect(TestUtils.hasChildWithLabel(
                r2ChildOfCenterBubble,
                "r1"
            )).toBeTruthy();
            expect(TestUtils.hasChildWithLabel(
                r2ChildOfCenterBubble,
                "r2"
            )).toBeTruthy();
        });
        it("doesn't create a group-relation when adding to a relation an identification that exists at the same level if its already under group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.addChildTree();
            expect(
                groupRelation.getNumberOfChild()
            ).toBe(3);
            VertexServiceMock.addRelationAndVertexToVertexMock();
            GraphElementServiceMock.addIdentificationMock();
            MindMapInfo._setIsViewOnly(false);
            GroupRelationMenuHandler.forSingle().addChildAction(groupRelation);
            expect(
                groupRelation.getNumberOfChild()
            ).toBe(4);
        });
    });
});