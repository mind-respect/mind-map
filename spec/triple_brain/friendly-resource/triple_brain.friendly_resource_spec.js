/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'triple_brain.friendly_resource'
], function (Scenarios, FriendlyResource) {
    "use strict";
    describe("friendly_resource", function () {
        it("includes label comment and uri when building server format from ui", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var bubble1 = scenario.getBubble1InTree();
            bubble1.setNote("some comment");
            var serverFormat = FriendlyResource.buildServerFormatFromUi(
                bubble1
            );
            var facade = FriendlyResource.fromServerFormat(
                serverFormat
            );
            expect(
                facade.getLabel()
            ).toBe("b1");
            expect(
                facade.getComment()
            ).toBe("some comment");
            expect(
                facade.getUri()
            ).toBe(bubble1.getUri());
        });
    });
});