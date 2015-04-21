/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "test/webapp/js/test-scenarios"
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