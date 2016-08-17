/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'triple_brain.selection_handler'
], function (Scenarios, SelectionHandler) {
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
    });
});