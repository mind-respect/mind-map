/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'triple_brain.selection_handler'
], function (Scenarios, TestUtils, SelectionHandler) {
    "use strict";
    describe("group_relation_ui", function () {
        it("shows description upon selection", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
            var showDescriptionSpy = spyOn(possessionInTree, "_showDescription");
            SelectionHandler.setToSingleGraphElement(possessionInTree);
            expect(
                showDescriptionSpy
            ).toHaveBeenCalled();
            /*
-             * I wish I could have used possessionInTree.getLabel().data('bs.popover').tip().hasClass('in') to test
             * if description is visible but it doesn't work from within jasmine.
             * http://stackoverflow.com/a/13442833/541493
             */
        });
        it("hides description when de-select", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
            SelectionHandler.setToSingleGraphElement(possessionInTree);
            var hideDescriptionSpy = spyOn(possessionInTree, "hideDescription");
            SelectionHandler.removeAll();
            expect(
                hideDescriptionSpy
            ).toHaveBeenCalled();
        });
        it("can expand and collapse", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
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
        // it("can return the most relevant identifier", function(){
        //     var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
        //     var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
        // });
    });
});