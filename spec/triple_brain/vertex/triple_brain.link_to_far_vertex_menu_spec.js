/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'triple_brain.link_to_far_vertex_menu',
    "triple_brain.edge_service"
], function (Scenarios, LinkToFarVertexMenu, EdgeService) {
    "use strict";
    describe("link_to_far_vertex_menu", function () {
        it("can link to non related vertex", function () {
            var someOtherBubble = new Scenarios.GraphWithAnInverseRelationScenario().getCenterVertex();
            var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var linkToFarVertexMenu = LinkToFarVertexMenu.ofVertex(b1).create();
            var addToFarVertexSpy = spyOn(
                EdgeService,
                "addToFarVertex"
            );
            linkToFarVertexMenu._selectElementWithUri(
                someOtherBubble.getUri()
            );
            expect(
                addToFarVertexSpy.calls.count()
            ).toBe(1);
        });
        it("cannot add a relation to existing child", function () {
            var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var linkToFarVertexMenu = LinkToFarVertexMenu.ofVertex(
                b1
            ).create();
            var childVertex = b1.getTopMostChildBubble().getTopMostChildBubble();
            var addToFarVertexSpy = spyOn(
                EdgeService,
                "addToFarVertex"
            );
            linkToFarVertexMenu._selectElementWithUri(
                childVertex.getUri()
            );
            expect(
                addToFarVertexSpy.calls.count()
            ).toBe(0);
        });
        it("cannot add a relation to existing parent", function () {
            var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var childVertex = b1.getTopMostChildBubble().getTopMostChildBubble();
            var linkToFarVertexMenu = LinkToFarVertexMenu.ofVertex(
                childVertex
            ).create();
            var addToFarVertexSpy = spyOn(
                EdgeService,
                "addToFarVertex"
            );
            linkToFarVertexMenu._selectElementWithUri(
                b1.getUri()
            );
            expect(
                addToFarVertexSpy.calls.count()
            ).toBe(0);
        });
    });
});