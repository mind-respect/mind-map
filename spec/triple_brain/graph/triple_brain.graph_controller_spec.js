/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'triple_brain.graph_controller',
    "triple_brain.graph_service",
    "triple_brain.mind_map_info"
], function (Scenarios, GraphController, GraphService, MindMapInfo) {
    "use strict";
    describe("graph_controller", function () {
        it("can expand all leafs", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            MindMapInfo._setIsViewOnly(false);
            var b2 = scenario.getBubble2InTree();
            expect(
                b2.getNumberOfChild()
            ).toBe(0);
            var b3 = scenario.getBubble3InTree();
            expect(
                b3.getNumberOfChild()
            ).toBe(0);
            spyOn(GraphService, "getForCentralBubbleUri").and.callFake(function (centerUri, callback) {
                var graph;
                if (centerUri === b2.getUri()) {
                    graph = scenario.getSubGraphForB2();
                } else if (centerUri === b3.getUri()) {
                    graph = scenario.getSubGraphForB3();
                }
                callback(graph);
            });
            GraphController.expandAll();
            expect(
                b2.getNumberOfChild()
            ).toBe(2);
            expect(
                b3.getNumberOfChild()
            ).toBe(2);
        });
    });
});