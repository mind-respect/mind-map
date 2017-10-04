/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    'test/mock',
    "mr.vertex-ui-builder",
    "triple_brain.graph_ui",
    "triple_brain.selection_handler",
    "triple_brain.edge_controller",
    "triple_brain.mind_map_info"
], function (Scenarios, TestUtils, Mock, VertexUiBuilder, GraphUi, SelectionHandler, EdgeController, MindMapInfo) {
    "use strict";
    describe("vertex-ui-builder", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        var bubble1, graphWithCircularityScenario;
        beforeEach(function () {
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            bubble1 = threeBubblesScenario.getBubble1();
            graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
        });
        it("can build from server facade", function () {
            var uiId = GraphUi.generateBubbleHtmlId();
            var vertexUi = new VertexUiBuilder.VertexUiBuilder().create(
                bubble1,
                uiId
            );
            expect(
                vertexUi.getId()
            ).toBe(uiId);
            expect(
                vertexUi.getUri()
            ).toBe(bubble1.getUri());
        });
        it("if no uiId is specified it generates one", function () {
            var vertexUi = new VertexUiBuilder.VertexUiBuilder().create(
                bubble1
            );
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
        xit("doesn't move to a parent bubble that is the child of the dragged one", function () {
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
            var changeEndVertexSpy = spyOn(EdgeController.RelationController.prototype, "changeEndVertex");
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
            var changeSourceVertexSpy = Mock.getSpy(
                "EdgeService",
                "changeSourceVertex"
            );
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
            var bubble1Ui = new VertexUiBuilder.VertexUiBuilder().create(bubble1, "123");
            expect(
                bubble1Ui.getLabel().find("a").length
            ).toBe(0);
            bubble1.setLabel("http://bubl.guru");
            bubble1Ui = new VertexUiBuilder.VertexUiBuilder().create(
                bubble1,
                "123"
            );
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
        it("does not link non links when there is a link present", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble1.setText("The potatoes are cooked https://bubl.guru/user/vince/graph/vertex/9d73e974-80c1-4a7c-8736-f0ec6178226d");
            bubble1.getLabel().blur();
            var link = bubble1.getLabel().find("a:first");
            var linkTextWithoutLineBreak = link.text().replace(
                /\n/g,
                ''
            );
            expect(
                linkTextWithoutLineBreak
            ).toBe(
                "https://bubl.guru/user/vince/graph/vertex/9d73e974-80c1-4a7c-8736-f0ec6178226d"
            );
        });
        it("still wraps long text when there is a link", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            bubble1.setText(
                "The potatoes are cooked for a long time " +
                "so that this makes quite a long text in " +
                "the bubble https://bubl.guru/user/vince/graph/vertex/9d73e974-80c1-4a7c-8736-f0ec6178226d"
            );
            bubble1.getLabel().blur();
            var textBubbleRaw = bubble1.getHtml().text();
            var hasLineBreak = /\r|\n/.exec(textBubbleRaw);
            expect(
                hasLineBreak
            ).not.toBeNull();
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
        xit("displays hidden properties container if bubble has a duplicate that is also not expanded", function () {
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