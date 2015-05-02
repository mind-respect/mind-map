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
        beforeEach(function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            groupRelationBubble = scenario.getPossessionAsGroupRelationUi();
        });
        it("has the label of the identification", function () {
            expect(
                groupRelationBubble.text()
            ).toBe(
                "Possession"
            );
        });
    });
});