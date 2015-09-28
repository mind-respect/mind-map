/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "triple_brain.vertex_html_builder",
    "triple_brain.ui.graph",
    "triple_brain.selection_handler"
], function (Scenarios, TestUtils, VertexHtmlBuilder, GraphUi, SelectionHandler) {
    "use strict";
    describe("vertex_html_builder", function () {
        var bubble1, graphWithCircularityScenario;
        beforeEach(function () {
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            bubble1 = threeBubblesScenario.getBubble1();
            graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
        });
        it("can build from server facade", function () {
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
        it("if no uiId is specified it generates one", function () {
            var vertexUi = VertexHtmlBuilder.withServerFacade(
                bubble1
            ).create();
            expect(
                vertexUi.getId()
            ).toBeDefined();
        });
        it("adds duplicate button if has duplicate", function () {
            var bubble1 = graphWithCircularityScenario.getBubble1InTree();
            expect(
                bubble1.hasTheDuplicateButton()
            ).toBeFalsy();
            var bubble2 = graphWithCircularityScenario.getBubble2InTree();
            graphWithCircularityScenario.expandBubble2(bubble2);
            var bubble3 = bubble2.getTopMostChildBubble().getTopMostChildBubble();
            graphWithCircularityScenario.expandBubble3(bubble3);
            expect(
                bubble1.hasTheDuplicateButton()
            ).toBeTruthy();
            expect(
                bubble3.hasTheDuplicateButton()
            ).toBeTruthy();
            var bubble1Duplicate = bubble3.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                bubble1Duplicate.hasTheDuplicateButton()
            ).toBeTruthy();
        });
        it("hides menu when dragging", function () {
            var bubble2 = new Scenarios.threeBubblesGraph().getBubble2InTree();
            SelectionHandler.setToSingleGraphElement(
                bubble2
            );
            expect(
                bubble2.getMenuHtml()
            ).not.toHaveClass("hidden");
            TestUtils.startDragging(bubble2);
            expect(
                bubble2.getMenuHtml()
            ).toHaveClass("hidden");
        });
        it("hides hidden properties container when dragging", function () {
            var bubble2 = new Scenarios.getGraphWithHiddenSimilarRelations().getBubble2InTree();
            expect(
                bubble2.getHiddenRelationsContainer()._getHtml()
            ).not.toHaveClass("hidden");
            TestUtils.startDragging(bubble2);
            expect(
                bubble2.getHiddenRelationsContainer()._getHtml()
            ).toHaveClass("hidden");
        });
    });
});