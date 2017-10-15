/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'jquery',
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    'triple_brain.selection_handler'
], function ($, Scenarios, TestUtils, Mock, SelectionHandler) {
    "use strict";
    describe("meta-ui-relation", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("can select tree", function () {
            var eventBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
            var relation = eventBubble.getTopMostChildBubble();
            relation.selectTree();
            expect(
                SelectionHandler.getNbSelected()
            ).toBe(2);
        });
        it("can be removed", function () {
            var eventBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
            var metaRelation = eventBubble.getTopMostChildBubble();
            var numberOfChild = eventBubble.getNumberOfChild();
            metaRelation.remove();
            expect(
                eventBubble.getNumberOfChild()
            ).toBe(numberOfChild - 1);
            expect(
                eventBubble.isSelected()
            ).toBeTruthy();
        });
        it("can return the source and destination vertex", function () {
            var eventBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
            var metaRelation = eventBubble.getTopMostChildBubble();
            expect(
                metaRelation.getSourceVertex().isVertex()
            ).toBeTruthy();
            expect(
                metaRelation.getDestinationVertex().text()
            ).toBe("Event");
        });
    });
});
