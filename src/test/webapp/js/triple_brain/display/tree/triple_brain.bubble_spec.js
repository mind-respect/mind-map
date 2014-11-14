/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.graph_displayer",
    "triple_brain.edge",
    "triple_brain.vertex",
    'test/webapp/js/test-scenarios'
], function (GraphDisplayer, Edge, Vertex, Scenarios) {
    "use strict";
    describe("bubble", function(){
        var bubble2,
            centerBubble;
        beforeEach(function () {
            var scenario = new Scenarios.threeBubblesGraph();
            bubble2 = scenario.getBubble2InTree();
            centerBubble = scenario.getCenterBubbleInTree();
        });
        it("can return parent bubble", function(){
            var parentBubble = bubble2.getParentBubble();
            expect(
                parentBubble.text()
            ).toBe("r1");
        });
        it("can return parent vertex", function(){
            var parentVertex = bubble2.getParentVertex();
            expect(
                parentVertex.text()
            ).toBe("b1");
        });
        it("returns grand parent if parent is not a vertex", function(){
            //todo
        });
        it("can return top most child bubble", function(){
            var triple = Scenarios.getTriple();
            var newEdge = GraphDisplayer.addEdgeAndVertex(
                bubble2,
                Edge.fromServerFormat(triple.edge),
                Vertex.fromServerFormat(triple.end_vertex)
            ).edge();
            expect(
                bubble2.getTopMostChildBubble().getUri()
            ).toBe(newEdge.getUri());
        });
    });
});