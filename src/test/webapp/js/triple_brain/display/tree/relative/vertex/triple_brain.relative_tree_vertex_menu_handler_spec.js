/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/webapp/js/test-scenarios',
    "test/webapp/js/mock/triple_brain.vertex_service_mock",
    'triple_brain.relative_tree_vertex_menu_handler',
    'triple_brain.vertex_service',
    'triple_brain.mind_map_info'
], function (Scenarios, VertexServiceMock, RelativeTreeVertexMenuHandler, VertexService, MindMapInfo) {
    "use strict";
    describe("relative_tree_vertex_menu_handler", function () {
        var threeBubbles;
        beforeEach(function () {
            threeBubbles = new Scenarios.threeBubblesGraph();
        });
        it("removes connected edges when removing a vertex", function () {
            VertexServiceMock.removeVertex();
            MindMapInfo._setIsViewOnly(false);
            var bubble1 = threeBubbles.getBubble1InTree(),
                r1 = threeBubbles.getRelation1InTree();
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