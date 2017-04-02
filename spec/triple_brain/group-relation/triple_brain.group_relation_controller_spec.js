/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    'triple_brain.group_relation_controller',
    'triple_brain.mind_map_info',
    'triple_brain.selection_handler'
], function (Scenarios, TestUtils, Mock, GroupRelationController, MindMapInfo, SelectionHandler) {
    "use strict";
    describe("group_relation_controller", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("hides description after adding child", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
            MindMapInfo._setIsViewOnly(false);
            SelectionHandler.setToSingleGraphElement(possessionInTree);
            var hideDescriptionSpy = spyOn(possessionInTree, "hideDescription");
            new GroupRelationController.GroupRelationController(
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
        it("gives all it's identifiers to the new relation when adding a child", function(){
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
            possessionInTree.getModel().addIdentification(
                TestUtils.dummyIdentifier()
            );
            var testWasMade = false;
            possessionInTree.getController().addChild().then(function(triple){
                expect(
                    triple.edge().getModel().getIdentifiers().length
                ).toBe(2);
                testWasMade = true;
            });
            expect(
                testWasMade
            ).toBeTruthy();
        });

        it("makes new child public if parent vertex is public", function(){
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
            possessionInTree.getParentVertex().getModel().makePublic();
            possessionInTree.getModel().addIdentification(
                TestUtils.dummyIdentifier()
            );
            var testWasMade = false;
            possessionInTree.getController().addChild().then(function(triple){
                expect(
                    triple.destinationVertex().getModel().isPublic()
                ).toBeTruthy();
                testWasMade = true;
            });
            expect(
                testWasMade
            ).toBeTruthy();
        });
    });
});