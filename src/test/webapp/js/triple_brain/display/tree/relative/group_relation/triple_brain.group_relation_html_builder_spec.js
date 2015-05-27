/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/webapp/js/test-scenarios",
    "test/webapp/js/test-utils",
    "triple_brain.group_relation_html_builder",
    "triple_brain.identification",
    "triple_brain.event_bus"
], function (Scenarios, TestUtils, GroupRelationHtmlBuilder, Identification, EventBus) {
    "use strict";
    describe("group_relation_html_builder", function () {
        var groupRelationBubble;
        it("has the label of the identification", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            groupRelationBubble = scenario.getPossessionAsGroupRelationUi();
            expect(
                groupRelationBubble.text()
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
    });
});