/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios"
], function (Scenarios) {
    "use strict";
    describe("edge_html_builder", function () {
        beforeEach(function(){

        });
        it("adds duplicate button if has duplicate", function () {
            var duplicateRelationsScenario = new Scenarios.graphWithARelationInTwoSimilarRelationsGroup();
            var impact3InSocietyContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnSocietyContext();
            expect(
                impact3InSocietyContext.hasTheDuplicateButton()
            ).toBeTruthy();
        });
    });
});