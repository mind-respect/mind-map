/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    'test/webapp/js/test-scenarios'
], function (Scenarios) {
    "use strict";
    describe("bubble", function () {
        var bubble1,
            bubble2,
            relation1;
        beforeEach(function () {
            var scenario = new Scenarios.threeBubblesGraph();
            bubble1 = scenario.getCenterBubbleInTree();
            bubble2 = scenario.getBubble2InTree();
            relation1 = scenario.getRelation1InTree();
        });
        it("can return relation with ui parent", function () {
            var relationWithParent = bubble2.getRelationWithUiParent();
            expect(
                relationWithParent.getUri()
            ).toBe(relation1.getUri());
        });
        it("can visit immediate vertices child", function () {
            var hasVisited = false;
            bubble1.visitVerticesChildren(function (vertex) {
                expect(
                        "b2" === vertex.text() ||
                        "b3" === vertex.text()
                ).toBeTruthy();
                hasVisited = true;
            });
            expect(hasVisited).toBeTruthy();
        });
    });
});