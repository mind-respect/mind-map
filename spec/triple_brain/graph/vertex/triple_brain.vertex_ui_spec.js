/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/test-utils",
    "triple_brain.selection_handler"
], function (Scenarios, TestUtils, SelectionHandler) {
    "use strict";
    describe("vertex_ui", function () {
        it("removes suggestions related to an identification when identification removed", function () {
            var vertexWithEventRelatedSuggestions = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
            expect(
                vertexWithEventRelatedSuggestions.getSuggestions().length
            ).toBe(2);
            vertexWithEventRelatedSuggestions.addSuggestions([
                    new Scenarios.getKaraokeSchemaGraph().getInviteesPropertyAsSuggestion()
                ]
            );
            expect(
                vertexWithEventRelatedSuggestions.getSuggestions().length
            ).toBe(3);
            vertexWithEventRelatedSuggestions.impactOnRemovedIdentification(
                vertexWithEventRelatedSuggestions.getIdentifications()[0]
            );
            expect(
                vertexWithEventRelatedSuggestions.getSuggestions().length
            ).toBe(1);
        });

        it("shows suggestions when new suggestions are added", function () {
            var bubble2 = new Scenarios.threeBubblesGraph().getBubble2InTree();
            expect(
                bubble2.hasChildren()
            ).toBeFalsy();
            var suggestions = [
                new Scenarios.getKaraokeSchemaGraph().getLocationPropertyAsSuggestion()
            ];
            bubble2.addSuggestions(
                suggestions
            );
            expect(
                bubble2.hasChildren()
            ).toBeTruthy();
        });
        it("can return it's deepest child distance", function () {
            var deepGraphB1 = new Scenarios.deepGraph().getBubble1InTree();
            expect(
                deepGraphB1.getDeepestChildDistance()
            ).toBe(2);
            var centerInTree = new Scenarios.threeBubblesGraph().getBubble1InTree();
            expect(
                centerInTree.getDeepestChildDistance()
            ).toBe(1);
        });
        it("selects the parent vertex when removed", function () {
            var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var b2 = TestUtils.getChildWithLabel(
                b1,
                "r1"
            ).getTopMostChildBubble();
            SelectionHandler.setToSingleVertex(b2);
            expect(
                b1.isSelected()
            ).toBeFalsy();
            b2.remove();
            expect(
                b1.isSelected()
            ).toBeTruthy();
        });
    });
});