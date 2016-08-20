/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    "test/test-utils",
    "triple_brain.selection_handler"
], function (Scenarios, TestUtils, SelectionHandler) {
    "use strict";
    describe("bubble", function () {
        var edge1,
            child1,
            centerBubble;
        beforeEach(function () {
            var scenario = new Scenarios.threeBubblesGraph();
            edge1 = scenario.getRelation1InTree();
            child1 = scenario.getBubble2();
            centerBubble = scenario.getCenterBubbleInTree();
        });
        it("can inverse", function () {
            expect(
                edge1.isInverse()
            ).toBeFalsy();
            expect(
                edge1.getSourceVertex().getUri()
            ).toBe(centerBubble.getUri());
            expect(
                edge1.getDestinationVertex().getUri()
            ).toBe(child1.getUri());
            edge1.inverse();
            expect(
                edge1.isInverse()
            ).toBeTruthy();
            expect(
                edge1.getSourceVertex().getUri()
            ).toBe(child1.getUri());
            expect(
                edge1.getDestinationVertex().getUri()
            ).toBe(centerBubble.getUri());
        });
        it("can get child vertex in display", function () {
            expect(
                edge1.childVertexInDisplay().getUri()
            ).toBe(child1.getUri());
        });

        it("can get child vertex in display even if inverse", function () {
            edge1.inverse();
            expect(
                edge1.childVertexInDisplay().getUri()
            ).toBe(child1.getUri());
        });

        it("can get child vertex in display even if inverse", function () {
            edge1.inverse();
            expect(
                edge1.childVertexInDisplay().getUri()
            ).toBe(child1.getUri());
        });
        it("selects the parent vertex when removed", function () {
            var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var r1 = TestUtils.getChildWithLabel(
                b1,
                "r1"
            );
            SelectionHandler.setToSingleVertex(r1);
            expect(
                b1.isSelected()
            ).toBeFalsy();
            r1.remove();
            expect(
                b1.isSelected()
            ).toBeTruthy();
        });
    });
});