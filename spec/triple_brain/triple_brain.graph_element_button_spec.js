/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'triple_brain.graph_element_button',
    'triple_brain.graph_element_main_menu',
    'triple_brain.relative_tree_vertex_menu_handler',
    'triple_brain.mind_map_info'
], function (Scenarios, GraphElementButton, GraphElementMainMenu, RelativeTreeVertexMenuHandler, MindMapInfo) {
    "use strict";
    describe("graph_element_button", function () {
        it("main menu button remains hidden if only one bubble is selected", function(){
            loadFixtures('graph-element-menu.html');
            MindMapInfo._setIsViewOnly(false);
            var scenario = new Scenarios.threeBubblesGraph();
            var bubble1 = scenario.getBubble1InTree();
            GraphElementMainMenu.reset();
            var makePublicButton = GraphElementButton.fromHtml(
                getButtonHtmlHavingAction("makePublic")
            );
            makePublicButton.showOnlyIfApplicable(
                RelativeTreeVertexMenuHandler.forSingle(),
                bubble1
            );
            expect(
                makePublicButton.getHtml()
            ).toHaveClass("hidden");
            var bubble2 = scenario.getBubble2InTree();
            makePublicButton.showOnlyIfApplicable(
                RelativeTreeVertexMenuHandler.forGroup(),
                [bubble1,bubble2]
            );
            expect(
                makePublicButton.getHtml()
            ).not.toHaveClass("hidden");
        });
    });
    function getButtonHtmlHavingAction(action){
        return GraphElementMainMenu._getMenu().find(
            "button[data-action="+action+"]"
        );
    }
});