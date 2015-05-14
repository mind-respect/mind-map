/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/webapp/js/test-scenarios",
    "test/webapp/js/test-utils",
    "test/webapp/js/mock/triple_brain.vertex_service_mock",
    "triple_brain.keyboard_actions_handler",
    "triple_brain.selection_handler"
], function (Scenarios, TestUtils, VertexServiceMock, KeyBoardActionsHandler, SelectionHandler) {
    "use strict";
    describe("keyboard_action_handler", function () {
        beforeEach(function () {
            KeyBoardActionsHandler._handleKeyboardActions();
        });
        it("adds a child when pressing tab key", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            SelectionHandler.setToSingleGraphElement(bubble1);
            var numberOfChild = bubble1.getNumberOfChild();
            VertexServiceMock.addRelationAndVertexToVertex();
            TestUtils.pressKey("\t");
            expect(
                bubble1.getNumberOfChild()
            ).toBe(
                numberOfChild + 1
            );
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
    });
});