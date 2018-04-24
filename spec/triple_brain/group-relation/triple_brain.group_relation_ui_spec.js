/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'test/mock'
], function (Scenarios, TestUtils, Mock) {
    "use strict";
    describe("group_relation_ui", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("can expand and collapse", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
            possessionInTree.expand();
            expect(
                possessionInTree.isCollapsed()
            ).toBeFalsy();
            possessionInTree.collapse();
            expect(
                possessionInTree.isCollapsed()
            ).toBeTruthy();
            possessionInTree.expand();
            expect(
                possessionInTree.isCollapsed()
            ).toBeFalsy();
        });
        it("does not duplicate children when expanding while already expanded", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
            possessionInTree.getController().expand();
            expect(
                possessionInTree.hasDescendantsWithHiddenRelations()
            ).toBeTruthy();
            expect(
                possessionInTree.getNumberOfChild()
            ).toBe(3);
            possessionInTree.expand();
            expect(
                possessionInTree.getNumberOfChild()
            ).toBe(3);
        });
        it("includes the deeper relations in the number of hidden relations", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
            expect(
                possessionInTree.getNumberOfHiddenRelations()
            ).toBe(4);
        });
        // it("can return the most relevant identifier", function(){
        //     var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
        //     var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
        // });
    });
});
