/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "test/webapp/js/test-scenarios",
    "triple_brain.vertex_html_builder",
    "triple_brain.ui.graph"
], function (Scenarios, VertexHtmlBuilder, GraphUi) {
    "use strict";
    describe("vertex_html_builder", function () {
        var bubble1;
        beforeEach(function () {
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            bubble1 = threeBubblesScenario.getBubble1();
        });
        it("can build from server facade", function(){
            var uiId = GraphUi.generateBubbleHtmlId();
            var vertexUi = VertexHtmlBuilder.withServerFacade(
                bubble1
            ).create(uiId);
            expect(
                vertexUi.getId()
            ).toBe(uiId);
            expect(
                vertexUi.getUri()
            ).toBe(bubble1.getUri());
        });
        it("if no uiId is specified it generates one", function(){
            var vertexUi = VertexHtmlBuilder.withServerFacade(
                bubble1
            ).create();
            expect(
                vertexUi.getId()
            ).toBeDefined();
        });
    });
});