/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'triple_brain.graph_element_main_menu',
    'triple_brain.selection_handler',
    "triple_brain.event_bus",
    "triple_brain.mind_map_info"
], function (Scenarios, GraphElementMainMenu, SelectionHandler, EventBus, MindMapInfo) {
    "use strict";
    describe("graph_element_main_menu", function () {
        it("returns the whole graph click handler if button is for whole graph even when a bubble is selected", function () {
            loadFixtures('graph-element-menu.html');
            var bubble = new Scenarios.threeBubblesGraph().getBubble1InTree();
            GraphElementMainMenu.reset();
            var clickHandler = GraphElementMainMenu._getCurrentClickHandler(
                getAWholeGraphButton()
            );
            expect(
                clickHandler.selectCanDo()
            ).toBeTruthy();
            SelectionHandler.setToSingleGraphElement(
                bubble
            );
            clickHandler = GraphElementMainMenu._getCurrentClickHandler(
                getAWholeGraphButton()
            );
            expect(
                clickHandler.selectCanDo()
            ).toBeTruthy();
        });
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
        EventBus.publish(
            '/event/ui/graph/vertex/suggestions/updated',
            [bubble, suggestions]
        );
        expect(
            bubble.getButtonHtmlHavingAction("suggestions")
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