/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "test/mock/triple_brain.vertex_service_mock",
    "triple_brain.keyboard_actions_handler",
    "triple_brain.selection_handler",
    "triple_brain.relative_tree_vertex_menu_handler",
    'triple_brain.mind_map_info'
], function (Scenarios, TestUtils, VertexServiceMock, KeyBoardActionsHandler, SelectionHandler, RelativeTreeVertexMenuHandler, MindMapInfo) {
    "use strict";
    describe("keyboard_action_handler", function () {
        beforeEach(function () {
            KeyBoardActionsHandler._handleKeyboardActions();
        });
        it("adds a child when pressing tab key", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            SelectionHandler.setToSingleGraphElement(bubble1);
            var numberOfChild = bubble1.getNumberOfChild();
            VertexServiceMock.addRelationAndVertexToVertexMock();
            TestUtils.pressKey("\t");
            expect(
                bubble1.getNumberOfChild()
            ).toBe(
                numberOfChild + 1
            );
        });
        it("adds a child to a relation when pressing tab key", function () {
            var relation1 = new Scenarios.threeBubblesGraph().getRelation1InTree();
            expect(
                relation1.getParentBubble().isGroupRelation()
            ).toBeFalsy();
            SelectionHandler.setToSingleGraphElement(relation1);
            VertexServiceMock.addRelationAndVertexToVertexMock();
            TestUtils.pressKey("\t");
            expect(
                relation1.getParentBubble().isGroupRelation()
            ).toBeTruthy();
        });
        it("focuses on bubble label of a selected bubble when user types", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            SelectionHandler.setToSingleGraphElement(bubble1);
            expect(
                bubble1.isInEditMode()
            ).toBeFalsy();
            TestUtils.pressKey("a");
            expect(
                bubble1.isInEditMode()
            ).toBeTruthy();
        });

        it("calls identification action when pressing ctrl+i", function(){
            MindMapInfo._setIsViewOnly(false);
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            SelectionHandler.setToSingleGraphElement(bubble1);
            var actionSpy = spyOn(RelativeTreeVertexMenuHandler.forSingle(), "identifyAction");
            expect(
                actionSpy
            ).not.toHaveBeenCalled();
            TestUtils.pressCtrlPlusKey("I");
            expect(
                actionSpy
            ).toHaveBeenCalled();
        });
        it("does not focus when pressing control only", function(){
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            SelectionHandler.setToSingleGraphElement(bubble1);
            var ctrlKeyCode = 17;
            TestUtils.pressKeyCode(ctrlKeyCode);
            expect(
                bubble1.isInEditMode()
            ).toBeFalsy();
        });

        it("adds a sibling when pressing enter", function(){
            VertexServiceMock.addRelationAndVertexToVertexMock();
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var numberOfChild = bubble1.getNumberOfChild();
            var someChild = bubble1.getTopMostChildBubble().getTopMostChildBubble();
            SelectionHandler.setToSingleGraphElement(someChild);
            var enterKeyCode = 13;
            TestUtils.pressKeyCode(enterKeyCode);
            expect(
                bubble1.getNumberOfChild()
            ).toBe(numberOfChild + 1);
        });

    });
});