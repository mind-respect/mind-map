/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'triple_brain.selection_handler'
], function (Scenarios, SelectionHandler) {
    "use strict";
    describe("selection_handler", function () {
        it("can tell if only one vertex is selected", function(){
            var b2 = new Scenarios.threeBubblesGraph().getBubble2InTree();
            SelectionHandler.removeAll();
            expect(
                SelectionHandler.isOnlyASingleBubbleSelected()
            ).toBeFalsy();
            SelectionHandler.addVertex(b2);
            expect(
                SelectionHandler.isOnlyASingleBubbleSelected()
            ).toBeTruthy();
        });
    });
});