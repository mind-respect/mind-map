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
    describe("bubble", function () {
        var bubble2,
            centerBubble;
        beforeEach(function () {
            var scenario = new Scenarios.threeBubblesGraph();
            bubble2 = scenario.getBubble2InTree();
            centerBubble = scenario.getCenterBubbleInTree();
        });
        it("can return parent bubble", function () {
            var parentBubble = bubble2.getParentBubble();
            expect(
                parentBubble.text()
            ).toBe("r1");
        });
        it("returns center when getting parent bubble of center vertex", function () {
            var parentBubble = centerBubble.getParentBubble();
            expect(
                parentBubble.getUri()
            ).toBe(centerBubble.getUri());
        });
        it("can return parent vertex", function () {
            var parentVertex = bubble2.getParentVertex();
            expect(
                parentVertex.text()
            ).toBe("b1");
        });
        it("returns grand parent if parent is not a vertex", function () {
            var newVertex = Scenarios.addTriple(bubble2).destinationVertex();
            expect(
                newVertex.getParentVertex().getUri()
            ).toBe(bubble2.getUri());
        });
        it("can return top most child bubble", function () {
            var newEdge = Scenarios.addTriple(
                bubble2
            ).edge();
            expect(
                bubble2.getTopMostChildBubble().getUri()
            ).toBe(newEdge.getUri());
        });

        it("can get bubble above an edge", function () {
            var newEdge1 = Scenarios.addTriple(bubble2).edge(),
                newEdge2 = Scenarios.addAnotherTriple(bubble2).edge();
            expect(
                newEdge2.getBubbleAbove().getId()
            ).toBe(newEdge1.getId());
        });

        it("can get bubble above a vertex", function () {
            var newVertex1 = Scenarios.addTriple(bubble2).destinationVertex(),
                newVertex2 = Scenarios.addAnotherTriple(
                    bubble2
                ).destinationVertex();
            expect(
                newVertex2.getBubbleAbove().getId()
            ).toBe(newVertex1.getId());
        });

        it("returns itself when getting bubble above center vertex", function () {
            expect(
                centerBubble.getBubbleAbove().getId()
            ).toBe(centerBubble.getId());
        });

        it("returns itself when no bubble above", function () {
            expect(
                bubble2.getBubbleAbove().getId()
            ).toBe(bubble2.getId());
        });

        it("can get bubble under an edge", function () {
            var newEdge1 = Scenarios.addTriple(bubble2).edge(),
                newEdge2 = Scenarios.addAnotherTriple(bubble2).edge();
            expect(
                newEdge1.getBubbleUnder().getId()
            ).toBe(newEdge2.getId());
        });

        it("can get bubble under a vertex", function () {
            var newVertex1 = Scenarios.addTriple(bubble2).destinationVertex(),
                newVertex2 = Scenarios.addAnotherTriple(
                    bubble2
                ).destinationVertex();
            expect(
                newVertex1.getBubbleUnder().getId()
            ).toBe(newVertex2.getId());
        });

        it("returns itself when getting bubble under center vertex", function () {
            expect(
                centerBubble.getBubbleUnder().getId()
            ).toBe(centerBubble.getId());
        });

        it("returns itself when no bubble under", function () {
            expect(
                bubble2.getBubbleUnder().getId()
            ).toBe(bubble2.getId());
        });
    });
});