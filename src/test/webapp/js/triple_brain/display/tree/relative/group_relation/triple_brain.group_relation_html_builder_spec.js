/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.group_relation_html_builder",
    "test/webapp/js/test-scenarios"

], function (GroupRelationHtmlBuilder, Scenarios) {
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
    });
});