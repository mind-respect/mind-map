/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.graph_displayer_as_relative_tree",
    "triple_brain.edge",
    "triple_brain.vertex",
    "triple_brain.center_bubble",
    'test/webapp/js/test-scenarios'
], function (GraphDisplayerAsRelativeTree, Edge, Vertex, CenterBubble, Scenarios) {
    "use strict";
    describe("graph_displayer_as_relative_tree_spec", function () {
        var bubble1;
        beforeEach(function () {
            bubble1 = new Scenarios.threeBubblesGraph().getCenterBubbleInTree();
        });

        it("distributes triples evenly to the right and left", function () {
            var centerBubble = CenterBubble.usingBubble(bubble1);
            expect(
                centerBubble._getNumberOfImmediateBubblesToLeft()
            ).toBe(1);
            expect(
                centerBubble._getNumberOfImmediateBubblesToRight()
            ).toBe(1);
        });

        it("distributes new triples evenly to the right and left", function () {
            var triple1 = Scenarios.getTriple(),
                firstAddedEdge = GraphDisplayerAsRelativeTree.addEdgeAndVertex(
                    bubble1,
                    Edge.fromServerFormat(triple1.edge),
                    Vertex.fromServerFormat(triple1.end_vertex)
                ).edge(),
                triple2 = Scenarios.getAnotherTriple(),
                secondAddedEdge = GraphDisplayerAsRelativeTree.addEdgeAndVertex(
                    bubble1,
                    Edge.fromServerFormat(triple2.edge),
                    Vertex.fromServerFormat(triple2.end_vertex)
                ).edge();
            expect(
                firstAddedEdge.isToTheLeft()
            ).toBeFalsy();
            expect(
                secondAddedEdge.isToTheLeft()
            ).toBeTruthy();
        });
    });
});