/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "test/mock/triple_brain.vertex_service_mock",
    "triple_brain.vertex_html_builder",
    "triple_brain.graph_ui",
    "triple_brain.selection_handler",
    "triple_brain.edge_service",
    "triple_brain.edge_controller",
    "triple_brain.mind_map_info"
], function (Scenarios, TestUtils, VertexServiceMock, VertexHtmlBuilder, GraphUi, SelectionHandler, EdgeService, EdgeController, MindMapInfo) {
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
            loadFixtures('graph-element-menu.html');
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
            MindMapInfo._setIsViewOnly(false);
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
            MindMapInfo._setIsViewOnly(false);
            var bubble2 = new Scenarios.graphWithHiddenSimilarRelations().getBubble2InTree();
            expect(
                bubble2.getHiddenRelationsContainer().isVisible()
            ).toBeTruthy();
            TestUtils.startDragging(bubble2);
            expect(
                bubble2.getHiddenRelationsContainer().isVisible()
            ).toBeFalsy();
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
            MindMapInfo._setIsViewOnly(false);
            var bubble2 = new Scenarios.graphWithHiddenSimilarRelations().getBubble2InTree();
            TestUtils.startDragging(bubble2);
            expect(
                bubble2.getHiddenRelationsContainer().isVisible()
            ).toBeFalsy();
            TestUtils.endDragging(bubble2);
            expect(
                bubble2.getHiddenRelationsContainer().getHtml()
            ).toBeTruthy();
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
            MindMapInfo._setIsViewOnly(false);
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var bubble2 = TestUtils.getChildWithLabel(
                bubble1,
                "r1"
            ).getTopMostChildBubble();
            var newVertex = TestUtils.addTriple(bubble2).destinationVertex();
            TestUtils.startDragging(newVertex);
            var changeEndVertexSpy = spyOn(EdgeController.Self.prototype, "changeEndVertex");
            expect(
                changeEndVertexSpy.calls.count()
            ).toBe(0);
            TestUtils.drop(bubble1);
            expect(
                changeEndVertexSpy.calls.count()
            ).toBe(1);
            TestUtils.startDragging(newVertex);
            TestUtils.drop(newVertex);
            expect(
                changeEndVertexSpy.calls.count()
            ).toBe(1);
        });
        it("disables drags and drops when for anonymous user", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            MindMapInfo._setIsViewOnly(true);
            var bubble1 = scenario.getBubble1InTree();
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
            ).toBe(0);
        });
        it("detects links and changes them to hyperlinks on blur", function () {
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
        it("detects links and changes them to hyperlinks when building vertex", function () {
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
        it("builds long hyperlink correctly", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble1.setText("https://bubl.guru/user/vince/graph/vertex/9d73e974-80c1-4a7c-8736-f0ec6178226d");
            bubble1.getLabel().blur();
            var link = bubble1.getLabel().find("a");
            expect(
                link.prop("href")
            ).toBe(
                "https://bubl.guru/user/vince/graph/vertex/9d73e974-80c1-4a7c-8736-f0ec6178226d"
            );
        });
        it("hides the hidden neighbor properties indicator when the bubble has a duplicate bubble that is already expanded", function () {
            var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
            var bubble1 = graphWithCircularityScenario.getBubble1InTree();
            var bubble2 = TestUtils.getChildWithLabel(
                bubble1,
                "r1"
            ).getTopMostChildBubble();
            graphWithCircularityScenario.expandBubble2(
                bubble2
            );
            var bubble3 = bubble2.getTopMostChildBubble().getTopMostChildBubble();
            graphWithCircularityScenario.expandBubble3(bubble3);
            var bubble2AsChildOfB3 = TestUtils.getChildWithLabel(
                bubble3,
                "r2"
            ).getTopMostChildBubble();
            expect(
                bubble2AsChildOfB3.hasVisibleHiddenRelationsContainer()
            ).toBeFalsy();
        });
        it("displays hidden properties container if bubble has a duplicate that is also not expanded", function () {
            var center = new Scenarios.centerWith2RelationsToSameChildScenario().getCenterInTree();
            expect(
                center.getNumberOfChild()
            ).toBe(2);
            var child = center.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                child.hasOtherInstances()
            ).toBeTruthy();
            expect(
                child.hasHiddenRelationsContainer()
            ).toBeTruthy();
        });
        it("sets the direction of the 'add child arrow' of the center vertex correctly each time a vertex is added", function () {
            loadFixtures('graph-element-menu.html');
            var scenario = new Scenarios.threeBubblesGraph();
            var centerBubble = scenario.getCenterBubbleInTree();
            VertexServiceMock.addRelationAndVertexToVertexMock();
            MindMapInfo._setIsViewOnly(false);
            expect(
                centerBubble.getAddChildButton()
            ).not.toHaveClass("left");
            centerBubble.getController().addChild();
            expect(
                centerBubble.getAddChildButton()
            ).toHaveClass("left");
        });
    });
});