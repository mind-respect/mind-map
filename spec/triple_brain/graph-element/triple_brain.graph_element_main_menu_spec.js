/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    'triple_brain.graph_element_main_menu',
    'triple_brain.selection_handler',
    "triple_brain.event_bus",
    "triple_brain.mind_map_info",
    "triple_brain.vertex_controller",
    "triple_brain.edge_controller",
    "triple_brain.graph_element_controller"
], function (Scenarios, TestUtils, Mock, GraphElementMainMenu, SelectionHandler, EventBus, MindMapInfo, VertexController, EdgeController, GraphElementController) {
    "use strict";
    describe("graph_element_main_menu", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("returns the whole graph click handler if button is for whole graph even when a bubble is selected", function () {
            loadFixtures('graph-element-menu.html');
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            GraphElementMainMenu.reset();
            var clickHandler = GraphElementMainMenu._getCurrentClickHandler(
                getAWholeGraphButton()
            );
            expect(
                clickHandler.hasOwnProperty("selectAllBubbles")
            ).toBeTruthy();
            SelectionHandler.setToSingleGraphElement(
                bubble
            );
            clickHandler = GraphElementMainMenu._getCurrentClickHandler(
                getAWholeGraphButton()
            );
            expect(
                clickHandler.hasOwnProperty("selectAllBubbles")
            ).toBeTruthy();
        });
        it("updates buttons visibility when suggestions are changed", function () {
            loadFixtures('graph-element-menu.html');
            MindMapInfo._setIsViewOnly(false);
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            SelectionHandler.setToSingleGraphElement(bubble);
            expect(
                bubble.getButtonHtmlHavingAction("suggestions")
            ).toHaveClass("hidden");
            var suggestions = [
                new Scenarios.getKaraokeSchemaGraph().getLocationPropertyAsSuggestion()
            ];
            bubble.setSuggestions(
                suggestions
            );
            expect(
                bubble.getButtonHtmlHavingAction("suggestions")
            ).not.toHaveClass("hidden");
        });
        it("shows whole graph buttons when something is selected or not", function () {
            loadFixtures('graph-element-menu.html');
            MindMapInfo._setIsViewOnly(false);
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            SelectionHandler.setToSingleGraphElement(bubble);
            expect(
                getAWholeGraphButton().getHtml()
            ).not.toHaveClass("hidden");
            expect(
                getAWholeGraphButton()
            ).not.toHaveClass("hidden");
            SelectionHandler.removeAll();
            expect(
                getAWholeGraphButton().getHtml()
            ).not.toHaveClass("hidden");
        });
        function getAWholeGraphButton() {
            var wholeGraphButton;
            GraphElementMainMenu.visitButtons(function (button) {
                if (button.isForWholeGraph()) {
                    wholeGraphButton = button;
                }
            });
            return wholeGraphButton;
        }
    });
});
