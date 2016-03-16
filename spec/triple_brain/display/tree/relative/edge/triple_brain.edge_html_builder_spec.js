/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils"
], function (Scenarios, TestUtils) {
    "use strict";
    describe("edge_html_builder", function () {
        it("adds duplicate button if has duplicate", function () {
            loadFixtures('graph-element-menu.html');
            var duplicateRelationsScenario = new Scenarios.graphWithARelationInTwoSimilarRelationsGroup();
            var impact3InSocietyContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnSocietyContext();
            expect(
                impact3InSocietyContext.hasTheDuplicateButton()
            ).toBeTruthy();
        });
        it("sets to private if both source and destination vertex are private", function () {
            var threeBubblesGraph = new Scenarios.threeBubblesGraph();
            var bubble1 = threeBubblesGraph.getBubble1InTree();
            var bubble2 = threeBubblesGraph.getBubble2InTree();
            expect(
                bubble1.isPublic()
            ).toBeFalsy();
            expect(
                bubble2.isPublic()
            ).toBeFalsy();
            var relation1 = TestUtils.getChildWithLabel(bubble1, "r1");
            expect(
                relation1.getHtml()
            ).not.toHaveClass("public");
        });
        it("sets to public if both source and destination vertex are public", function () {
            var bubble1 = new Scenarios.publicPrivate().getBubble1();
            var relation1 = TestUtils.getChildWithLabel(bubble1, "r1");
            expect(
                relation1.getHtml()
            ).toHaveClass("public");
        });
        it("sets to private if source or destination vertex is private", function () {
            var bubble1 = new Scenarios.publicPrivate().getBubble1();
            var relation2 = TestUtils.getChildWithLabel(bubble1, "r2");
            expect(
                relation2.getHtml()
            ).not.toHaveClass("public");
        });
    });
});