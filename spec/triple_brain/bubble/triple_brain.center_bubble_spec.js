/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.center_bubble",
    'test/test-scenarios'
], function (CenterBubble, Scenarios) {
    "use strict";
    describe("center_bubble", function () {
        var centerBubble,
            relation1,
            relation2;
        beforeEach(function () {
            var scenario = new Scenarios.threeBubblesGraph();
            centerBubble = CenterBubble.usingBubble(
                scenario.getCenterBubbleInTree()
            );
            relation1 = scenario.getRelation1();
            relation2 = scenario.getRelation2();
        });
        it("can get to the left and right top most child", function () {
            var leftChildUri = centerBubble.getToTheLeftTopMostChild().getUri(),
                rightChildUri = centerBubble.getToTheRightTopMostChild().getUri();
            expect(
                    leftChildUri !== rightChildUri
            ).toBeTruthy();
            expect(
                    relation1.getUri() === leftChildUri ||
                    relation2.getUri() === leftChildUri
            ).toBeTruthy();
            expect(
                    relation1.getUri() === rightChildUri ||
                    relation2.getUri() === rightChildUri
            ).toBeTruthy();
        });
    });
});