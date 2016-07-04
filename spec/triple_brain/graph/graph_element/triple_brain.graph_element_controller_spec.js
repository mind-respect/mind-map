/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "jquery",
    "triple_brain.graph_element_controller"
], function (Scenarios, TestUtils, $, GraphElementController) {
    "use strict";
    describe("graph_element_controller", function () {
        it("displays the graph element note", function () {
            loadFixtures('graph-element-note-menu.html');
            var threeBubbles = new Scenarios.threeBubblesGraph();
            threeBubbles.getBubble1InTree().getController().note();
            expect(
                GraphElementController._getContentEditor().html()
            ).toBe("");
            threeBubbles.getBubble3InTree().getController().note();
            expect(
                GraphElementController._getContentEditor().html()
            ).toBe("b3 comment");
        });
        it("prevents iframe injection", function () {
            loadFixtures('graph-element-note-menu.html');
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble1.setNote("<iframe></iframe>");
            bubble1.getController().note();
            expect(
                GraphElementController._getContentEditor().html()
            ).toBe("");
        });
        it("prevents script injection", function () {
            loadFixtures('graph-element-note-menu.html');
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble1.setNote("<script>alert('yo')</script>");
            bubble1.getController().note();
            expect(
                GraphElementController._getContentEditor().html()
            ).toBe("");
        });
        it("can have script tag as text", function () {
            loadFixtures('graph-element-note-menu.html');
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble1.setNote(
                $("<div>").text("<script>alert('yo')</script>")
            );
            bubble1.getController().note();
            expect(
                GraphElementController._getContentEditor().html()
            ).toBe("<div>&lt;script&gt;alert('yo')&lt;/script&gt;</div>");
        });
    });
});