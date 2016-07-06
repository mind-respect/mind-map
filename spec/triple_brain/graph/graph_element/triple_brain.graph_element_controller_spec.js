/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "test/test-scenarios",
    "test/test-utils",
    "test/mock/triple_brain.friendly_resource_service_mock",
    "triple_brain.graph_element_controller",
    "triple_brain.sub_graph"
], function ($, Scenarios, TestUtils, FriendlyResourceServiceMock, GraphElementController, SubGraph) {
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
        it("can have script tag as text", function () {

        });
        it("updates model label when accepting comparison", function(){
            FriendlyResourceServiceMock.updateLabel();
            var scenario = new Scenarios.threeBubblesGraphFork();
            var b1Fork = scenario.getBubble1InTree();
            TestUtils.enterCompareFlowWithGraph(
                SubGraph.fromServerFormat(
                    new Scenarios.threeBubblesGraph().getGraph()
                )
            );
            b1Fork.setText("potatoe");
            b1Fork.getLabel().blur();
            expect(
                b1Fork.getModel().getLabel()
            ).toBe("potatoe");
            b1Fork.getController().accept();
            expect(
                b1Fork.getModel().getLabel()
            ).toBe("b1");
        });
    });
});