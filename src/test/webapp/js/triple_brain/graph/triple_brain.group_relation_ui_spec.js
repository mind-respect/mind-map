/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/webapp/js/test-scenarios',
    'triple_brain.selection_handler'
], function (Scenarios, SelectionHandler) {
    "use strict";
    describe("group_relation_ui", function () {
        var scenario, possessionInTree;
        beforeEach(function () {
            scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            possessionInTree = scenario.getPossessionAsGroupRelationInTree();
        });
        it("shows description upon selection", function () {
            var showDescriptionSpy = spyOn(possessionInTree, "_showDescription");
            SelectionHandler.setToSingleGraphElement(possessionInTree);
            expect(
                showDescriptionSpy
            ).toHaveBeenCalled();
            /*
             * I wish I could have used possessionInTree.getLabel().data('bs.popover').tip().hasClass('in') to test
             * if description is visible but it doesn't work from within jasmine.
             * http://stackoverflow.com/a/13442833/541493
             */
        });
        it("hides description when de-select", function () {
            SelectionHandler.setToSingleGraphElement(possessionInTree);
            var hideDescriptionSpy = spyOn(possessionInTree, "hideDescription");
            SelectionHandler.removeAll();
            expect(
                hideDescriptionSpy
            ).toHaveBeenCalled();
        });
    });
});