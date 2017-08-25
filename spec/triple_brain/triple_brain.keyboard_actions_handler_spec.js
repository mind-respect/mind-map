/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    'test/mock',
    "triple_brain.keyboard_actions_handler",
    "triple_brain.selection_handler",
    "triple_brain.vertex_controller",
    "mr.app_controller",
    'triple_brain.mind_map_info'
], function (Scenarios, TestUtils, Mock, KeyBoardActionsHandler, SelectionHandler, VertexController, AppController, MindMapInfo) {
    "use strict";
    describe("keyboard_action_handler", function () {
        beforeEach(function () {
            KeyBoardActionsHandler._handleKeyboardActions();
            Mock.applyDefaultMocks();
        });
        it("adds a child when pressing tab key", function () {
            MindMapInfo._setIsViewOnly(false);
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            SelectionHandler.setToSingleGraphElement(bubble1);
            var numberOfChild = bubble1.getNumberOfChild();
            TestUtils.pressKey("\t");
            expect(
                bubble1.getNumberOfChild()
            ).toBe(
                numberOfChild + 1
            );
        });
        it("adds a child to a relation when pressing tab key", function () {
            MindMapInfo._setIsViewOnly(false);
            var relation1 = new Scenarios.threeBubblesGraph().getRelation1InTree();
            expect(
                relation1.getParentBubble().isGroupRelation()
            ).toBeFalsy();
            SelectionHandler.setToSingleGraphElement(relation1);
            TestUtils.pressKey("\t");
            expect(
                relation1.getParentBubble().isGroupRelation()
            ).toBeTruthy();
        });
        it("focuses on bubble label of a selected bubble when user types", function () {
            MindMapInfo._setIsViewOnly(false);
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

        it("calls identification method when pressing ctrl+g", function(){
            MindMapInfo._setIsViewOnly(false);
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            SelectionHandler.setToSingleGraphElement(bubble1);
            var actionSpy = spyOn(VertexController.VertexController.prototype, "identify");
            expect(
                actionSpy
            ).not.toHaveBeenCalled();
            TestUtils.pressCtrlPlusKey("G");
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
            MindMapInfo._setIsViewOnly(false);
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

        it("prevents bubble content editing when in view only", function(){
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            SelectionHandler.setToSingleGraphElement(bubble1);
            bubble1.leaveEditMode();
            TestUtils.pressKey("a");
            expect(
                bubble1.isInEditMode()
            ).toBeTruthy();
            MindMapInfo._setIsViewOnly(true);
            bubble1.leaveEditMode();
            TestUtils.pressKey("a");
            expect(
                bubble1.isInEditMode()
            ).toBeFalsy();
        });
        it("can execute features for app controller when no bubbles are selected", function(){
            new Scenarios.threeBubblesGraph().getBubble1InTree();
            SelectionHandler.removeAll();
            var actionSpy = spyOn(AppController, "undo");
            expect(
                actionSpy
            ).not.toHaveBeenCalled();
            TestUtils.pressCtrlPlusKey("Z");
            expect(
                actionSpy
            ).toHaveBeenCalled();
        });
        it("can toggle to public or private with shortcut key", function(){
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            expect(
                bubble1.getModel().isPublic()
            ).toBeFalsy();
            SelectionHandler.setToSingleGraphElement(bubble1);
            TestUtils.pressCtrlPlusKey("P");
            expect(
                bubble1.getModel().isPublic()
            ).toBeTruthy();
        });
        it("can apply shortcut to multiple elements", function(){
            var scenario = new Scenarios.threeBubblesGraph();
            var bubble1 = scenario.getBubble1InTree();
            var bubble2 = scenario.getBubble2InTree();
            SelectionHandler.addGraphElement(bubble1);
            SelectionHandler.addGraphElement(bubble2);
            expect(
                bubble1.getModel().isPublic()
            ).toBeFalsy();
            expect(
                bubble2.getModel().isPublic()
            ).toBeFalsy();
            TestUtils.pressCtrlPlusKey("P");
            expect(
                bubble1.getModel().isPublic()
            ).toBeTruthy();
            expect(
                bubble2.getModel().isPublic()
            ).toBeTruthy();
        });
    });
});