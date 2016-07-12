/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'triple_brain.group_relation_controller',
    'triple_brain.mind_map_info',
    'triple_brain.selection_handler'
], function (Scenarios, GroupRelationController, MindMapInfo, SelectionHandler) {
    "use strict";
    describe("group_relation_controller", function () {
        it("hides description after adding child", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
            MindMapInfo._setIsViewOnly(false);
            SelectionHandler.setToSingleGraphElement(possessionInTree);
            var hideDescriptionSpy = spyOn(possessionInTree, "hideDescription");
            new GroupRelationController.Self(
                possessionInTree
            ).addChild();
            expect(
                hideDescriptionSpy
            ).toHaveBeenCalled();
        });
        it("can identify", function(){
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
            expect(
                possessionInTree.getController().identifyCanDo()
            ).toBeTruthy();
        });
    });
});