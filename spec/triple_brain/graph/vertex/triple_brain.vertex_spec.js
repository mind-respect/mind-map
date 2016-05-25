/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'triple_brain.vertex'
], function (Scenarios, Vertex) {
    "use strict";
    describe("vertex", function () {
        it("includes number of connected edges when building server format from ui", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var bubble1 = scenario.getBubble1InTree();
            var serverFormat = Vertex.buildServerFormatFromUi(bubble1);
            var facade = Vertex.fromServerFormat(serverFormat);
            expect(
                facade.getNumberOfConnectedEdges()
            ).toBe(2);
        });
        it("sets number of connected edges to 0 when building server format from a leaf in the ui", function () {
            var bubble7 = new Scenarios.creationDateScenario().getBubble7InTree();
            expect(
                bubble7.connectedEdges().length
            ).toBe(1);
            expect(
                bubble7.getTotalNumberOfEdges()
            ).toBe(5);
            var serverFormat = Vertex.buildServerFormatFromUi(bubble7);
            var facade = Vertex.fromServerFormat(serverFormat);
            expect(
                facade.getNumberOfConnectedEdges()
            ).toBe(1);
        });
    });
});