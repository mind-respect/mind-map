/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    "test/test-utils",
    'test/mock',
    "triple_brain.edge_ui",
    "triple_brain.selection_handler",
    "triple_brain.graph_element_type"
], function (Scenarios, TestUtils, Mock, EdgeUi) {
    "use strict";
    describe("edge_ui", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("can visit all edges", function () {
            var threeBubblesGraph = new Scenarios.threeBubblesGraph();
            threeBubblesGraph.getBubble1InTree();
            var edges = [];
            EdgeUi.visitAllEdges(function(edge){
                edges.push(edge);
            });
            expect(
                edges.length
            ).toBe(2);
        });
    });
});