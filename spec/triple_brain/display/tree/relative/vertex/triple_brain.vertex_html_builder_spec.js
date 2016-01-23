/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "triple_brain.vertex_html_builder",
    "triple_brain.ui.graph",
    "triple_brain.selection_handler",
    "triple_brain.edge_service"
], function (Scenarios, TestUtils, VertexHtmlBuilder, GraphUi, SelectionHandler, EdgeService) {
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
            ).toHaveCss({visibility: "hidden"});
        });
        it("hides arrow when dragging", function () {
            var bubble2 = new Scenarios.threeBubblesGraph().getBubble2InTree();
            expect(
                bubble2.getArrowHtml()
            ).not.toHaveClass("hidden");
            TestUtils.startDragging(bubble2);
            expect(
                bubble2.getArrowHtml()
            ).toHaveClass("hidden");
        });
        it("shows arrow back when stopping to drag", function () {
            var bubble2 = new Scenarios.threeBubblesGraph().getBubble2InTree();
            TestUtils.startDragging(bubble2);
            expect(
                bubble2.getArrowHtml()
            ).toHaveClass("hidden");
            TestUtils.endDragging(bubble2);
            expect(
                bubble2.getArrowHtml()
            ).not.toHaveClass("hidden");
        });
        it("shows hidden relations container when stopping to drag", function () {
            var bubble2 = new Scenarios.getGraphWithHiddenSimilarRelations().getBubble2InTree();
            TestUtils.startDragging(bubble2);
            expect(
                bubble2.getHiddenRelationsContainer()._getHtml()
            ).toHaveCss({visibility: "hidden"});
            TestUtils.endDragging(bubble2);
            expect(
                bubble2.getHiddenRelationsContainer()._getHtml()
            ).toHaveCss({visibility: "visible"});
        });
        it("doesn't move to a parent bubble that is the child of the dragged one", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            TestUtils.startDragging(bubble1);
            var bubble2 = TestUtils.getChildWithLabel(
                bubble1,
                "r1"
            ).getTopMostChildBubble();
            TestUtils.drop(bubble2);
            expect(
                bubble1.getParentBubble().getUri() === bubble2.getParentBubble().getUri()
            ).toBeFalsy();
        });
        it("cant drag and drop a vertex onto itself", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var bubble2 = TestUtils.getChildWithLabel(
                bubble1,
                "r1"
            ).getTopMostChildBubble();
            var newVertex = TestUtils.addTriple(bubble2).destinationVertex();
            TestUtils.startDragging(newVertex);
            var changeSourceVertexSpy = spyOn(EdgeService, "changeSourceVertex");
            expect(
                changeSourceVertexSpy.calls.count()
            ).toBe(0);
            TestUtils.drop(bubble1);
            expect(
                changeSourceVertexSpy.calls.count()
            ).toBe(1);
            TestUtils.startDragging(newVertex);
            TestUtils.drop(newVertex);
            expect(
                changeSourceVertexSpy.calls.count()
            ).toBe(1);
        });
        it("detects links and changes them to hyperlinks on blur", function(){
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            expect(
                bubble1.getLabel().find("a").length
            ).toBe(0);
            bubble1.getLabel().text(
                "http://bubl.guru"
            ).blur();
            expect(
                bubble1.getLabel().find("a").length
            ).toBe(1);
        });
        it("detects links and changes them to hyperlinks when building vertex", function(){
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1();
            var bubble1Ui = VertexHtmlBuilder.withServerFacade(bubble1).create("123");
            expect(
                bubble1Ui.getLabel().find("a").length
            ).toBe(0);
            bubble1.setLabel("http://bubl.guru");
            bubble1Ui = VertexHtmlBuilder.withServerFacade(bubble1).create("123");
            expect(
                bubble1Ui.getLabel().find("a").length
            ).toBe(1);
        });
    });
});