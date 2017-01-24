/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    'test/mock',
    "triple_brain.mind_map_info"
], function (Scenarios, TestUtils, Mock, MindMapInfo) {
    "use strict";
    describe("edge_html_builder", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("adds duplicate button if has duplicate", function () {
            loadFixtures('graph-element-menu.html');
            var duplicateRelationsScenario = new Scenarios.graphWithARelationInTwoSimilarRelationsGroup();
            var impact3InSocietyContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnSocietyContext();
            expect(
                impact3InSocietyContext.hasTheDuplicateButton()
            ).toBeTruthy();
        });
        it("makes edge movable with drag and drop", function () {
            MindMapInfo._setIsViewOnly(false);
            var scenario = new Scenarios.threeBubblesGraph();
            var b3 = scenario.getBubble3InTree();
            expect(
                TestUtils.hasChildWithLabel(
                    b3,
                    "r1"
                )
            ).toBeFalsy();
            var r1 = scenario.getRelation1InTree();
            TestUtils.startDragging(
                r1
            );
            TestUtils.drop(
                b3
            );
            expect(
                TestUtils.hasChildWithLabel(
                    b3,
                    "r1"
                )
            ).toBeTruthy();
        });
    });
});