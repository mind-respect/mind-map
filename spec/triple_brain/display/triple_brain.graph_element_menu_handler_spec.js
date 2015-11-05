/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "triple_brain.graph_element_menu_handler"
], function (Scenarios, TestUtils, GraphElementMenuHandler) {
    "use strict";
    describe("graph_element_menu_handler", function () {
        it("displays the graph element note", function(){
            loadFixtures('graph-element-note-menu.html');
            var threeBubbles = new Scenarios.threeBubblesGraph();
            GraphElementMenuHandler.forSingle().noteAction(
                threeBubbles.getBubble1InTree()
            );
            expect(
                GraphElementMenuHandler._getContentEditor().html()
            ).toBe("");
            GraphElementMenuHandler.forSingle().noteAction(
                threeBubbles.getBubble3InTree()
            );
            expect(
                GraphElementMenuHandler._getContentEditor().html()
            ).toBe("b3 comment");
        });
        //it("prevents iframe injection", function(){
        //    loadFixtures('graph-element-note-menu.html');
        //    GraphElementMenuHandler.noteAction();
        //    expect(false).toBeTruthy();
        //});
    });
});