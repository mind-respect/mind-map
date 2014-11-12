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
        var child1,
            centerBubble;
        beforeEach(function () {
            var scenario = new Scenarios.threeBubblesGraph();
            child1 = scenario.getChild1BubbleInTree();
            centerBubble = scenario.getCenterBubbleInTree();
        });
        it("can return parent bubble", function(){
            var parentBubble = child1.getParentBubble();
            expect(
                parentBubble.text()
            ).toBe("r1");
        });
        it("can return top most child bubble", function(){
            var triple = Scenarios.getTriple();
            var newEdge = GraphDisplayer.addEdgeAndVertex(
                child1,
                Edge.fromServerFormat(triple.edge),
                Vertex.fromServerFormat(triple.end_vertex)
            ).edge();
            expect(
                child1.getTopMostChildBubble().getUri()
            ).toBe(newEdge.getUri());
        });
    });
});