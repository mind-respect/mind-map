/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
], function (Scenarios, TestUtils) {
    "use strict";
    describe("edge", function () {
        it("sets to private if both source and destination vertex are private", function () {
            var threeBubblesGraph = new Scenarios.threeBubblesGraph();
            var bubble1 = threeBubblesGraph.getBubble1InTree();
            var bubble2 = threeBubblesGraph.getBubble2InTree();
            expect(
                bubble1.getModel().isPublic()
            ).toBeFalsy();
            expect(
                bubble2.getModel().isPublic()
            ).toBeFalsy();
            var relation1 = TestUtils.getChildWithLabel(bubble1, "r1");
            expect(
                relation1.getModel().isPublic()
            ).toBeFalsy();
        });
        it("sets to public if both source and destination vertex are public", function () {
            var bubble1 = new Scenarios.publicPrivate().getBubble1();
            var relation1 = TestUtils.getChildWithLabel(bubble1, "r1");
            expect(
                relation1.getModel().isPublic()
            ).toBeTruthy();
        });
        it("sets to private if source or destination vertex is private", function () {
            var bubble1 = new Scenarios.publicPrivate().getBubble1();
            var relation2 = TestUtils.getChildWithLabel(bubble1, "r2");
            expect(
                relation2.getModel().isPublic()
            ).toBeFalsy();
        });
        it("makes outgoing edge private when making vertex private", function () {
            var bubble1 = new Scenarios.publicPrivate().getBubble1();
            var relation1 = TestUtils.getChildWithLabel(bubble1, "r1");
            expect(
                relation1.getModel().isPublic()
            ).toBeTruthy();
            bubble1.getModel().makePrivate();
            expect(
                relation1.getModel().isPublic()
            ).toBeFalsy();
        });
        it("makes incoming edge private when making vertex private", function () {
            var bubble2 = new Scenarios.publicPrivate().getBubble2();
            var relation1 = bubble2.getParentBubble();
            expect(
                relation1.getModel().isPublic()
            ).toBeTruthy();
            bubble2.getModel().makePrivate();
            expect(
                relation1.getModel().isPublic()
            ).toBeFalsy();
        });
        it("makes edge public when making both vertices public", function () {
            var bubble1 = new Scenarios.publicPrivate().getBubble1();
            bubble1.getModel().makePrivate();
            var relation2 = TestUtils.getChildWithLabel(bubble1, "r2");
            var bubble2 = relation2.getTopMostChildBubble();
            expect(
                relation2.getModel().isPublic()
            ).toBeFalsy();
            bubble2.getModel().makePublic();
            expect(
                relation2.getModel().isPublic()
            ).toBeFalsy();
            bubble1.getModel().makePublic();
            expect(
                relation2.getModel().isPublic()
            ).toBeTruthy();
        });
    });
});