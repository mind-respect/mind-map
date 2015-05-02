/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/webapp/js/test-scenarios',
    'triple_brain.group_relation_menu_handler',
    'triple_brain.mind_map_info',
    'triple_brain.selection_handler'
], function (Scenarios, GroupRelationMenuHandler, MindMapInfo, SelectionHandler) {
    "use strict";
    describe("group_relation_menu_handler", function () {
        var scenario, possessionInTree;
        beforeEach(function () {
            scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            possessionInTree = scenario.getPossessionAsGroupRelationInTree();
        });
        it("hides description after adding child", function () {
            MindMapInfo._setIsViewOnly(false);
            SelectionHandler.setToSingleGraphElement(possessionInTree);
            var hideDescriptionSpy = spyOn(possessionInTree, "hideDescription");
            GroupRelationMenuHandler.forSingle().addChildAction(possessionInTree);
            expect(
                hideDescriptionSpy
            ).toHaveBeenCalled();
        });
    });
});