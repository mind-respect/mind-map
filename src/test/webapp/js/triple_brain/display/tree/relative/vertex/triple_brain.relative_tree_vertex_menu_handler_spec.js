/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    'test/webapp/js/test-scenarios',
    'test/webapp/js/mock',
    'triple_brain.relative_tree_vertex_menu_handler',
    'triple_brain.vertex_service',
    'triple_brain.mind_map_info'
], function (Scenarios, Mock, RelativeTreeVertexMenuHandler, VertexService, MindMapInfo) {
    "use strict";
    describe("relative_tree_vertex_menu_handler", function () {
        var threeBubbles;
        beforeEach(function () {
            threeBubbles = new Scenarios.threeBubblesGraph();
        });
        it("removing vertex removes connected edges", function () {
            Mock.mockRemoveVertex();
            MindMapInfo._setIsViewOnly(false);
            var bubble1 = threeBubbles.getBubble1InTree(),
                r1 = bubble1.getTopMostChildBubble();
            expect(
                r1.text()
            ).toBe("r1");
            expect(
                bubble1.getNumberOfChild()
            ).toBe(2);
            var bubble2 = r1.getTopMostChildBubble();
            RelativeTreeVertexMenuHandler.forSingle().removeAction(bubble2, true);
            expect(
                bubble1.getNumberOfChild()
            ).toBe(1);
        });
    });
});