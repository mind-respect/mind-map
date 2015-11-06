/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "jquery",
    "triple_brain.graph_element_menu_handler"
], function (Scenarios, TestUtils, $, GraphElementMenuHandler) {
    "use strict";
    describe("graph_element_menu_handler", function () {
        it("displays the graph element note", function () {
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
        it("prevents iframe injection", function () {
            loadFixtures('graph-element-note-menu.html');
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble1.setNote("<iframe></iframe>");
            GraphElementMenuHandler.forSingle().noteAction(
                bubble1
            );
            expect(
                GraphElementMenuHandler._getContentEditor().html()
            ).toBe("");
        });
        it("prevents script injection", function () {
            loadFixtures('graph-element-note-menu.html');
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble1.setNote("<script>alert('yo')</script>");
            GraphElementMenuHandler.forSingle().noteAction(
                bubble1
            );
            expect(
                GraphElementMenuHandler._getContentEditor().html()
            ).toBe("");
        });
        it("can have script tag as text", function () {
            loadFixtures('graph-element-note-menu.html');
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble1.setNote(
                $("<div>").text("<script>alert('yo')</script>")
            );
            GraphElementMenuHandler.forSingle().noteAction(
                bubble1
            );
            expect(
                GraphElementMenuHandler._getContentEditor().html()
            ).toBe("<div>&lt;script&gt;alert('yo')&lt;/script&gt;</div>");
        });
    });
});