/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'triple_brain.graph_element_main_menu',
    'triple_brain.selection_handler'
], function (Scenarios, GraphElementMainMenu, SelectionHandler) {
    "use strict";
    describe("graph_element_main_menu", function () {
        it("returns the whole graph click handler if button is for whole graph even when a bubble is selected", function(){
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
    function getAWholeGraphButton(){
        var wholeGraphButton;
        GraphElementMainMenu.visitButtons(function(button){
            if(button.isForWholeGraph()){
                wholeGraphButton = button;
            }
        });
        return wholeGraphButton;
    }
});