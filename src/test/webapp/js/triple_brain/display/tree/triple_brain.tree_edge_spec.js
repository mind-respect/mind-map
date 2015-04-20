/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    'test/webapp/js/test-scenarios'
], function (Scenarios) {
    "use strict";
    describe("bubble", function(){
        var edge1,
            child1,
            centerBubble;
        beforeEach(function () {
            var scenario = new Scenarios.threeBubblesGraph();
            edge1 = scenario.getRelation1InTree();
            child1 = scenario.getBubble2();
            centerBubble = scenario.getCenterBubbleInTree();
        });
        it("can inverse", function(){
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
        it("can get child vertex in display", function(){
            expect(
                edge1.childVertexInDisplay().getUri()
            ).toBe(child1.getUri())
        });

        it("can get child vertex in display even if inverse", function(){
            edge1.inverse();
            expect(
                edge1.childVertexInDisplay().getUri()
            ).toBe(child1.getUri())
        });

        it("can get child vertex in display even if inverse", function(){
            edge1.inverse();
            expect(
                edge1.childVertexInDisplay().getUri()
            ).toBe(child1.getUri())
        });
    });
});